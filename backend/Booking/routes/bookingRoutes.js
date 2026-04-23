const express = require('express');
const router = express.Router();
// <<<<<<< ours
const bookingController = require('../controllers/bookingController');
const { protect } = require('../../middleware/authMiddleware'); // Import the auth middleware

// ⚠️ /slots must come before /:id
router.get('/slots/:facilityId/:date', bookingController.getAvailableSlots);

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/block', protect, bookingController.blockSlot); // Admin block slot
router.post('/:id/request-change', protect, bookingController.requestChange); // For user change request
router.post('/', protect, bookingController.createBooking);
router.put('/:id', protect, bookingController.updateBooking); // For admin edits & cancel logic overrides
router.delete('/:id', protect, bookingController.cancelBooking);

// Payment endpoints
router.post('/:id/pay/card', protect, bookingController.payByCard);
router.post('/:id/pay/onsite', protect, bookingController.payOnsite);

// Public share-payment context lookup (token-based)
router.get('/shared/context', bookingController.getSharePaymentContext);

// Generate share-payment links (booking owner/admin)
router.post('/:id/shared/link/:shareIndex', protect, bookingController.createSharePaymentLink);

// Optional payment endpoints (register only if implemented)
if (typeof bookingController.paySharedShare === 'function') {
    router.post('/:id/shared/pay/:shareIndex', protect, bookingController.paySharedShare);
}
if (typeof bookingController.getSharedStatus === 'function') {
    router.get('/:id/shared/status', bookingController.getSharedStatus);
}

module.exports = router;
// =======
// const {
//     getAvailableSlots,
//     createBooking,
//     createBatchBooking,
//     getAllBookings,
//     getBookingById,
//     updateBooking,
//     cancelBooking
// } = require('../controllers/bookingController');

// GET    /api/bookings                          — List all bookings (with filters)
// GET    /api/bookings/slots/:facilityId/:date  — Get available slots
// GET    /api/bookings/:id                      — Get single booking
// POST   /api/bookings                          — Create a booking
// POST   /api/bookings/batch                    — Create a batch of bookings
// PUT    /api/bookings/:id                      — Update a booking
// DELETE /api/bookings/:id                      — Cancel a booking

// ⚠️ Important: /slots route must come BEFORE /:id route
// Otherwise Express treats "slots" as an :id parameter
// router.get('/slots/:facilityId/:date', getAvailableSlots);
//
// router.get('/', getAllBookings);
// router.get('/:id', getBookingById);
// router.post('/batch', createBatchBooking);
// router.post('/', createBooking);
// router.put('/:id', updateBooking);
// router.delete('/:id', cancelBooking);
//
// module.exports = router;

// >>>>>>> theirs
