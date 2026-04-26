const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  facilityId: {
    type: String,
    required: true
  },
  facilityName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Review', 'Complaint'],
    required: true
  },
  facilityQuality: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    required: [function () { return this.type === 'Review'; }, 'Facility quality is required for reviews']
  },
  staffHelpfulness: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    required: [function () { return this.type === 'Review'; }, 'Staff helpfulness is required for reviews']
  },
  safetyCleanliness: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    required: [function () { return this.type === 'Review'; }, 'Safety and cleanliness is required for reviews']
  },
  overallExperience: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    required: [function () { return this.type === 'Review'; }, 'Overall experience is required for reviews']
  },
  reviewText: {
    type: String,
    trim: true,
    minlength: [10, 'Review text must be at least 10 characters long'],
    maxlength: [500, 'Review text cannot exceed 500 characters'],
    required: [function () { return this.type === 'Complaint' || this.type === 'Review'; }, 'Review text is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: function () {
      return this.type === 'Complaint' ? 'Pending' : undefined;
    }
  },
  messages: [messageSchema],

  ticketNumber: {
    type: String,
    unique: true,
    sparse: true,
    default: function () {
      if (this.type === 'Complaint') {
        return 'TKT-' + Math.floor(100000 + Math.random() * 900000);
      }
      return undefined;
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
