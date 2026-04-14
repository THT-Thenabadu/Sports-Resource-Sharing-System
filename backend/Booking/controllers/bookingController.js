const Booking = require('../models/Booking');
const Facility = require('../models/Facility');

const PENDING_PAYMENT_WINDOW_MINUTES = 10;
const HOLD_MINUTES = 5;


// ─── Helper: Generate all possible time slots for a facility on a given day ───
function generateSlots(openTime, closeTime, durationHours) {
    const slots = [];
    let [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    const closeMinutes = closeH * 60 + closeM;

    while (true) {
        const startMinutes = openH * 60 + openM;
        const endMinutes = startMinutes + durationHours * 60;

        if (endMinutes > closeMinutes) break;

        const startTime = `${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}`;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        slots.push({ startTime, endTime });

        // Move to next slot
        openH = endH;
        openM = endM;
    }
    return slots;
}

function generatePaymentIntentId() {
    return `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generatePaymentRef() {
    return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function expireStalePendingBookings() {
    const now = new Date();
    await Booking.updateMany(
        {
            status: 'pending_payment',
            holdExpiresAt: { $lte: now }
        },
        {
            $set: {
                status: 'expired',
                paymentStatus: 'expired'
            }
        }
    );
}

// ─── GET /api/bookings/slots/:facilityId/:date ───
// Returns available time slots for a facility on a specific date
const getAvailableSlots = async (req, res) => {
    try {
        await expireStalePendingBookings();
        const { facilityId, date } = req.params;

        const facility = await Facility.findById(facilityId);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        if (facility.status === 'under_repair') {
            return res.status(400).json({ message: 'Facility is currently under repair' });
        }

        const allSlots = generateSlots(
            facility.operatingHours.open,
            facility.operatingHours.close,
            facility.slotDuration
        );

        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find all non-cancelled and non-expired bookings for the day
        const existingBookings = await Booking.find({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: { $in: ['confirmed', 'pending_payment', 'blocked'] }
        });

        const now = new Date();
        const slotsWithStatus = allSlots.map(slot => {
            const conflictingBooking = existingBookings.find(
                booking => booking.startTime < slot.endTime && booking.endTime > slot.startTime
            );

            let status = 'available';
            if (conflictingBooking) {
                if (conflictingBooking.status === 'confirmed') {
                    status = 'confirmed';
                } else if (conflictingBooking.status === 'blocked') {
                    status = 'blocked';
                } else if (conflictingBooking.status === 'pending_payment' && new Date(conflictingBooking.holdExpiresAt) > now) {
                    status = 'in_progress'; // This is a temporary hold
                }
            }

            return {
                ...slot,
                status: status
            };
        });

        res.json({
            facility: {
                id: facility._id,
                name: facility.name,
                type: facility.type,
                institution: facility.institution,
                slotDuration: facility.slotDuration
            },
            date,
            slots: slotsWithStatus
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─── POST /api/bookings — Create a new booking ───
// This is the CORE function with double-booking prevention
const createBooking = async (req, res) => {
    // --- START DIAGNOSTIC LOG ---
    console.log('--- Received request to create booking ---');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    // --- END DIAGNOSTIC LOG ---

    try {
        await expireStalePendingBookings();
        // User details are now from the authenticated user (req.user)
        const { facilityId, date, startTime, endTime, paymentMethod, totalAmount, shareEnabled, totalShares } = req.body;
        const { _id: userId, name: userName } = req.user; // Get user from `protect` middleware

        const facility = await Facility.findById(facilityId);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        if (facility.status === 'under_repair') {
            return res.status(400).json({ message: 'Facility is currently under repair' });
        }

        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Prevent double-booking: check for 'confirmed' OR active 'pending_payment'
        const overlappingBooking = await Booking.findOne({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: { $in: ['confirmed', 'pending_payment', 'blocked'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            holdExpiresAt: { $gt: new Date() } // Only consider pending bookings that haven't expired
        });

        if (overlappingBooking) {
            return res.status(409).json({
                message: 'This time slot is already booked or held. Please choose a different slot.',
            });
        }

        const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

        const booking = new Booking({
            facilityId,
            userId,
            userName,
            date,
            startTime,
            endTime,
            paymentMethod,
            totalAmount,
            shareEnabled,
            totalShares: shareEnabled ? totalShares : 0,
            facilityName: facility.name,
            facilityType: facility.type,
            institution: facility.institution,
            status: 'pending_payment',
            paymentStatus: 'unpaid',
            holdExpiresAt,
            shareAmount:
              shareEnabled && totalShares > 0 ? Number(totalAmount) / totalShares : 0,
            sharedPayments:
              shareEnabled && totalShares > 0
                ? Array.from({ length: totalShares }).map((_, i) => ({
                    shareIndex: i + 1,
                    status: 'pending',
                  }))
                : [],
        });

        const savedBooking = await booking.save();
        res.status(201).json(savedBooking.toObject());

    } catch (error) {
        console.error('--- Error in createBooking ---', error);
        res.status(500).json({ message: 'Booking failed', error: error.message });
    }
};

const settleBookingPayment = async (req, res) => {
    try {
        await expireStalePendingBookings();
        const { id } = req.params;
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: 'paymentIntentId is required' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'pending_payment' || booking.paymentStatus !== 'pending') {
            return res.status(409).json({ message: 'Booking is not in a payable state' });
        }

        if (booking.paymentIntentId !== paymentIntentId) {
            return res.status(400).json({ message: 'Invalid payment intent' });
        }

        if (booking.expiresAt <= new Date()) {
            booking.status = 'expired';
            booking.paymentStatus = 'failed';
            await booking.save();
            return res.status(409).json({ message: 'Payment window expired for this booking' });
        }

        const bookingDayStart = new Date(booking.date);
        bookingDayStart.setHours(0, 0, 0, 0);
        const bookingDayEnd = new Date(bookingDayStart);
        bookingDayEnd.setDate(bookingDayEnd.getDate() + 1);

        const overlappingBooking = await Booking.findOne({
            _id: { $ne: booking._id },
            facilityId: booking.facilityId,
            date: { $gte: bookingDayStart, $lt: bookingDayEnd },
            status: 'confirmed',
            startTime: { $lt: booking.endTime },
            endTime: { $gt: booking.startTime }
        });

        if (overlappingBooking) {
            booking.status = 'cancelled';
            booking.paymentStatus = 'failed';
            await booking.save();
            return res.status(409).json({
                message: 'Slot is no longer available. Payment not settled.',
                conflictingBooking: {
                    startTime: overlappingBooking.startTime,
                    endTime: overlappingBooking.endTime,
                    userName: overlappingBooking.userName
                }
            });
        }

        booking.status = 'confirmed';
        booking.paymentStatus = 'settled';
        booking.paymentSettledAt = new Date();
        booking.paymentRef = generatePaymentRef();

        await booking.save();

        return res.json({
            message: 'Payment settled and booking confirmed',
            booking
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─── GET /api/bookings — List bookings with filters ───
const getAllBookings = async (req, res) => {
    try {
        await expireStalePendingBookings();
        const filter = {};

        if (req.query.facilityId) filter.facilityId = req.query.facilityId;
        if (req.query.institution) filter.institution = req.query.institution;
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.status) filter.status = req.query.status;

        // Date filter
        if (req.query.date) {
            const queryDate = new Date(req.query.date);
            queryDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.date = { $gte: queryDate, $lt: nextDay };
        }

        const bookings = await Booking.find(filter)
            .sort({ date: 1, startTime: 1 })
            .populate('facilityId', 'name type institution slotDuration');

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─── GET /api/bookings/:id — Get a single booking ───
const getBookingById = async (req, res) => {
    try {
        await expireStalePendingBookings();
        const booking = await Booking.findById(req.params.id)
            .populate('facilityId', 'name type institution slotDuration');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─── PUT /api/bookings/:id — Update a booking ───
const updateBooking = async (req, res) => {
    try {
        const isAdminOrOwner = req.user && (req.user.role === 'admin' || req.user.role === 'owner');
        if (!isAdminOrOwner) return res.status(403).json({ message: 'Forbidden: Admins only' });

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { ...req.body }, // Allow admin to update any field
            { new: true, runValidators: true }
        );
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
};

const requestChange = async (req, res) => {
    try {
        const { note } = req.body;
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id.toString() },
            { changeRequest: 'pending', changeNote: note },
            { new: true, runValidators: true }
        );
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not authorized' });
        }
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: 'Change request failed', error: error.message });
    }
};

// ─── DELETE /api/bookings/:id — Cancel a booking (soft delete) ───
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' }, // Correctly uses 'status'
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Ensure the user owns the booking or is an admin
        if (booking.userId.toString() !== req.user._id.toString()) {
             return res.status(401).json({ message: 'User not authorized' });
        }
        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const expireIfNeeded = async (booking) => {
    if (!booking) return null;
    if (
        booking.status === "pending_payment" &&
        booking.holdExpiresAt &&
        new Date(booking.holdExpiresAt) <= new Date()
    ) {
        booking.status = "expired";
        booking.paymentStatus = "expired";
        if (Array.isArray(booking.sharedPayments)) {
            booking.sharedPayments = booking.sharedPayments.map((s) =>
                s.status === "paid" ? s : { ...s.toObject?.() || s, status: "expired" }
            );
        }
        await booking.save();
    }
    return booking;
};

// create booking with hold
const createPendingBooking = async (req, res) => {
    try {
        const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
        const {
            paymentMethod = "card",
            totalAmount = 0,
            shareEnabled = false,
            totalShares = 0,
        } = req.body;

        const booking = await Booking.create({
            ...req.body,
            status: "pending_payment", // Use correct field
            paymentMethod: paymentMethod,
            paymentStatus: "unpaid",
            holdExpiresAt,
            totalAmount,
            shareEnabled,
            totalShares: shareEnabled ? totalShares : 0,
            paidShares: 0,
            shareAmount:
                shareEnabled && totalShares > 0 ? Number(totalAmount) / totalShares : 0,
            sharedPayments:
                shareEnabled && totalShares > 0
                    ? Array.from({ length: totalShares }).map((_, i) => ({
                        shareIndex: i + 1,
                        status: "pending",
                    }))
                    : [],
        });

        return res.status(201).json(booking);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// simulated card payment success
const payByCard = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        await expireIfNeeded(booking);
        if (booking.status === "expired") { // Use correct field
            return res.status(409).json({ message: "Booking hold expired" });
        }

        booking.paymentMethod = "card";
        booking.paymentStatus = "paid";
        booking.status = "confirmed"; // Use correct field
        await booking.save();

        return res.json(booking);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// onsite payment (flexible: confirm now, settle onsite)
const payOnsite = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        await expireIfNeeded(booking);
        if (booking.status === "expired") { // Use correct field
            return res.status(409).json({ message: "Booking hold expired" });
        }

        booking.paymentMethod = "onsite";
        booking.paymentStatus = "unpaid";
        booking.status = "confirmed"; // Use correct field
        await booking.save();

        return res.json(booking);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// shared: pay one share
const paySharedShare = async (req, res) => {
    try {
        const { id, shareIndex } = req.params;
        const { payerName, payerContact } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        await expireIfNeeded(booking);
        if (booking.status === "expired") { // Use correct field
            return res.status(409).json({ message: "Booking hold expired" });
        }

        if (!booking.shareEnabled) {
            return res.status(400).json({ message: "Shared payment is not enabled" });
        }

        const idx = Number(shareIndex) - 1;
        if (idx < 0 || idx >= booking.sharedPayments.length) {
            return res.status(400).json({ message: "Invalid share index" });
        }

        const share = booking.sharedPayments[idx];
        if (share.status === "paid") {
            return res.status(409).json({ message: "Share already paid" });
        }

        share.status = "paid";
        share.payerName = payerName || "";
        share.payerContact = payerContact || "";
        share.paidAt = new Date();

        booking.paymentMethod = "shared";
        booking.paidShares = booking.sharedPayments.filter((s) => s.status === "paid").length;

        if (booking.paidShares >= booking.totalShares && booking.totalShares > 0) {
            booking.paymentStatus = "paid";
            booking.status = "confirmed"; // Use correct field
        } else {
            booking.paymentStatus = "partial";
            booking.status = "pending_payment"; // Use correct field
        }

        await booking.save();
        return res.json(booking);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ─── GET /api/bookings/:id/shared/status ───
const getSharedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({
            bookingStatus: booking.status,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            holdExpiresAt: booking.holdExpiresAt,
            totalShares: booking.totalShares,
            paidShares: booking.paidShares,
            sharedPayments: booking.sharedPayments,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─── POST /api/bookings/block — Block a time slot (Admin) ───
const blockSlot = async (req, res) => {
    try {
        const { facilityId, date, startTime, endTime } = req.body;
        const { _id: userId, name: userName, role } = req.user; // Get user from `protect` middleware

        if (role !== 'admin' && role !== 'owner') {
            return res.status(403).json({ message: 'Not authorized to block slots' });
        }

        const facility = await Facility.findById(facilityId);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Check if there is an existing booking
        const overlappingBooking = await Booking.findOne({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: { $in: ['confirmed', 'pending_payment', 'blocked'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (overlappingBooking) {
            return res.status(409).json({ message: 'This time slot is already booked or blocked.' });
        }

        const blockedBooking = new Booking({
            facilityId,
            userId,
            userName,
            date,
            startTime,
            endTime,
            paymentMethod: 'onsite',
            totalAmount: 0,
            facilityName: facility.name,
            facilityType: facility.type,
            institution: facility.institution,
            status: 'blocked',
            paymentStatus: 'paid', // Mark paid so it's irrelevant
            holdExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) // 100 years into future
        });

        const savedBlock = await blockedBooking.save();
        res.status(201).json(savedBlock);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAvailableSlots,
    createBooking,
    settleBookingPayment,
    getAllBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    createPendingBooking,
    payByCard,
    payOnsite,
    paySharedShare,
    getSharedStatus,
    blockSlot,
    requestChange // Export requestChange
};
