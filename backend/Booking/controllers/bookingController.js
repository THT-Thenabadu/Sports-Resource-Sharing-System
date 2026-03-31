const Booking = require('../models/Booking');
const Facility = require('../models/Facility');

const PENDING_PAYMENT_WINDOW_MINUTES = 10;
const HOLD_MINUTES = 10;


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
            paymentStatus: 'pending',
            expiresAt: { $lte: now }
        },
        {
            $set: {
                status: 'expired',
                paymentStatus: 'failed'
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

        // 1. Find the facility to get slot duration and operating hours
        const facility = await Facility.findById(facilityId);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        if (facility.status === 'under_repair') {
            return res.status(400).json({ message: 'Facility is currently under repair and not available for booking' });
        }

        // 2. Generate all possible slots based on facility config
        const allSlots = generateSlots(
            facility.operatingHours.open,
            facility.operatingHours.close,
            facility.slotDuration
        );

        // 3. Find existing confirmed bookings for this facility on this date
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingBookings = await Booking.find({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: 'confirmed'
        });

        // 4. Mark each slot as available or booked
        const slotsWithAvailability = allSlots.map(slot => {
            const isBooked = existingBookings.some(
                booking => booking.startTime === slot.startTime && booking.endTime === slot.endTime
            );
            return {
                ...slot,
                available: !isBooked
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
            slots: slotsWithAvailability
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
        const { facilityId, userId, userName, date, startTime, endTime } = req.body;

        // 1. Validate the facility exists and is available
        const facility = await Facility.findById(facilityId);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        if (facility.status === 'under_repair') {
            return res.status(400).json({ message: 'Facility is currently under repair' });
        }

        // 2. Validate slot duration matches facility type
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

        if (durationHours !== facility.slotDuration) {
            return res.status(400).json({
                message: `Invalid slot duration. ${facility.type} requires ${facility.slotDuration}-hour slots, but got ${durationHours}-hour slot.`
            });
        }

        // 3. ⚠️ DOUBLE-BOOKING PREVENTION ⚠️
        // Check if there's any existing confirmed booking that overlaps with the requested time
        // This is similar to Spring's @Transactional — we query then insert.
        // For production, you'd use MongoDB transactions for full atomicity.
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Option B: pending bookings do not block slots. Only confirmed bookings conflict.
        const overlappingBooking = await Booking.findOne({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: 'confirmed',
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (overlappingBooking) {
            return res.status(409).json({
                message: 'This time slot is already booked. Please choose a different slot.',
                conflictingBooking: {
                    startTime: overlappingBooking.startTime,
                    endTime: overlappingBooking.endTime,
                    userName: overlappingBooking.userName
                }
            });
        }

        const payload = { ...req.body };

        // --- Populate denormalized facility data ---
        payload.facilityName = facility.name;
        payload.facilityType = facility.type;
        payload.institution = facility.institution;

        // --- SERVER-SIDE DEFAULTS TO PREVENT VALIDATION ERRORS ---
        if (!payload.holdExpiresAt) {
            console.log('holdExpiresAt is missing. Setting default.');
            payload.holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        }
        if (!payload.paymentStatus || payload.paymentStatus === 'pending') {
            console.log(`paymentStatus is invalid ('${payload.paymentStatus}'). Setting default to 'unpaid'.`);
            payload.paymentStatus = 'unpaid';
        }
        if (!payload.bookingStatus) {
            payload.bookingStatus = 'pending_payment';
        }
        // --- END DEFAULTS ---

        const {
            paymentMethod = 'card',
            totalAmount = 0,
            shareEnabled = false,
            totalShares = 0,
        } = payload;

        const now = new Date();
        const expiresAt = new Date(now.getTime() + PENDING_PAYMENT_WINDOW_MINUTES * 60 * 1000);

        const booking = new Booking({
            ...payload, // Use the sanitized payload
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
                    status: 'pending',
                  }))
                : [],
        });

        const savedBooking = await booking.save();

        // --- Return a clean response without the deprecated `payment` object ---
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
        // Only allow updating status (e.g., cancellation)
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
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

// ─── DELETE /api/bookings/:id — Cancel a booking (soft delete) ───
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const expireIfNeeded = async (booking) => {
    if (!booking) return null;
    if (
        booking.bookingStatus === "pending_payment" &&
        booking.holdExpiresAt &&
        new Date(booking.holdExpiresAt) <= new Date()
    ) {
        booking.bookingStatus = "expired";
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
            bookingStatus: "pending_payment",
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
        if (booking.bookingStatus === "expired") {
            return res.status(409).json({ message: "Booking hold expired" });
        }

        booking.paymentMethod = "card";
        booking.paymentStatus = "paid";
        booking.bookingStatus = "confirmed";
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
        if (booking.bookingStatus === "expired") {
            return res.status(409).json({ message: "Booking hold expired" });
        }

        booking.paymentMethod = "onsite";
        booking.paymentStatus = "unpaid";
        booking.bookingStatus = "confirmed";
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
        if (booking.bookingStatus === "expired") {
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
            booking.bookingStatus = "confirmed";
        } else {
            booking.paymentStatus = "partial";
            booking.bookingStatus = "pending_payment";
        }

        await booking.save();
        return res.json(booking);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// backend/Booking/controllers/bookingController.js
const getSharedStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        await expireIfNeeded(booking);

        return res.json({
            bookingId: booking._id,
            bookingStatus: booking.bookingStatus,
            paymentMethod: booking.paymentMethod, // added this
            paymentStatus: booking.paymentStatus,
            holdExpiresAt: booking.holdExpiresAt,
            totalShares: booking.totalShares,
            paidShares: booking.paidShares,
            sharedPayments: booking.sharedPayments,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
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
    getSharedStatus
};
