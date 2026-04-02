const mongoose = require('mongoose');

const entryLogSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  name: { type: String, required: true },
  type: { type: String, enum: ['Visitor', 'Member', 'Service'], default: 'Visitor' },
  facility: { type: String, required: true },
  entryTime: { type: String, required: true },
  exitTime: { type: String, default: '' },
  idVerified: { type: Boolean, default: false },
  logDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EntryLog', entryLogSchema);
