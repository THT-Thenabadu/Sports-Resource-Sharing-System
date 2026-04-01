const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const isAdmin = require('../middleware/isAdmin');

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

    if (!password) return res.status(400).json({ message: 'Password is required' });

    const candidates = [email, identifier, username, name].filter(
      (v) => v && String(v).trim().length > 0
    );

    if (candidates.length !== 1) {
      return res.status(400).json({ message: 'Please provide exactly one identifier.' });
    }

    const raw = String(candidates[0]).trim();
    const looksLikeEmail = raw.includes('@');
    const user = looksLikeEmail
      ? await User.findOne({ email: raw })
      : await User.findOne({
          name: { $regex: new RegExp(`^${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name }, // ✅ name added
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
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, name: req.user.name, role: req.user.role },
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

// ─── Me Route ─────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Refresh Token ────────────────────────────────────────
router.get('/refresh-token', verifyToken, async (req, res) => { // ✅ new
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Users (admin only) ───────────────────────────
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Role (admin only) ─────────────────────────────
router.patch('/update-role/:userId', isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Make Admin (admin only) ──────────────────────────────
router.patch('/make-admin/:userId', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = 'admin';
    await user.save();
    res.status(200).json({ message: `${user.name} is now an admin` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;