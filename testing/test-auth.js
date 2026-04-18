require('dns').setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔐 Testing MongoDB Authentication...\n');

// Hide password in display
const uri = process.env.MONGODB_URI;
const uriDisplay = uri.replace(/:[^@]*@/, ':****@');
console.log('Connection String:', uriDisplay);
console.log('');

mongoose.connect(uri)
  .then(() => {
    console.log('✓ Authentication SUCCESSFUL!');
    console.log('Database:', mongoose.connection.name);
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Authentication FAILED');
    console.error('Error:', err.message);
    
    if (err.message.includes('bad auth')) {
      console.error('\n⚠ Your username or password is incorrect!');
      console.error('Please:');
      console.error('  1. Go to MongoDB Atlas → Database Access');
      console.error('  2. Find your user (hlmsUser)');
      console.error('  3. Reset the password');
      console.error('  4. Update .env with the new password');
    }
    
    process.exit(1);
  });