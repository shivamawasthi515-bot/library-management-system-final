const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    default: 'General',
    index: true
  },
  publicationYear: {
    type: Number,
    default: new Date().getFullYear(),
    index: true
  },
  description: {
    type: String,
    default: '',
  },
  keywords: [String],
  totalCopies: {
    type: Number,
    default: 1,
    min: 1,
  },
  availableCopies: {
    type: Number,
    default: 1,
    min: 0,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


// text index (good for basic text search)
BookSchema.index({ title: 'text', author: 'text', description: 'text', keywords: 'text' });

module.exports = mongoose.model('Book', BookSchema);