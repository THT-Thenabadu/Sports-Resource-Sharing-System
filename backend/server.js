const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

//middleware — manual CORS (cors package has issues with Express 5)
app.use((req, res, next) => {
    const allowedOrigin = req.headers.origin || 'http://localhost:3000';
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});
app.use(express.json());


//routes
app.get('/', (req, res) => {
    res.json({message: 'API is running!'});
});

// Booking Component Routes
const facilityRoutes = require('./Booking/routes/facilityRoutes');
const bookingRoutes = require('./Booking/routes/bookingRoutes');
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);

// Global error handler — catches async errors from Express 5 route handlers
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

//Connection to MONGODB and start server

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('MongoDB Connected');
        app.listen(5001, () => console.log('Server running on port 5001'));
    })
    .catch(err => console.error('MongoDB connection error:', err));
