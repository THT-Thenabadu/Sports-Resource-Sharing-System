const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['customer', 'owner', 'admin'], default: 'customer' },
  institution: { type: String, default: 'None' },
  businessName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);