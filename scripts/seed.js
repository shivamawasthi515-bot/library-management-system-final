require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Feedback = require('../models/Feedback');
const SearchLog = require('../models/SearchLog');

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required for seed');
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined });

  await Promise.all([
    User.deleteMany({}),
    Book.deleteMany({}),
    Borrow.deleteMany({}),
    Feedback.deleteMany({}),
    SearchLog.deleteMany({})
  ]);

  const admin = new User({ name: 'Admin User', email: 'admin@hlms.local', role: 'admin' });
  await admin.setPassword('Admin123!');

  const user = new User({ name: 'Library User', email: 'user@hlms.local', role: 'user' });
  await user.setPassword('User123!');

  await User.insertMany([admin, user]);

  const books = await Book.insertMany([
    {
      title: 'The Great Gatsby',
      authors: ['F. Scott Fitzgerald'],
      description: 'A classic novel set in the Jazz Age.',
      tags: ['fiction', 'classic', 'jazz-age'],
      category: 'Fiction',
      resourceType: 'physical',
      publicationYear: 1925,
      totalCopies: 4,
      availableCopies: 4
    },
    {
      title: 'Learning JavaScript',
      authors: ['Ethan Brown'],
      description: 'A practical guide for modern JavaScript programming.',
      tags: ['programming', 'javascript', 'web'],
      category: 'Technology',
      resourceType: 'hybrid',
      publicationYear: 2020,
      totalCopies: 2,
      availableCopies: 2,
      digitalUrl: 'https://example.com/learning-js'
    },
    {
      title: 'Data Structures and Algorithms',
      authors: ['Narasimha Karumanchi'],
      description: 'Comprehensive DSA handbook with problem-solving patterns.',
      tags: ['algorithms', 'data-structures', 'computer-science'],
      category: 'Technology',
      resourceType: 'digital',
      publicationYear: 2018,
      totalCopies: 1,
      availableCopies: 1,
      digitalUrl: 'https://example.com/dsa-handbook'
    }
  ]);

  console.log('Seed complete');
  console.log('Admin:', admin.email, 'password: Admin123!');
  console.log('User:', user.email, 'password: User123!');
  console.log('Books inserted:', books.length);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
