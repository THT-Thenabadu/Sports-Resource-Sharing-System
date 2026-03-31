const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// ⚠️ /slots must come before /:id
router.get('/slots/:facilityId/:date', bookingController.getAvailableSlots);

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.cancelBooking);

// Optional payment endpoints (register only if implemented)
if (typeof bookingController.payByCard === 'function') {
    router.post('/:id/pay/card', bookingController.payByCard);
}
if (typeof bookingController.payOnsite === 'function') {
    router.post('/:id/pay/onsite', bookingController.payOnsite);
}
if (typeof bookingController.paySharedShare === 'function') {
    router.post('/:id/shared/pay/:shareIndex', bookingController.paySharedShare);
}
if (typeof bookingController.getSharedStatus === 'function') {
    router.get('/:id/shared/status', bookingController.getSharedStatus);
}

module.exports = router;
