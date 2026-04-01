const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // ✅ moved to top
const User = require('../models/User');
const isAdmin = require('../middleware/isAdmin'); // ✅ must be here

// ─── Register Route ───────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, businessName });
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Login Route ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, identifier, username, name, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const candidates = [email, identifier, username, name].filter(
      (v) => v && String(v).trim().length > 0
    );

    // Require exactly ONE identifier (email or username/name).
    if (candidates.length !== 1) {
      return res
        .status(400)
        .json({ message: 'Please provide exactly one identifier (email or username).' });
    }

    const raw = String(candidates[0]).trim();

    // If it looks like an email, search by email. Otherwise search by `User.name`.
    const looksLikeEmail = raw.includes('@');
    const user = looksLikeEmail
      ? await User.findOne({ email: raw })
      : await User.findOne({
          name: { $regex: new RegExp(`^${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Google OAuth Routes ──────────────────────────────────
// ✅ These were accidentally pasted INSIDE the login route before
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { 
        id: req.user._id,
        name: req.user.name,  // ✅ add name
        role: req.user.role   // ✅ add role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

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

router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;