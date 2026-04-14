const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // ✅ moved to top
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin'); // ✅ must be here

// Middleware to check for admin or owner roles
const isOwnerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }
};

// ─── Register Route ───────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName, institution } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, businessName, institution });
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
      { id: user._id, role: user.role, institution: user.institution },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
      _id: user._id,
      institution: user.institution
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
        role: req.user.role,   // ✅ add role
        institution: req.user.institution
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

// ─── User Management Routes (Admin/Owner only) ─────────────
router.get('/users', protect, isOwnerOrAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.patch('/update-role/:id', protect, isOwnerOrAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (role !== 'owner' && role !== 'customer') {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Prevent admin role from being changed
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot change the role of an admin.' });
        }
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role.' });
    }
});

module.exports = router;