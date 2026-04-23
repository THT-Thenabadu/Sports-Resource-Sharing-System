const express = require('express');
const jwt = require('jsonwebtoken');
const controller = require('../controllers/securityController');

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/availability', verifyToken, controller.getAvailability);
router.get('/bookings', verifyToken, controller.getBookings);
router.patch('/bookings/:id/status', verifyToken, controller.updateBookingStatus);
router.post('/scan', verifyToken, controller.scanAccessCode);

router.get('/entry-logs', verifyToken, controller.getEntryLogs);
router.post('/entry-logs', verifyToken, controller.createEntryLog);
router.patch('/entry-logs/:id/exit', verifyToken, controller.markEntryLogExit);

router.get('/reports/summary', verifyToken, controller.getReportsSummary);
router.get('/reports/pdf', verifyToken, controller.getReportsPdf);

module.exports = router;
