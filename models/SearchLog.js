const mongoose = require('mongoose');

const SearchLogSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true, lowercase: true, index: true },
    count: { type: Number, default: 1 },
    lastSearchedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

SearchLogSchema.index({ count: -1, lastSearchedAt: -1 });

module.exports = mongoose.model('SearchLog', SearchLogSchema);
