const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['customer', 'owner'], default: 'customer' },
  

  businessName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);