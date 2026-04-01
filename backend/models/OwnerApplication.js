const mongoose = require('mongoose');

const ownerApplicationSchema = new mongoose.Schema({
  // Link to user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // one application per user
  },

  // Section 1 - Business Identity
  businessName:  { type: String, required: true },
  businessType:  { type: String, required: true },
  phone:         { type: String, required: true },
  idNumber:      { type: String, required: true },

  // Section 2 - Location
  country:  { type: String, required: true },
  province: { type: String, required: true },
  address:  { type: String, required: true },

  // Section 3 - Experience
  propertyCount: { type: String, required: true },
  bio:           { type: String },

  // Status — admin controls this
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

}, { timestamps: true });

module.exports = mongoose.model('OwnerApplication', ownerApplicationSchema);