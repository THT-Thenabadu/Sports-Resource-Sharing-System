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


const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], 
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

// Booking Component Routes
const facilityRoutes = require('./Booking/routes/facilityRoutes');
const bookingRoutes = require('./Booking/routes/bookingRoutes');
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);

const ownerApplicationRoutes = require('./routes/ownerApplication');
app.use('/api/owner-application', ownerApplicationRoutes);

const propertyRoutes = require('./routes/property');
app.use('/api/properties', propertyRoutes);

const securityRoutes = require('./Security/routes/securityRoutes');
app.use('/api/security', securityRoutes);

const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

// ─── Database + Start Server ──────────────────────────────
mongoose.connect(process.env.MONGODB_URI) // ✅ only one mongoose.connect
  .then(async () => {
    console.log("✅ Sportek DB Connected");
    await createSuperAdmin(); // Create super admin after DB connection

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(` Backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1); // Exit the process if DB connection fails
  });
