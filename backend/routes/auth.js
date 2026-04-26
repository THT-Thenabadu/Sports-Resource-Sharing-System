const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { ensureOwnerSecurityCredentials } = require('../utils/securityCredentials');

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

    if (!password) return res.status(400).json({ message: 'Password is required' });

    const candidates = [email, identifier, username, name].filter(
      (v) => v && String(v).trim().length > 0
    );

    if (candidates.length !== 1) {
      return res.status(400).json({ message: 'Please provide exactly one identifier.' });
    }

    const raw = String(candidates[0]).trim();
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const looksLikeEmail = raw.includes('@');

    let user = null;
    let usedSecurityCredential = false;
    if (looksLikeEmail) {
      user = await User.findOne({ email: raw });
    } else {
      user = await User.findOne({ securityUsername: raw });
      if (user) {
        usedSecurityCredential = true;
      } else {
        user = await User.findOne({
          name: { $regex: new RegExp(`^${escaped}$`, 'i') },
        });
      }
    }

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In." });
    }

    const passwordToCompare = usedSecurityCredential
      ? user.securityPasswordHash
      : user.password;

    if (!passwordToCompare) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, passwordToCompare);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, institution: user.institution },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      id: user._id,
      role: user.role,
      name: user.name,
      _id: user._id,
      institution: user.institution,
      dashboard: usedSecurityCredential ? 'security' : undefined
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
      {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
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
        const users = await User.find({}).select('-password').sort({ createdAt: -1 }); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.patch('/update-role/:id', protect, isOwnerOrAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (role !== 'owner' && role !== 'customer' && role !== 'admin') {
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
        res.json({ message: 'User role updated successfully.', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role.' });
    }
});

// ─── Me Route ─────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -securityPasswordHash');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Owner Security Credentials ─────────────────────
router.patch('/security-credentials', verifyToken, async (req, res) => {
  try {
    const { securityUsername, securityPassword } = req.body;

    if (!securityUsername || !securityPassword) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can update security credentials.' });
    }

    const normalizedUsername = String(securityUsername).trim().toLowerCase();
    if (normalizedUsername.length < 4) {
      return res.status(400).json({ message: 'Security username must be at least 4 characters.' });
    }
    if (normalizedUsername.includes('@')) {
      return res.status(400).json({ message: 'Security username cannot be an email address.' });
    }
    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      return res.status(400).json({ message: 'Use only lowercase letters, numbers, and underscore.' });
    }
    if (normalizedUsername === String(user.email || '').toLowerCase()) {
      return res.status(400).json({ message: 'Security username cannot match your owner login email.' });
    }

    const existingUser = await User.findOne({
      securityUsername: normalizedUsername,
      _id: { $ne: user._id }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Security username already taken.' });
    }

    const ownerLoginPasswordMatch = user.password
      ? await bcrypt.compare(securityPassword, user.password)
      : false;
    if (ownerLoginPasswordMatch) {
      return res.status(400).json({
        message: 'Security password must be different from your owner dashboard login password.'
      });
    }

    user.securityUsername = normalizedUsername;
    user.securityPasswordHash = await bcrypt.hash(securityPassword, 10);
    user.securityPasswordPlain = securityPassword;
    user.securityCredentialsCreatedAt = new Date();
    await user.save();

    res.status(200).json({
      message: 'Security credentials updated successfully.',
      securityUsername: user.securityUsername,
      securityPasswordPlain: user.securityPasswordPlain
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Refresh Token ────────────────────────────────────────
router.get('/refresh-token', verifyToken, async (req, res) => { // ✅ new
  try {
    const user = await User.findById(req.user.id).select('-password -securityPasswordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, id: user._id, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Users (admin only) ───────────────────────────
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -securityPasswordHash -securityPasswordPlain')
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Role (admin only) ─────────────────────────────
router.patch('/update-role/:userId', isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    if (role === 'owner') {
      await ensureOwnerSecurityCredentials(user);
    } else {
      await user.save();
    }

    const safeUser = await User.findById(req.params.userId).select('-password -securityPasswordHash');
    res.status(200).json({ message: `Role updated to ${role}`, user: safeUser });
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