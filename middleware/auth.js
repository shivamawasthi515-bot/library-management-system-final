const Book = require('../models/Book');

console.log('📖 Book Controller loading...');

// Add a new book
exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, publicationYear, description, keywords, totalCopies } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required', success: false });
    }

    const book = new Book({
      title,
      author,
      isbn,
      category: category || 'General',
      publicationYear: publicationYear || new Date().getFullYear(),
      description: description || '',
      keywords: keywords || [],
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
    });

    await book.save();
    res.status(201).json({ message: 'Book added successfully', book, success: true });
  } catch (error) {
    console.error('Add Book Error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    console.log('📚 Fetching all books...');
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments();

    console.log(`✓ Found ${total} books`);

    res.json({ 
      books, 
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      success: true 
    });
  } catch (error) {
    console.error('Get All Books Error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.json({ books: [], total: 0, success: true });
    }

    const filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
      ]
    };

    const skip = (page - 1) * limit;
    const books = await Book.find(filter).skip(skip).limit(parseInt(limit));
    const total = await Book.countDocuments(filter);

    res.json({ books, total, page: parseInt(page), pages: Math.ceil(total / limit), success: true });
  } catch (error) {
    console.error('Search Books Error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// Filter books
exports.filterBooks = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const books = await Book.find(filter).skip(skip).limit(parseInt(limit));
    const total = await Book.countDocuments(filter);
    const categories = await Book.distinct('category');

    res.json({
      books,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      filters: { categories },
      success: true
    });
  } catch (error) {
    console.error('Filter Books Error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found', success: false });
    }
    res.json({ book, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Book updated successfully', book, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json({ categories, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// Get publication years
exports.getPublicationYears = async (req, res) => {
  try {
    const books = await Book.find().select('publicationYear');
    const years = [...new Set(books.map(b => b.publicationYear))];
    res.json({ years, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// Index all books
exports.indexAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json({ message: `Ready to index ${books.length} books`, count: books.length, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

console.log('✓ Book Controller loaded');