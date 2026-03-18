const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth'); // Import the routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // All auth routes will start with /api/auth

// Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Sportek DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));