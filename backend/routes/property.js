const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Property = require('../models/Property');
const jwt = require('jsonwebtoken');

// ─── Verify Token Middleware ──────────────────────────────
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

// ─── Multer Setup for Image Uploads ──────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/properties'); // save to this folder
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// ─── Register Property ────────────────────────────────────
router.post('/register', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title, description, sportType, propertyType,
      address, city, postalCode, mapsLink,
      pricePerHour, maxPlayers, availableDays,
      openingTime, closingTime, amenities
    } = req.body;

    // Get uploaded image paths
    const imagePaths = req.files?.map(file => `/uploads/properties/${file.filename}`) || [];

    const property = new Property({
      owner: req.user.id,
      title,
      description,
      sportType,
      propertyType,
      address,
      city,
      postalCode,
      mapsLink,
      pricePerHour: Number(pricePerHour),
      maxPlayers: Number(maxPlayers),
      availableDays: JSON.parse(availableDays || '[]'),
      openingTime,
      closingTime,
      amenities: JSON.parse(amenities || '[]'),
      images: imagePaths,
      status: 'pending'
    });

    await property.save();

    res.status(201).json({
      message: 'Property submitted for review!',
      property
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Owner's Properties ───────────────────────────────
router.get('/my-properties', verifyToken, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Owner Update Availability State ──────────────────────
router.patch('/:propertyId/availability', verifyToken, async (req, res) => {
  try {
    const { availabilityState } = req.body;
    if (!['available', 'not_available'].includes(availabilityState)) {
      return res.status(400).json({ message: 'Invalid availability state.' });
    }

    const property = await Property.findOne({
      _id: req.params.propertyId,
      owner: req.user.id
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or unauthorized.' });
    }

    property.availabilityState = availabilityState;
    await property.save();

    res.status(200).json({
      message: `Property is now ${availabilityState === 'available' ? 'available' : 'not available'}.`,
      property
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Properties (public) ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find({ status: { $in: ['active', 'pending'] } })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;