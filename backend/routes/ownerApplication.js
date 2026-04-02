const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const OwnerApplication = require('../models/OwnerApplication');
const User = require('../models/User');
const isAdmin = require('../middleware/isAdmin');

// ─── Verify Token Middleware ──────────────────────────────
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ─── Submit Application (customer only) ──────────────────
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const {
      businessName, businessType, phone, idNumber,
      country, province, address,
      propertyCount, bio
    } = req.body;

    // ✅ Check if already applied
    const existing = await OwnerApplication.findOne({ user: req.user.id });

    if (existing) {
      // ✅ Allow reapply only if previously rejected
      if (existing.status === 'rejected') {
        existing.businessName = businessName;
        existing.businessType = businessType;
        existing.phone = phone;
        existing.idNumber = idNumber;
        existing.country = country;
        existing.province = province;
        existing.address = address;
        existing.propertyCount = propertyCount;
        existing.bio = bio;
        existing.status = 'pending'; // ✅ reset back to pending
        await existing.save();

        return res.status(200).json({
          message: 'Application resubmitted successfully! Under review.',
          application: existing
        });
      }

      // Still pending or approved — block reapply
      return res.status(400).json({
        message: existing.status === 'pending'
          ? 'You already have a pending application.'
          : 'You are already an approved owner.',
        status: existing.status
      });
    }

    // Fresh application
    const application = new OwnerApplication({
      user: req.user.id,
      businessName, businessType, phone, idNumber,
      country, province, address,
      propertyCount, bio,
      status: 'pending'
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully! Under review.',
      application
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Applications (admin only) ───────────────────
router.get('/all', isAdmin, async (req, res) => {
  try {
    const applications = await OwnerApplication.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Approve Application (admin only) ────────────────────
router.patch('/approve/:id', isAdmin, async (req, res) => {
  try {
    const application = await OwnerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Update application status
    application.status = 'approved';
    await application.save();

    // ✅ Update user role to owner
    await User.findByIdAndUpdate(application.user, { role: 'owner' });

    res.status(200).json({ message: 'Application approved. User is now an owner.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Reject Application (admin only) ─────────────────────
router.patch('/reject/:id', isAdmin, async (req, res) => {
  try {
    const application = await OwnerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = 'rejected';
    await application.save();

    res.status(200).json({ message: 'Application rejected.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get My Application Status (customer) ────────────────
router.get('/my-status', verifyToken, async (req, res) => {
  try {
    const application = await OwnerApplication.findOne({ user: req.user.id });
    if (!application) return res.status(404).json({ message: 'No application found' });
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;