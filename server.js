require('dns').setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

console.log('\n📚 Library Management System Starting...\n');

// ============ MONGODB ============
async function connectDB() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

// ============ START SERVER ============
async function startServer() {
  try {
    await connectDB();

    // ============ API ROUTES ============
    console.log('📍 Loading API Routes...\n');

    try {
      const authRoutes = require('./routes/auth');
      app.use('/api/auth', authRoutes);
      console.log('  ✓ Auth routes loaded');
    } catch (error) {
      console.error('  ✗ Auth routes error:', error.message);
    }

    try {
      const bookRoutes = require('./routes/books');
      app.use('/api/books', bookRoutes);
      console.log('  ✓ Book routes loaded');
    } catch (error) {
      console.error('  ✗ Book routes error:', error.message);
    }

    try {
      const memberRoutes = require('./routes/members');
      app.use('/api/members', memberRoutes);
      console.log('  ✓ Member routes loaded');
    } catch (error) {
      console.error('  ✗ Member routes error:', error.message);
    }

    try {
      const issuanceRoutes = require('./routes/issuance');
      app.use('/api/issuance', issuanceRoutes);
      console.log('  ✓ Issuance routes loaded');
    } catch (error) {
      console.error('  ✗ Issuance routes error:', error.message);
    }

    console.log('\n✓ Routes loaded successfully\n');

    // ============ STATUS ENDPOINT ============
    app.get('/api/status', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Library Management System is running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date()
      });
    });

    // ============ STATIC PAGES ============
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.get('/books', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'books.html'));
    });

    app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'login.html'));
    });

    app.get('/register', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'register.html'));
    });

    // ============ CATCH-ALL FOR FRONTEND ROUTING ============
 
app.use((req, res, next) => {
  // अगर /api/ नहीं है तो index.html serve करो
  if (!req.path.startsWith('/api/') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  console.warn(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path, success: false });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(500).json({ error: 'Server error', message: err.message, success: false });
});

    // ============ ERROR HANDLER ============
    app.use((err, req, res, next) => {
      console.error('💥 Error:', err.message);
      res.status(500).json({ error: 'Server error', message: err.message, success: false });
    });

    // ============ LISTEN ============
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('\n✓ Available Pages:');
      console.log(`  - GET  http://localhost:${PORT}/ (Home)`);
      console.log(`  - GET  http://localhost:${PORT}/books (Books)`);
      console.log(`  - GET  http://localhost:${PORT}/login (Login)`);
      console.log(`  - GET  http://localhost:${PORT}/register (Register)`);
      console.log('\n✓ Available API Endpoints:');
      console.log(`  - GET  http://localhost:${PORT}/api/status`);
      console.log(`  - GET  http://localhost:${PORT}/api/books/all`);
      console.log(`  - POST http://localhost:${PORT}/api/auth/login\n`);
    });

  } catch (error) {
    console.error('✗ Startup Error:', error.message);
    process.exit(1);
  }
}

startServer();