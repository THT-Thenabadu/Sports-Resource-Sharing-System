const express = require('express');
const router = express.Router();
const {
    getAvailableSlots,
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    cancelBooking
} = require('../controllers/bookingController');

// GET    /api/bookings                          — List all bookings (with filters)
// GET    /api/bookings/slots/:facilityId/:date  — Get available slots
// GET    /api/bookings/:id                      — Get single booking
// POST   /api/bookings                          — Create a booking
// PUT    /api/bookings/:id                      — Update a booking
// DELETE /api/bookings/:id                      — Cancel a booking

// ⚠️ Important: /slots route must come BEFORE /:id route
// Otherwise Express treats "slots" as an :id parameter
router.get('/slots/:facilityId/:date', getAvailableSlots);

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', cancelBooking);

module.exports = router;

