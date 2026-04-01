const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    facilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: [true, 'Facility ID is required']
    },
    facilityName: {
        type: String,
        required: true
    },
    facilityType: {
        type: String,
        required: true
    },
    institution: {
        type: String,
        required: true
    },
    // TODO: Replace with actual user ID from auth system when integrated
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    startTime: {
        type: String,  // Format: "HH:MM" (24hr), e.g. "09:00"
        required: [true, 'Start time is required']
    },
    endTime: {
        type: String,  // Format: "HH:MM" (24hr), e.g. "10:00"
        required: [true, 'End time is required']
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    }
}, {
    timestamps: true
});

// Index for fast overlap queries — similar to a composite index in relational DBs
bookingSchema.index({ facilityId: 1, date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

