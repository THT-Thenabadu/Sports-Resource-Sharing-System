require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const fs = require('fs'); // ✅ moved to top

require('./config/passport');

const createSuperAdmin = require('./utils/createSuperAdmin');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000', // ✅ only one cors call
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ─── Uploads folder ───────────────────────────────────────
if (!fs.existsSync('uploads/properties')) {
  fs.mkdirSync('uploads/properties', { recursive: true });
}
app.use('/uploads', express.static('uploads'));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// ─── Database + Start Server ──────────────────────────────
mongoose.connect(process.env.MONGODB_URI) // ✅ only one mongoose.connect
  .then(async () => {
    console.log("✅ Sportek DB Connected");
    await createSuperAdmin();
    
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
  })
  .catch(err => console.log("❌ DB Error:", err));

  const ownerApplicationRoutes = require('./routes/ownerApplication');

// add this with the other routes
app.use('/api/owner-application', ownerApplicationRoutes);
