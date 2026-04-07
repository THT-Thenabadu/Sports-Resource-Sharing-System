const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');


// Get all feedback
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all feedback for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get feedback for a specific facility
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ facilityId: req.params.facilityId }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Create new feedback
router.post('/', async (req, res) => {
  try {
    const { userId, facilityId, facilityName, type, facilityQuality, staffHelpfulness, safetyCleanliness, overallExperience, reviewText } = req.body;

    if (!userId || !facilityId || !facilityName || !type) {
      return res.status(400).json({ error: 'Missing required metadata: userId, facilityId, facilityName, or type.' });
    }

    if (!['Review', 'Complaint'].includes(type)) {
      return res.status(400).json({ error: 'Invalid feedback type. Must be Review or Complaint.' });
    }

    if (!reviewText || reviewText.trim().length === 0) {
      return res.status(400).json({ error: 'Description/Review text is required and cannot be empty.' });
    }

    if (/^\d+$/.test(reviewText.trim())) {
      return res.status(400).json({ error: 'Text cannot consist only of numbers.' });
    }

    if (type === 'Review') {
      const ratings = { facilityQuality, staffHelpfulness, safetyCleanliness, overallExperience };
      for (const [key, val] of Object.entries(ratings)) {
        if (val === undefined || val === null) {
          return res.status(400).json({ error: `${key} is required for a review.` });
        }
        if (!Number.isInteger(val) || val < 1 || val > 5) {
          return res.status(400).json({ error: `${key} must be an integer between 1 and 5.` });
        }
      }

      if (reviewText.trim().length < 10) {
        return res.status(400).json({ error: 'Review text must be at least 10 characters long to be helpful.' });
      }
    }

    if (reviewText.trim().length > 500) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 500 characters.' });
    }

    const newFeedback = new Feedback({
      userId,
      facilityId,
      facilityName,
      type,
      facilityQuality: type === 'Review' ? facilityQuality : undefined,
      staffHelpfulness: type === 'Review' ? staffHelpfulness : undefined,
      safetyCleanliness: type === 'Review' ? safetyCleanliness : undefined,
      overallExperience: type === 'Review' ? overallExperience : undefined,
      reviewText: reviewText.trim(),

      messages: type === 'Complaint' ? [{
        senderId: userId,
        role: 'student',
        text: reviewText.trim()
      }] : []
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error during feedback submission.' });
  }
});


// Add a message to a feedback 
router.post('/:id/message', async (req, res) => {
  try {
    const { senderId, role, text } = req.body;
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    if (role === 'student') {
      return res.status(403).json({ error: 'Students cannot send follow-up messages. Wait for admin reply.' });
    }

    if (feedback.status === 'Resolved' && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot message on a resolved ticket' });
    }

    if (role === 'admin' && feedback.status === 'Pending') {
      feedback.status = 'In Progress';
    }

    feedback.messages.push({ senderId, role, text });
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update complaint status
router.patch('/:id/admin', async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    if (status) feedback.status = status;

    if (adminReply && feedback.type === 'Complaint') {
      feedback.messages.push({
        senderId: 'admin_sys',
        role: 'admin',
        text: adminReply
      });
    }

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update review
router.put('/:id', async (req, res) => {
  try {
    const { facilityQuality, staffHelpfulness, safetyCleanliness, overallExperience, reviewText } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    if (facilityQuality) feedback.facilityQuality = facilityQuality;
    if (staffHelpfulness) feedback.staffHelpfulness = staffHelpfulness;
    if (safetyCleanliness) feedback.safetyCleanliness = safetyCleanliness;
    if (overallExperience) feedback.overallExperience = overallExperience;
    if (reviewText) feedback.reviewText = reviewText;

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
