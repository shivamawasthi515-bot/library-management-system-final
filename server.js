require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { requestLogger, metricsCollector, getMetricsSnapshot } = require('./middleware/metrics');
const { rateLimit } = require('./middleware/rateLimit');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(metricsCollector);
app.use('/api', rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000), max: Number(process.env.RATE_LIMIT_MAX || 180) }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/search', require('./routes/search'));
app.use('/api', require('./routes/borrow'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    metrics: getMetricsSnapshot()
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/books', (req, res) => res.sendFile(path.join(__dirname, 'public', 'books.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/forgot-password', (req, res) => res.sendFile(path.join(__dirname, 'public', 'forgot-password.html')));
app.get('/reset-password', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reset-password.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/setup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'setup.html')));

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error('Unhandled error:', err);
  // For browser page requests (non-API) return a proper redirect rather than raw JSON
  if (!req.path.startsWith('/api') && req.accepts('html')) {
    return res.status(status).redirect('/');
  }
  res.status(status).json({ success: false, error: status === 404 ? 'Not found' : 'Internal server error' });
});

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required');
    }
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined });
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

start();
