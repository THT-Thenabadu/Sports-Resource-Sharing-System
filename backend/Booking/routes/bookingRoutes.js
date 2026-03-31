const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../../middleware/authMiddleware'); // Import the auth middleware

// ⚠️ /slots must come before /:id
router.get('/slots/:facilityId/:date', bookingController.getAvailableSlots);

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', protect, bookingController.createBooking);
router.put('/:id', protect, bookingController.updateBooking);
router.delete('/:id', protect, bookingController.cancelBooking);

// Payment endpoints
router.post('/:id/pay/card', protect, bookingController.payByCard);
router.post('/:id/pay/onsite', protect, bookingController.payOnsite);

// Optional payment endpoints (register only if implemented)
if (typeof bookingController.paySharedShare === 'function') {
    router.post('/:id/shared/pay/:shareIndex', bookingController.paySharedShare);
}
if (typeof bookingController.getSharedStatus === 'function') {
    router.get('/:id/shared/status', bookingController.getSharedStatus);
}

module.exports = router;
