const express = require('express');
const router = express.Router();

console.log('🔄 Setting up issuance routes...');

router.post('/issue', (req, res) => {
  console.log('📤 /issue route called');
  res.json({ message: 'Issue book endpoint', success: true });
});

router.post('/return', (req, res) => {
  console.log('📥 /return route called');
  res.json({ message: 'Return book endpoint', success: true });
});

console.log('✓ Issuance routes setup complete');

module.exports = router;