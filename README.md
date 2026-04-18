# Hybrid Library Management System (HLMS)

A complete Node.js + MongoDB Atlas compatible library management system supporting physical and digital books, JWT auth, role-based admin controls, smart local search (no OpenAI key required), borrowing workflows, feedback, analytics, and health metrics.

## Features

- User authentication with JWT
- Roles: `user`, `admin`
- Book inventory for physical/digital/hybrid resources
- Smart search (`GET /api/search?q=...`) using:
  - MongoDB text index
  - Partial regex matching
  - Local fuzzy ranking (misspellings + partial titles)
  - In-memory LRU cache for common queries
- Borrow/return workflows
- User dashboard with borrow history + feedback submission
- Admin panel for books, users, borrows, search analytics, and feedback
- Request logging + response-time metrics (`GET /api/health`)

## Tech Stack

- Backend: Node.js + Express + Mongoose
- Database: MongoDB Atlas compatible
- Frontend: HTML/CSS/Vanilla JavaScript

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required:

- `MONGODB_URI`
- `JWT_SECRET`

Optional:

- `MONGODB_DB`
- `PORT`
- `DEFAULT_BORROW_DAYS`
- `SEARCH_CANDIDATE_LIMIT`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- `USE_OPENAI_SEARCH` (defaults to false; local search remains default)
- `OPENAI_API_KEY` (placeholder only)
- `EMAIL_PROVIDER`, `SMS_PROVIDER` (placeholders)

## Install & Run

```bash
npm install
npm run seed
npm run dev
```

Open: `http://localhost:3001`

## Scripts

- `npm run dev` - start with nodemon
- `npm start` - start server
- `npm run seed` - seed sample users/books
- `npm test` - run unit tests

## Sample Seed Accounts

- Admin: `admin@hlms.local` / `Admin123!`
- User: `user@hlms.local` / `User123!`

## API Endpoints (minimum)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Books
- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books` (admin)
- `PUT /api/books/:id` (admin)
- `DELETE /api/books/:id` (admin)
- `GET /api/search?q=...`

### Borrowing
- `POST /api/borrow/:bookId`
- `POST /api/return/:borrowId`
- `GET /api/borrows/me`
- `GET /api/borrows` (admin)

### Feedback
- `POST /api/feedback`
- `GET /api/feedback` (admin)

### Analytics
- `GET /api/admin/analytics/searches` (admin)

### Health
- `GET /api/health`

## Indexing & Performance

The `Book` model includes:
- Text index on title, authors, description, tags (weighted)
- Compound index for category/resourceType/availableCopies
- Additional indexes for active records and timestamps

Search flow is optimized by querying a limited candidate set before local ranking.

## Optional AI Integration Scaffold

`services/aiSearchAdapter.js` provides a disabled-by-default adapter hook. Local search is always the default path.
