const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Facility name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Facility type is required'],
        enum: ['pool', 'ground', 'court', 'gym', 'track'],
        lowercase: true
    },
    institution: {
        type: String,
        required: [true, 'Institution name is required'],
        trim: true
    },
    // 1 = 1-hour slots (pools, gyms), 4 = 4-hour slots (grounds, tracks)
    slotDuration: {
        type: Number,
        required: true,
        enum: [1, 4],
        default: 1
    },
    operatingHours: {
        open: { type: String, default: '06:00' },  // 24hr format
        close: { type: String, default: '22:00' }
    },
    status: {
        type: String,
        enum: ['available', 'under_repair'],
        default: 'available'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true  // adds createdAt and updatedAt automatically
});

// Ensure facility name is unique within an institution
facilitySchema.index({ name: 1, institution: 1 }, { unique: true });

module.exports = mongoose.model('Facility', facilitySchema);

