const fs = require('fs');
const path = require('path');

console.log('\n📋 Checking Route Files...\n');

const files = [
  'routes/books.js',
  'routes/members.js',
  'controllers/bookController.js',
  'controllers/memberController.js',
  'models/Book.js',
  'models/Member.js',
];

files.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? '✓' : '✗';
  console.log(`${status} ${file}`);
  
  if (exists) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('module.exports')) {
      console.log(`  └─ Has module.exports ✓`);
    } else {
      console.log(`  └─ Missing module.exports ✗`);
    }
  }
});

console.log('');