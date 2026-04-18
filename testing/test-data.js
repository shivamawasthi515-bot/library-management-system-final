require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Member = require('./models/Member');

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas');

    // Sample books
    const sampleBooks = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        description: 'A classic American novel set in the Jazz Age.',
        keywords: ['fiction', 'classic', 'romance', 'jazz-age'],
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        description: 'A gripping tale of racial injustice and childhood innocence in the Deep South.',
        keywords: ['fiction', 'classic', 'drama', 'social-issues'],
        totalCopies: 2,
        availableCopies: 2,
      },
      {
        title: 'Python Programming',
        author: 'Eric Matthes',
        isbn: '978-1-59327-928-8',
        description: 'A comprehensive guide to learning Python programming.',
        keywords: ['programming', 'python', 'education', 'technology'],
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0-452-26234-2',
        description: 'A dystopian social science fiction novel.',
        keywords: ['fiction', 'dystopian', 'science-fiction', 'classic'],
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '978-0-547-92817-1',
        description: 'A fantasy adventure about a hobbit named Bilbo Baggins.',
        keywords: ['fantasy', 'adventure', 'fiction', 'classic'],
        totalCopies: 3,
        availableCopies: 3,
      },
    ];

    // Sample members
    const sampleMembers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        address: '123 Main Street, City, State',
        isActive: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        address: '456 Oak Avenue, City, State',
        isActive: true,
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '9876543212',
        address: '789 Pine Road, City, State',
        isActive: true,
      },
    ];

    // Clear existing data
    await Book.deleteMany({});
    await Member.deleteMany({});
    console.log('✓ Cleared existing data');

    // Insert sample books
    await Book.insertMany(sampleBooks);
    console.log(`✓ Added ${sampleBooks.length} sample books`);

    // Insert sample members
    await Member.insertMany(sampleMembers);
    console.log(`✓ Added ${sampleMembers.length} sample members`);

    console.log('\n✅ Sample data added successfully!');
    console.log('\n📚 Books added:');
    sampleBooks.forEach(book => {
      console.log(`   - ${book.title} by ${book.author}`);
    });

    console.log('\n👥 Members added:');
    sampleMembers.forEach(member => {
      console.log(`   - ${member.name} (${member.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

seedData();