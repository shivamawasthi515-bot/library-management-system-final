const Book = require('../models/Book');
const cache = require('../utils/cache');
const { buildFuzzyRegex, scoreBook, normalize } = require('../utils/search');

console.log('🔄 Loading book controller...');

exports.getAllBooks = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const skip = (page - 1) * limit;

    const cacheKey = `books:all:p=${page}:l=${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [books, total] = await Promise.all([
      Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Book.countDocuments()
    ]);

    const payload = {
      success: true,
      books,
      total,
      page,
      pages: Math.ceil(total / limit)
    };

    cache.set(cacheKey, payload, 20_000); // 20s cache
    return res.json(payload);
  } catch (error) {
    console.error('getAllBooks error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const queryRaw = req.query.query || '';
    const query = normalize(queryRaw);

    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const skip = (page - 1) * limit;

    if (!query) {
      return res.json({ success: true, books: [], total: 0, page, pages: 0 });
    }

    const cacheKey = `books:search:q=${query}:p=${page}:l=${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const fuzzy = buildFuzzyRegex(query);

    // MongoDB-side filtering (fast) then app-side scoring
    const mongoFilter = {
      $or: [
        { title: { $regex: fuzzy } },
        { author: { $regex: fuzzy } },
        { category: { $regex: fuzzy } },
        { description: { $regex: fuzzy } },
        { keywords: { $regex: fuzzy } }
      ]
    };

    // Fetch a limited candidate set for scoring
    // (candidateLimit prevents heavy load)
    const candidateLimit = 200;
    const candidates = await Book.find(mongoFilter).limit(candidateLimit).lean();

    const scored = candidates
      .map(b => ({ ...b, _score: scoreBook(b, query) }))
      .sort((a, b) => b._score - a._score);

    const total = scored.length;
    const books = scored.slice(skip, skip + limit).map(({ _score, ...rest }) => rest);

    const payload = {
      success: true,
      books,
      total,
      page,
      pages: Math.ceil(total / limit)
    };

    cache.set(cacheKey, payload, 20_000);
    return res.json(payload);
  } catch (error) {
    console.error('searchBooks error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const cacheKey = `books:categories`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const categories = await Book.distinct('category');
    const payload = { success: true, categories: categories.sort() };

    cache.set(cacheKey, payload, 60_000);
    return res.json(payload);
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPublicationYears = async (req, res) => {
  try {
    const cacheKey = `books:years`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const years = await Book.distinct('publicationYear');
    const payload = { success: true, years: years.sort((a, b) => b - a) };

    cache.set(cacheKey, payload, 60_000);
    return res.json(payload);
  } catch (error) {
    console.error('getPublicationYears error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

console.log('✓ Book controller loaded');