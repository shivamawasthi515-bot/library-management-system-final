const express = require('express');
const router = express.Router();

console.log('🔄 Setting up members routes...');

router.get('/all', (req, res) => {
  console.log('👥 /all route called');
  res.json({ 
    message: 'Members list endpoint', 
    success: true,
    members: []
  });
});

console.log('✓ Members routes setup complete');

module.exports = router;