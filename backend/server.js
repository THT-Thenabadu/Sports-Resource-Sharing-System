require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('./config/passport'); // ✅ load passport config

const authRoutes = require('./routes/auth');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Session & Passport BEFORE routes
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

// Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Sportek DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));