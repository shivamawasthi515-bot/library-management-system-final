const express = require('express');
const mongoose = require('mongoose');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/borrow/:bookId', authRequired, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const bookId = req.params.bookId;
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, error: 'Invalid book id' });
    }
    session.startTransaction();

    const book = await Book.findById(bookId).session(session);
    if (!book || !book.isActive) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    if ((book.resourceType === 'physical' || book.resourceType === 'hybrid') && book.availableCopies <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Book is not available' });
    }

    if (book.resourceType === 'physical' || book.resourceType === 'hybrid') {
      book.availableCopies -= 1;
      await book.save({ session });
    }

    const dueDays = Number(process.env.DEFAULT_BORROW_DAYS || 14);
    const dueAt = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000);

    const [borrow] = await Borrow.create(
      [{ user: req.user._id, book: book._id, dueAt, note: req.body?.note || '' }],
      { session }
    );

    await session.commitTransaction();
    return res.status(201).json({ success: true, borrow });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
});

router.post('/return/:borrowId', authRequired, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    if (!mongoose.isValidObjectId(req.params.borrowId)) {
      return res.status(400).json({ success: false, error: 'Invalid borrow id' });
    }
    session.startTransaction();

    const borrow = await Borrow.findById(req.params.borrowId).session(session);
    if (!borrow) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'Borrow record not found' });
    }

    const requesterIsOwner = String(borrow.user) === String(req.user._id);
    const requesterIsAdmin = req.user.role === 'admin';
    if (!requesterIsOwner && !requesterIsAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    if (borrow.status === 'returned') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Borrow already returned' });
    }

    borrow.status = 'returned';
    borrow.returnedAt = new Date();

    // Fine calculation: configurable per-day rate (default 1 unit per day overdue)
    if (borrow.dueAt && borrow.returnedAt > borrow.dueAt) {
      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const overdueDays = Math.ceil((borrow.returnedAt - borrow.dueAt) / MS_PER_DAY);
      const ratePerDay = Number(process.env.FINE_PER_DAY || 1);
      borrow.fine = overdueDays * ratePerDay;
    }

    await borrow.save({ session });

    const book = await Book.findById(borrow.book).session(session);
    if (book && (book.resourceType === 'physical' || book.resourceType === 'hybrid')) {
      book.availableCopies += 1;
      if (book.availableCopies > book.totalCopies) book.availableCopies = book.totalCopies;
      await book.save({ session });
    }

    await session.commitTransaction();
    return res.json({ success: true, borrow });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
});

router.get('/borrows/me', authRequired, async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user._id })
      .populate('book', 'title authors resourceType')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, borrows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Returns active borrows due within the next 2 days (for dashboard alerts)
router.get('/borrows/me/alerts', authRequired, async (req, res) => {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const alerts = await Borrow.find({
      user: req.user._id,
      status: 'borrowed',
      dueAt: { $lte: soon }
    })
      .populate('book', 'title authors')
      .sort({ dueAt: 1 })
      .lean();
    return res.json({ success: true, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/borrows', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const borrows = await Borrow.find({})
      .populate('book', 'title authors resourceType')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, borrows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
