const express = require('express');
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  try {
    const { message, rating, bookId } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: 'Feedback message is required' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      book: bookId && mongoose.isValidObjectId(bookId) ? bookId : null,
      message: String(message).trim(),
      rating: Number(rating || 5)
    });

    return res.status(201).json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Book-specific feedback (public)
router.get('/book/:bookId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.bookId)) {
      return res.status(400).json({ success: false, error: 'Invalid book id' });
    }
    const feedback = await Feedback.find({ book: req.params.bookId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.find({})
      .populate('user', 'name email')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
