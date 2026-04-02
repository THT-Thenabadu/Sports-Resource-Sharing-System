const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const Property = require('../../models/Property');
const crypto = require('crypto');

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

// ─── GET /api/bookings/slots/:facilityId/:date ───
// Returns available time slots for a facility on a specific date
const getAvailableSlots = async (req, res) => {
    try {
        const { facilityId, date } = req.params;

        // 1. Find the facility to get slot duration and operating hours
        let isPropertyMode = false;
        let facility = await Facility.findById(facilityId);
        let property = null;

        if (!facility) {
            property = await Property.findById(facilityId);
            if (!property) {
                return res.status(404).json({ message: 'Facility or Property not found' });
            }
            isPropertyMode = true;
        } else {
            if (facility.status === 'under_repair') {
                return res.status(400).json({ message: 'Facility is currently under repair and not available for booking' });
            }
        }

        let slotDuration = isPropertyMode ? 1 : facility.slotDuration;
        let openTime = isPropertyMode ? (property.openingTime || '06:00') : facility.operatingHours.open;
        let closeTime = isPropertyMode ? (property.closingTime || '22:00') : facility.operatingHours.close;

        // 2. Generate all possible slots based on facility/property config
        const allSlots = generateSlots(
            openTime,
            closeTime,
            slotDuration
        );

        // 3. Find existing confirmed bookings for this facility on this date
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingBookings = await Booking.find({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: { $in: ['pending', 'confirmed', 'checkedin'] }
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

        const facilityResponse = isPropertyMode ? {
            id: property._id,
            name: property.title,
            type: property.propertyType,
            institution: 'Property Owner', // or extract owner name if populated
            slotDuration: 1
        } : {
            id: facility._id,
            name: facility.name,
            type: facility.type,
            institution: facility.institution,
            slotDuration: facility.slotDuration
        };

        res.json({
            facility: facilityResponse,
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
    try {
        const { facilityId, userId, userName, date, startTime, endTime } = req.body;

        // 1. Validate the facility or property exists and is available
        let isPropertyMode = false;
        let facility = await Facility.findById(facilityId);
        let property = null;

        if (!facility) {
            property = await Property.findById(facilityId);
            if (!property) {
                return res.status(404).json({ message: 'Facility or Property not found' });
            }
            isPropertyMode = true;
        } else {
            if (facility.status === 'under_repair') {
                return res.status(400).json({ message: 'Facility is currently under repair' });
            }
        }

        let expectedSlotDuration = isPropertyMode ? 1 : facility.slotDuration;

        // 2. Validate slot duration matches expected type
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

        if (durationHours !== expectedSlotDuration) {
            return res.status(400).json({
                message: `Invalid slot duration. Required ${expectedSlotDuration}-hour slots, but got ${durationHours}-hour slot.`
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

        const overlappingBooking = await Booking.findOne({
            facilityId,
            date: { $gte: bookingDate, $lt: nextDay },
            status: { $in: ['pending', 'confirmed', 'checkedin'] },
            // Overlap condition: existing.start < requested.end AND existing.end > requested.start
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

        // 4. Create the booking
        const booking = new Booking({
            facilityId,
            facilityName: isPropertyMode ? property.title : facility.name,
            facilityType: isPropertyMode ? property.propertyType : facility.type,
            institution: isPropertyMode ? 'Property Owner' : facility.institution,
            userId,
            userName,
            date: bookingDate,
            startTime,
            endTime,
            accessCode: crypto.randomBytes(3).toString('hex').toUpperCase(),
            status: 'pending'
        });

        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);

    } catch (error) {
        res.status(400).json({ message: 'Booking failed', error: error.message });
    }
};

// ─── POST /api/bookings/batch — Create a batch of bookings ───
const createBatchBooking = async (req, res) => {
    try {
        const { facilityId, userId, userName, date, slots } = req.body;

        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ message: 'No slots provided' });
        }
        
        if (slots.length > 3) {
            return res.status(400).json({ message: 'Maximum 3 slots allowed per booking.' });
        }

        // 1. Validate the facility or property exists and is available
        let isPropertyMode = false;
        let facility = await Facility.findById(facilityId);
        let property = null;

        if (!facility) {
            property = await Property.findById(facilityId);
            if (!property) {
                return res.status(404).json({ message: 'Facility or Property not found' });
            }
            isPropertyMode = true;
        } else {
            if (facility.status === 'under_repair') {
                return res.status(400).json({ message: 'Facility is currently under repair' });
            }
        }

        let expectedSlotDuration = isPropertyMode ? 1 : facility.slotDuration;

        // 2 & 3. Iterate over all slots to validate duration and check for overlaps BEFORE saving any
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        for (const slot of slots) {
            const { startTime, endTime } = slot;
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

            if (durationHours !== expectedSlotDuration) {
                return res.status(400).json({
                    message: `Invalid slot duration for ${startTime}-${endTime}. Required ${expectedSlotDuration}-hour slots.`
                });
            }

            const overlappingBooking = await Booking.findOne({
                facilityId,
                date: { $gte: bookingDate, $lt: nextDay },
                status: { $in: ['pending', 'confirmed', 'checkedin'] },
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            });

            if (overlappingBooking) {
                return res.status(409).json({
                    message: `Time slot ${startTime}-${endTime} is already booked. Please refresh and try again.`,
                    conflictingBooking: {
                        startTime: overlappingBooking.startTime,
                        endTime: overlappingBooking.endTime,
                        userName: overlappingBooking.userName
                    }
                });
            }
        }

        // 4. Generate one shared access code
        const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        // 5. Create and save all bookings
        const savedBookings = [];
        for (const slot of slots) {
            const booking = new Booking({
                facilityId,
                facilityName: isPropertyMode ? property.title : facility.name,
                facilityType: isPropertyMode ? property.propertyType : facility.type,
                institution: isPropertyMode ? 'Property Owner' : facility.institution,
                userId,
                userName,
                date: bookingDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                accessCode,
                status: 'pending'
            });
            const saved = await booking.save();
            savedBookings.push(saved);
        }

        res.status(201).json({ bookings: savedBookings, accessCode, _id: savedBookings[0]._id });

    } catch (error) {
        res.status(400).json({ message: 'Batch booking failed', error: error.message });
    }
};

// ─── GET /api/bookings — List bookings with filters ───
const getAllBookings = async (req, res) => {
    try {
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

module.exports = {
    getAvailableSlots,
    createBooking,
    createBatchBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    cancelBooking
};

