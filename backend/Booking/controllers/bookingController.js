const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const Property = require('../../models/Property');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

function signShareToken(bookingId, shareIndex) {
    return jwt.sign(
        { bookingId, shareIndex },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function verifyShareToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}



// ─── GET /api/bookings/slots/:facilityId/:date ───
// Returns available time slots for a facility on a specific date
const getAvailableSlots = async (req, res) => {
    try {
// <<<<<<< HEAD
        await expireStalePendingBookings();
        const { facilityId, date } = req.params;

        const facility = await Property.findById(facilityId);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        if (facility.status !== 'active') {
            return res.status(400).json({ message: 'Property is not active' });
        }

        const allSlots = generateSlots(
            facility.openingTime || '06:00',
            facility.closingTime || '22:00',
            1 // Default slot duration for properties to 1 hour
        );

// =======
//         const { facilityId, date } = req.params;
//
//         // 1. Find the facility to get slot duration and operating hours
//         let isPropertyMode = false;
//         let facility = await Facility.findById(facilityId);
//         let property = null;
//
//         if (!facility) {
//             property = await Property.findById(facilityId);
//             if (!property) {
//                 return res.status(404).json({ message: 'Facility or Property not found' });
//             }
//             isPropertyMode = true;
//         } else {
//             if (facility.status === 'under_repair') {
//                 return res.status(400).json({ message: 'Facility is currently under repair and not available for booking' });
//             }
//         }
//
//         let slotDuration = isPropertyMode ? 1 : facility.slotDuration;
//         let openTime = isPropertyMode ? (property.openingTime || '06:00') : facility.operatingHours.open;
//         let closeTime = isPropertyMode ? (property.closingTime || '22:00') : facility.operatingHours.close;
//
//         // 2. Generate all possible slots based on facility/property config
//         const allSlots = generateSlots(
//             openTime,
//             closeTime,
//             slotDuration
//         );
//
//         // 3. Find existing confirmed bookings for this facility on this date
// >>>>>>> origin/feature-security01
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

// <<<<<<< HEAD
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
                name: facility.title,
                type: facility.propertyType,
                institution: facility.city,
                slotDuration: 1
            },
            date,
            slots: slotsWithStatus
// =======
//         const existingBookings = await Booking.find({
//             facilityId,
//             date: { $gte: bookingDate, $lt: nextDay },
//             status: { $in: ['pending', 'confirmed', 'checkedin'] }
//         });
//
//         // 4. Mark each slot as available or booked
//         const slotsWithAvailability = allSlots.map(slot => {
//             const isBooked = existingBookings.some(
//                 booking => booking.startTime === slot.startTime && booking.endTime === slot.endTime
//             );
//             return {
//                 ...slot,
//                 available: !isBooked
//             };
//         });
//
//         const facilityResponse = isPropertyMode ? {
//             id: property._id,
//             name: property.title,
//             type: property.propertyType,
//             institution: 'Property Owner', // or extract owner name if populated
//             slotDuration: 1
//         } : {
//             id: facility._id,
//             name: facility.name,
//             type: facility.type,
//             institution: facility.institution,
//             slotDuration: facility.slotDuration
//         };
//
//         res.json({
//             facility: facilityResponse,
//             date,
//             slots: slotsWithAvailability
// >>>>>>> origin/feature-security01
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─── POST /api/bookings — Create a new booking ───
// This is the CORE function with double-booking prevention
const createBooking = async (req, res) => {
// <<<<<<< HEAD
    // --- START DIAGNOSTIC LOG ---
    console.log('--- Received request to create booking ---');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    // --- END DIAGNOSTIC LOG ---

    try {
        await expireStalePendingBookings();
        // User details are now from the authenticated user (req.user)
        const { facilityId, date, startTime, endTime, paymentMethod, totalAmount, shareEnabled, totalShares } = req.body;
        const { _id: userId, name: userName } = req.user; // Get user from `protect` middleware

        const facility = await Property.findById(facilityId);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }
        if (facility.status !== 'active') {
            return res.status(400).json({ message: 'Property is not active' });
        }

// =======
//     try {
//         const { facilityId, userId, userName, date, startTime, endTime } = req.body;
//
//         // 1. Validate the facility or property exists and is available
//         let isPropertyMode = false;
//         let facility = await Facility.findById(facilityId);
//         let property = null;
//
//         if (!facility) {
//             property = await Property.findById(facilityId);
//             if (!property) {
//                 return res.status(404).json({ message: 'Facility or Property not found' });
//             }
//             isPropertyMode = true;
//         } else {
//             if (facility.status === 'under_repair') {
//                 return res.status(400).json({ message: 'Facility is currently under repair' });
//             }
//         }
//
//         let expectedSlotDuration = isPropertyMode ? 1 : facility.slotDuration;
//
//         // 2. Validate slot duration matches expected type
//         const [startH, startM] = startTime.split(':').map(Number);
//         const [endH, endM] = endTime.split(':').map(Number);
//         const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
//
//         if (durationHours !== expectedSlotDuration) {
//             return res.status(400).json({
//                 message: `Invalid slot duration. Required ${expectedSlotDuration}-hour slots, but got ${durationHours}-hour slot.`
//             });
//         }
//
//         // 3. ⚠️ DOUBLE-BOOKING PREVENTION ⚠️
//         // Check if there's any existing confirmed booking that overlaps with the requested time
//         // This is similar to Spring's @Transactional — we query then insert.
//         // For production, you'd use MongoDB transactions for full atomicity.
// >>>>>>> origin/feature-security01
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

// <<<<<<< HEAD
        // Prevent double-booking: check for 'confirmed' OR active 'pending_payment'
        const overlappingBooking = await Booking.findOne({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: { $in: ['confirmed', 'pending_payment', 'blocked'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            holdExpiresAt: { $gt: new Date() } // Only consider pending bookings that haven't expired
// =======
//         const overlappingBooking = await Booking.findOne({
//             facilityId,
//             date: { $gte: bookingDate, $lt: nextDay },
//             status: { $in: ['pending', 'confirmed', 'checkedin'] },
//             // Overlap condition: existing.start < requested.end AND existing.end > requested.start
//             startTime: { $lt: endTime },
//             endTime: { $gt: startTime }
// >>>>>>> origin/feature-security01
        });

        if (overlappingBooking) {
            return res.status(409).json({
// <<<<<<< HEAD
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
            accessCode: crypto.randomBytes(3).toString('hex').toUpperCase(),
            paymentMethod,
            totalAmount,
            shareEnabled,
            totalShares: shareEnabled ? totalShares : 0,
            facilityName: facility.title,
            facilityType: facility.propertyType,
            institution: facility.city,
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
// =======
//                 message: 'This time slot is already booked. Please choose a different slot.',
// >>>>>>> origin/feature-security01
                conflictingBooking: {
                    startTime: overlappingBooking.startTime,
                    endTime: overlappingBooking.endTime,
                    userName: overlappingBooking.userName
                }
            });
        }

// <<<<<<< HEAD
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
// =======
//         // 4. Create the booking
//         const booking = new Booking({
//             facilityId,
//             facilityName: isPropertyMode ? property.title : facility.name,
//             facilityType: isPropertyMode ? property.propertyType : facility.type,
//             institution: isPropertyMode ? 'Property Owner' : facility.institution,
//             userId,
//             userName,
//             date: bookingDate,
//             startTime,
//             endTime,
//             accessCode: crypto.randomBytes(3).toString('hex').toUpperCase(),
//             status: 'pending'
//         });
//
//         const savedBooking = await booking.save();
//         res.status(201).json(savedBooking);
//
//     } catch (error) {
//         res.status(400).json({ message: 'Booking failed', error: error.message });
//     }
// };
//
// // ─── POST /api/bookings/batch — Create a batch of bookings ───
// const createBatchBooking = async (req, res) => {
//     try {
//         const { facilityId, userId, userName, date, slots } = req.body;
//
//         if (!slots || !Array.isArray(slots) || slots.length === 0) {
//             return res.status(400).json({ message: 'No slots provided' });
//         }
//
//         if (slots.length > 3) {
//             return res.status(400).json({ message: 'Maximum 3 slots allowed per booking.' });
//         }
//
//         // 1. Validate the facility or property exists and is available
//         let isPropertyMode = false;
//         let facility = await Facility.findById(facilityId);
//         let property = null;
//
//         if (!facility) {
//             property = await Property.findById(facilityId);
//             if (!property) {
//                 return res.status(404).json({ message: 'Facility or Property not found' });
//             }
//             isPropertyMode = true;
//         } else {
//             if (facility.status === 'under_repair') {
//                 return res.status(400).json({ message: 'Facility is currently under repair' });
//             }
//         }
//
//         let expectedSlotDuration = isPropertyMode ? 1 : facility.slotDuration;
//
//         // 2 & 3. Iterate over all slots to validate duration and check for overlaps BEFORE saving any
//         const bookingDate = new Date(date);
//         bookingDate.setHours(0, 0, 0, 0);
//         const nextDay = new Date(bookingDate);
//         nextDay.setDate(nextDay.getDate() + 1);
//
//         for (const slot of slots) {
//             const { startTime, endTime } = slot;
//             const [startH, startM] = startTime.split(':').map(Number);
//             const [endH, endM] = endTime.split(':').map(Number);
//             const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
//
//             if (durationHours !== expectedSlotDuration) {
//                 return res.status(400).json({
//                     message: `Invalid slot duration for ${startTime}-${endTime}. Required ${expectedSlotDuration}-hour slots.`
//                 });
//             }
//
//             const overlappingBooking = await Booking.findOne({
//                 facilityId,
//                 date: { $gte: bookingDate, $lt: nextDay },
//                 status: { $in: ['pending', 'confirmed', 'checkedin'] },
//                 startTime: { $lt: endTime },
//                 endTime: { $gt: startTime }
//             });
//
//             if (overlappingBooking) {
//                 return res.status(409).json({
//                     message: `Time slot ${startTime}-${endTime} is already booked. Please refresh and try again.`,
//                     conflictingBooking: {
//                         startTime: overlappingBooking.startTime,
//                         endTime: overlappingBooking.endTime,
//                         userName: overlappingBooking.userName
//                     }
//                 });
//             }
//         }
//
//         // 4. Generate one shared access code
//         const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
//
//         // 5. Create and save all bookings
//         const savedBookings = [];
//         for (const slot of slots) {
//             const booking = new Booking({
//                 facilityId,
//                 facilityName: isPropertyMode ? property.title : facility.name,
//                 facilityType: isPropertyMode ? property.propertyType : facility.type,
//                 institution: isPropertyMode ? 'Property Owner' : facility.institution,
//                 userId,
//                 userName,
//                 date: bookingDate,
//                 startTime: slot.startTime,
//                 endTime: slot.endTime,
//                 accessCode,
//                 status: 'pending'
//             });
//             const saved = await booking.save();
//             savedBookings.push(saved);
//         }
//
//         res.status(201).json({ bookings: savedBookings, accessCode, _id: savedBookings[0]._id });
//
//     } catch (error) {
//         res.status(400).json({ message: 'Batch booking failed', error: error.message });
// >>>>>>> origin/feature-security01
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
// <<<<<<< HEAD
        const isAdminOrOwner = req.user && (req.user.role === 'admin' || req.user.role === 'owner');
        if (!isAdminOrOwner) return res.status(403).json({ message: 'Forbidden: Admins only' });

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { ...req.body }, // Allow admin to update any field
// =======
//         // Only allow updating status (e.g., cancellation)
//         const { status } = req.body;
//         const booking = await Booking.findByIdAndUpdate(
//             req.params.id,
//             { status },
// >>>>>>> origin/feature-security01
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
// <<<<<<< HEAD
            { status: 'cancelled' }, // Correctly uses 'status'
// =======
//             { status: 'cancelled' },
// >>>>>>> origin/feature-security01
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

// ─── POST /api/bookings/:id/shared/link/:shareIndex (protected) ───
// Generate a share-payment link that teammates can use (after login) to pay a specific share.
const createSharePaymentLink = async (req, res) => {
    try {
        const { id, shareIndex } = req.params;
        const shareIdx = Number(shareIndex);

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (!Array.isArray(booking.sharedPayments) || booking.sharedPayments.length === 0) {
            return res.status(400).json({ message: 'This booking is not configured for shared payments' });
        }

        if (!Number.isInteger(shareIdx) || shareIdx < 1 || shareIdx > booking.sharedPayments.length) {
            return res.status(400).json({ message: 'Invalid share index' });
        }

        // Only booking owner (head person) or admins/owners can generate share links.
        // Note: role "owner" here is platform owner/admin-ish (matches existing codebase role checks).
        if (String(booking.userId) !== String(req.user._id) && req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Not authorized to generate share links for this booking' });
        }

        const share = booking.sharedPayments.find((s) => Number(s.shareIndex) === shareIdx);
        if (!share) return res.status(404).json({ message: 'Share not found' });

        if (share.status === 'paid') {
            return res.status(409).json({ message: 'This share has already been paid' });
        }

        const token = signShareToken(booking._id.toString(), shareIdx);
        const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontend}/booking/shared-pay?token=${encodeURIComponent(token)}`;

        return res.status(200).json({ bookingId: booking._id, shareIndex: shareIdx, token, url });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ─── GET /api/bookings/shared/context?token=... (public) ───
// Used by teammate share-payment page to display booking/share info.
// Payment is still done via protected /shared/pay.
const getSharePaymentContext = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        let decoded;
        try {
            decoded = verifyShareToken(String(token));
        } catch {
            return res.status(401).json({ message: 'Invalid or expired share token' });
        }

        const { bookingId, shareIndex } = decoded;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const share = booking.sharedPayments?.find((s) => Number(s.shareIndex) === Number(shareIndex));
        if (!share) return res.status(404).json({ message: 'Share not found' });

        return res.status(200).json({
            booking: {
                _id: booking._id,
                facilityName: booking.facilityName,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                totalAmount: booking.totalAmount,
                shareAmount: booking.shareAmount,
                paymentStatus: booking.paymentStatus,
            },
            share: {
                shareIndex: share.shareIndex,
                status: share.status,
                payerName: share.payerName || '',
                payerContact: share.payerContact || '',
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
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

        const facility = await Property.findById(facilityId);
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
            facilityName: facility.title,
            facilityType: facility.propertyType,
            institution: facility.city,
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
    requestChange, // Export requestChange
    getSharePaymentContext,
    createSharePaymentLink,
};
// =======
// module.exports = {
//     getAvailableSlots,
//     createBooking,
//     createBatchBooking,
//     getAllBookings,
//     getBookingById,
//     updateBooking,
//     cancelBooking
// };
//
// >>>>>>> origin/feature-security01
