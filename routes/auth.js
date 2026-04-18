const express = require('express');
const router = express.Router();
const User = require('../models/User');

console.log('🔄 Setting up auth routes...');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, password are required' });
    }

    const emailLower = String(email).toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: emailLower,
      password,
      role: 'User'
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const emailLower = String(email).toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = `token-${user._id}`; // later JWT

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

console.log('✓ Auth routes setup complete');
module.exports = router;