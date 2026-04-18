const express = require('express');
const Book = require('../models/Book');
const SearchLog = require('../models/SearchLog');
const cache = require('../utils/cache');
const { normalizeText, buildPartialRegex, rankBooks } = require('../utils/search');
const { optionalAiEnhanceSearch } = require('../services/aiSearchAdapter');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = normalizeText(req.query.q || '');
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
    const skip = (page - 1) * limit;

    if (!q) {
      return res.json({ success: true, query: q, books: [], total: 0, page, pages: 0, mode: 'local' });
    }

    const cacheKey = `search:${q}:${page}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    await SearchLog.findOneAndUpdate(
      { query: q },
      { $inc: { count: 1 }, $set: { lastSearchedAt: new Date() } },
      { new: true, upsert: true }
    );

    const partialRegex = buildPartialRegex(q);

    const [textMatches, partialMatches] = await Promise.all([
      Book.find(
        { $text: { $search: q }, isActive: true },
        { score: { $meta: 'textScore' }, title: 1, authors: 1, description: 1, tags: 1, resourceType: 1, availableCopies: 1, totalCopies: 1, digitalUrl: 1, fileUrl: 1, category: 1 }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(120)
        .lean(),
      partialRegex
        ? Book.find({
            isActive: true,
            $or: [
              { title: partialRegex },
              { authors: partialRegex },
              { description: partialRegex },
              { tags: partialRegex }
            ]
          })
            .limit(120)
            .lean()
        : []
    ]);

    const unique = new Map();
    for (const b of textMatches) unique.set(String(b._id), { ...b, _textScore: b.score || 0 });
    for (const b of partialMatches) {
      const key = String(b._id);
      if (!unique.has(key)) unique.set(key, b);
    }

    const ranked = rankBooks(Array.from(unique.values()), q);
    const total = ranked.length;
    const books = ranked.slice(skip, skip + limit).map(({ _rankScore, _textScore, ...rest }) => rest);

    const aiEnhanced = await optionalAiEnhanceSearch({ query: q, results: books });

    const payload = {
      success: true,
      query: q,
      books: aiEnhanced.results,
      total,
      page,
      pages: Math.ceil(total / limit),
      mode: aiEnhanced.mode
    };

    cache.set(cacheKey, payload, 20_000);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
