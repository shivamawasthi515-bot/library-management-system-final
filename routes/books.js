const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const { authRequired, requireRole } = require('../middleware/auth');
const cache = require('../utils/cache');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 50);
    const skip = (page - 1) * limit;

    const filters = { isActive: true };
    if (req.query.resourceType && ['physical', 'digital', 'hybrid'].includes(String(req.query.resourceType))) {
      filters.resourceType = req.query.resourceType;
    }
    if (req.query.availableOnly === 'true') filters.availableCopies = { $gt: 0 };

    const cacheKey = `books:list:${JSON.stringify({ page, limit, filters })}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [books, total] = await Promise.all([
      Book.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Book.countDocuments(filters)
    ]);

    const payload = { success: true, books, total, page, pages: Math.ceil(total / limit) };
    cache.set(cacheKey, payload, 20_000);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid book id' });
    }
    const book = await Book.findById(req.params.id).lean();
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    return res.json({ success: true, book });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !Array.isArray(body.authors) || body.authors.length === 0) {
      return res.status(400).json({ success: false, error: 'title and authors[] are required' });
    }

    const payload = {
      ...body,
      authors: body.authors.map((a) => String(a).trim()).filter(Boolean),
      tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t).toLowerCase()) : []
    };

    const book = await Book.create(payload);
    cache.delByPrefix('books:list:');
    cache.delByPrefix('search:');

    return res.status(201).json({ success: true, book });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid book id' });
    }
    const update = { ...req.body };
    if (Array.isArray(update.authors)) update.authors = update.authors.map((a) => String(a).trim()).filter(Boolean);
    if (Array.isArray(update.tags)) update.tags = update.tags.map((t) => String(t).toLowerCase());

    const book = await Book.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

    cache.delByPrefix('books:list:');
    cache.delByPrefix('search:');

    return res.json({ success: true, book });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid book id' });
    }
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

    cache.delByPrefix('books:list:');
    cache.delByPrefix('search:');

    return res.json({ success: true, message: 'Book removed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
