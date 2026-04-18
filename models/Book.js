const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    authors: [{ type: String, required: true, trim: true }],
    description: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    resourceType: { type: String, enum: ['physical', 'digital', 'hybrid'], default: 'physical', index: true },
    isbn: { type: String, trim: true, index: true, sparse: true },
    category: { type: String, default: 'General', trim: true, index: true },
    publicationYear: { type: Number, index: true },
    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0, index: true },
    digitalUrl: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

BookSchema.index({ title: 'text', authors: 'text', description: 'text', tags: 'text' }, {
  weights: { title: 6, authors: 5, tags: 4, description: 2 },
  name: 'book_text_index'
});
BookSchema.index({ category: 1, resourceType: 1, availableCopies: -1 });
BookSchema.index({ createdAt: -1, isActive: 1 });

module.exports = mongoose.model('Book', BookSchema);
