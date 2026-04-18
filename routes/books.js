const express = require('express');
const router = express.Router();
const cache = require('../utils/cache'); // ✅ ADD THIS

console.log('🔄 Setting up books routes...');

// Import controller
let bookController;
try {
  bookController = require('../controllers/bookController');
  console.log('✓ Book controller imported');
} catch (error) {
  console.error('✗ Failed to import book controller:', error.message);
  bookController = {
    getAllBooks: (req, res) => res.json({ success: false, error: 'Controller not loaded', books: [] }),
    searchBooks: (req, res) => res.json({ success: false, error: 'Controller not loaded', books: [] }),
    filterBooks: (req, res) => res.json({ success: false, error: 'Controller not loaded', books: [] }),
    getCategories: (req, res) => res.json({ success: false, error: 'Controller not loaded', categories: [] }),
    getPublicationYears: (req, res) => res.json({ success: false, error: 'Controller not loaded', years: [] }),
    getBookById: (req, res) => res.json({ success: false, error: 'Controller not loaded' }),
  };
}

// ---------- READ ROUTES ----------
router.get('/all', (req, res) => {
  console.log('📚 /all route called');
  return bookController.getAllBooks(req, res);
});

router.get('/search', (req, res) => {
  console.log('🔍 /search route called');
  return bookController.searchBooks(req, res);
});

router.get('/filter', (req, res) => {
  console.log('🏷️  /filter route called');
  return bookController.filterBooks(req, res);
});

router.get('/categories', (req, res) => {
  console.log('📂 /categories route called');
  return bookController.getCategories(req, res);
});

router.get('/years', (req, res) => {
  console.log('📅 /years route called');
  return bookController.getPublicationYears(req, res);
});

router.get('/:id', (req, res) => {
  console.log(`📖 /:id route called with id=${req.params.id}`);
  return bookController.getBookById(req, res);
});

// ---------- WRITE ROUTES (Phase-1 adminless) ----------
router.post('/add', async (req, res) => {
  try {
    const Book = require('../models/Book');
    const book = await Book.create(req.body);

    // ✅ invalidate caches
    cache.delByPrefix('books:all');
    cache.delByPrefix('books:search');
    cache.delByPrefix('books:categories');
    cache.delByPrefix('books:years');

    return res.status(201).json({ success: true, message: 'Book added', book });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const Book = require('../models/Book');
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

    cache.delByPrefix('books:all');
    cache.delByPrefix('books:search');
    cache.delByPrefix('books:categories');
    cache.delByPrefix('books:years');

    return res.json({ success: true, message: 'Book updated', book });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const Book = require('../models/Book');
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

    cache.delByPrefix('books:all');
    cache.delByPrefix('books:search');
    cache.delByPrefix('books:categories');
    cache.delByPrefix('books:years');

    return res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

console.log('✓ Books routes setup complete');
module.exports = router;