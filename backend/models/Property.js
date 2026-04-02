const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  // Owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Step 1 - Basic Info
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  sportType:    { type: String, required: true },
  propertyType: { type: String, required: true },

  // Step 2 - Location
  address:    { type: String, required: true },
  city:       { type: String, required: true },
  postalCode: { type: String },
  mapsLink:   { type: String },

  // Step 3 - Pricing & Availability
  pricePerHour:  { type: Number, required: true },
  maxPlayers:    { type: Number },
  availableDays: [{ type: String }],
  openingTime:   { type: String },
  closingTime:   { type: String },

  // Step 4 - Media & Amenities
  images:    [{ type: String }], // will store image URLs/paths
  amenities: [{ type: String }],

  // Admin controlled
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  availabilityState: {
    type: String,
    enum: ['available', 'not_available'],
    default: 'available'
  },

}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);