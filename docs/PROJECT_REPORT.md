# Hybrid Library Management System (HLMS)
## Comprehensive Project Report

**Project Name:** Hybrid Library Management System (HLMS)  
**Repository:** shivamawasthi515-bot/library-management-system-final  
**Technology Stack:** Node.js · Express.js · MongoDB · Mongoose · JWT · OpenAI API  
**Author:** shivamawasthi515  
**Date:** April 2026  
**Version:** 1.0.0  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction and Background](#2-introduction-and-background)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [Scope of the Project](#5-scope-of-the-project)
6. [System Requirements](#6-system-requirements)
7. [System Architecture Overview](#7-system-architecture-overview)
8. [Technology Stack and Justification](#8-technology-stack-and-justification)
9. [Database Design](#9-database-design)
10. [Backend Implementation](#10-backend-implementation)
11. [Frontend Implementation](#11-frontend-implementation)
12. [Authentication and Authorization](#12-authentication-and-authorization)
13. [Smart Search System](#13-smart-search-system)
14. [AI-Powered Search Integration (OpenAI)](#14-ai-powered-search-integration-openai)
15. [Feedback and Review System](#15-feedback-and-review-system)
16. [Borrowing and Return System](#16-borrowing-and-return-system)
17. [Email Notification Service](#17-email-notification-service)
18. [Caching System](#18-caching-system)
19. [Rate Limiting](#19-rate-limiting)
20. [Metrics and Monitoring](#20-metrics-and-monitoring)
21. [Security Implementation](#21-security-implementation)
22. [Content Security Policy (CSP)](#22-content-security-policy-csp)
23. [API Documentation](#23-api-documentation)
24. [Admin Panel](#24-admin-panel)
25. [User Dashboard](#25-user-dashboard)
26. [Seed Data and Initial Setup](#26-seed-data-and-initial-setup)
27. [Error Handling Strategy](#27-error-handling-strategy)
28. [Environment Configuration](#28-environment-configuration)
29. [Deployment Guide](#29-deployment-guide)
30. [Testing Strategy](#30-testing-strategy)
31. [Performance Considerations](#31-performance-considerations)
32. [Known Issues and Fixes Applied](#32-known-issues-and-fixes-applied)
33. [Future Enhancements](#33-future-enhancements)
34. [Conclusion](#34-conclusion)
35. [Appendix A – Complete File Structure](#appendix-a--complete-file-structure)
36. [Appendix B – Database Index Summary](#appendix-b--database-index-summary)
37. [Appendix C – Environment Variables Reference](#appendix-c--environment-variables-reference)
38. [Appendix D – API Endpoint Quick Reference](#appendix-d--api-endpoint-quick-reference)

---

## 1. Executive Summary

The Hybrid Library Management System (HLMS) is a full-stack web application designed to manage both physical and digital library resources in a unified platform. The system allows library administrators to catalog books (physical copies, digital links, hybrid), manage borrowing transactions, track overdue fines, and monitor user activity. Library members can browse the catalog, search intelligently using fuzzy matching or AI-powered semantic reranking, borrow books, and leave reviews.

The project is built using a modern JavaScript stack: Node.js and Express on the server, MongoDB for persistence, and vanilla HTML/CSS/JavaScript on the client. It includes enterprise-grade features such as:

- **JWT-based authentication** with role-based access control (RBAC)
- **Dual-mode smart search** — a fully offline fuzzy/text-index search engine plus optional OpenAI GPT semantic reranking
- **Transactional borrowing** using MongoDB sessions to prevent data races
- **Overdue fine calculation** on return
- **Password reset via email** using Nodemailer + Gmail SMTP
- **In-memory LRU cache** with TTL for search and book-listing responses
- **Per-IP rate limiting** to prevent abuse
- **Content Security Policy (CSP)** via Helmet with correct `script-src-attr` to support inline event handlers
- **Request metrics collection** (latency, error rate, per-endpoint statistics)
- **Search analytics** (most searched terms, recent searches)
- **Book-level reviews** visible publicly, rate-limited to authenticated users

This report documents every aspect of the system: its architecture, data models, business logic, security mechanisms, API surface, and operational guidance.

---

## 2. Introduction and Background

Libraries have traditionally managed their collections using paper-based ledgers or simple spreadsheet systems. As collections grow to include digital resources — e-books, PDFs, external URLs — these legacy approaches become inadequate. The proliferation of remote access expectations after 2020 has further accelerated the need for web-accessible, searchable library management systems.

Modern libraries manage three distinct resource types:

1. **Physical books** — limited by copy count; must be tracked per-borrower with due dates and fines.
2. **Digital resources** — URLs, streaming access, or downloadable files; not copy-limited.
3. **Hybrid resources** — a physical copy that also has a digital counterpart (e.g., a textbook with an accompanying online edition).

Managing these three types cohesively in a single system — with a unified search interface — is the core challenge this project addresses.

### 2.1 Why a Custom System?

Off-the-shelf library management systems such as Koha or Evergreen are mature but heavyweight. They require dedicated server infrastructure, have steep learning curves, and often do not natively support modern AI-enhanced search. HLMS is purpose-built to be:

- **Lightweight** — runs on a single Node.js process with MongoDB Atlas (cloud)
- **Extensible** — clean route/controller/model separation makes adding features straightforward
- **AI-ready** — OpenAI integration can be toggled on/off without code changes
- **Deployable anywhere** — Railway, Render, Heroku, DigitalOcean, or any VPS

---

## 3. Problem Statement

The Hybrid Library Management System addresses the following problems faced by small-to-medium institutions:

1. **No unified catalog** for physical + digital resources — they live in separate spreadsheets or systems.
2. **Poor search** — keyword search misses typos, synonyms, and conceptually related books.
3. **No self-service borrowing** — staff must manually issue books; there is no online queue.
4. **No automated overdue tracking** — fines are calculated manually and inconsistently.
5. **No password reset** — forgotten passwords require admin intervention.
6. **No visibility into search behaviour** — admins cannot see what users are searching for.
7. **No book-level reviews** — patrons cannot see quality signals for books they consider borrowing.
8. **Security gaps** — no CSP, no rate limiting, no input sanitisation in many home-grown systems.

HLMS solves all seven problems in a single deployable application.

---

## 4. Objectives

### Primary Objectives

1. Provide a **unified catalog** for physical, digital, and hybrid library resources.
2. Implement **intelligent search** that works without internet access (local fuzzy search) and can optionally leverage OpenAI for semantic relevance when a key is available.
3. Deliver a **self-service borrowing portal** where authenticated users can borrow, view due dates, and see overdue alerts.
4. Automate **fine calculation** based on configurable per-day rates.
5. Enable **admin control** over the full book catalog and user accounts.
6. Provide **email-based password reset** so users can recover accounts without admin help.
7. Expose **search analytics** to administrators to understand patron needs.

### Secondary Objectives

1. Maintain **zero external dependencies** for core search — the system must work without an OpenAI key.
2. Ensure the application is **secure by default** — CSP, rate limiting, JWT expiry, bcrypt password hashing.
3. Make the system **observable** — request latency, error rates, and per-endpoint statistics available via the health endpoint.
4. Write **clean, maintainable code** with clear separation of concerns (routes, models, middleware, services, utilities).

---

## 5. Scope of the Project

### In Scope

- User registration, login, profile update, and password reset
- JWT authentication and role-based access (user / admin)
- Book CRUD (admin only): create, read, update, soft-delete
- Smart search with MongoDB text index + Levenshtein fuzzy ranking + optional OpenAI reranking
- Borrowing and returning physical/hybrid books with transaction safety
- Overdue fine calculation
- Book-level and general feedback/reviews
- Admin dashboard: user management, borrow oversight, search analytics
- User dashboard: active borrows, due-date alerts, feedback submission
- Email notifications for password reset
- In-memory LRU cache for search and book list responses
- Per-IP rate limiting
- Content Security Policy via Helmet
- Request metrics (latency, error rate, per-endpoint stats) via `/api/health`
- First-admin setup wizard

### Out of Scope

- Mobile native application (iOS/Android)
- Payment gateway for fine collection
- RFID/barcode scanner integration
- Inter-library loan (ILL) management
- Fine analytics dashboards (future enhancement)
- SMS notifications
- Real-time notifications (WebSocket / Server-Sent Events)
- Multi-branch / multi-location support

---

## 6. System Requirements

### 6.1 Functional Requirements

| ID  | Requirement                                                                 |
|-----|-----------------------------------------------------------------------------|
| FR1 | Users can register with name, email, and password (min 6 chars).           |
| FR2 | Users can log in and receive a JWT valid for 7 days.                        |
| FR3 | Users can update their name, email, and password from the profile page.     |
| FR4 | Users can request a password reset link sent to their email.                |
| FR5 | Users can reset their password via a one-hour time-limited token.           |
| FR6 | Admins can create books with title, authors, description, tags, type, etc.  |
| FR7 | Admins can update and soft-delete books.                                    |
| FR8 | All users (including anonymous) can browse and search the book catalog.     |
| FR9 | Authenticated users can borrow available physical/hybrid books.             |
| FR10| Authenticated users can view their active borrows and due dates.            |
| FR11| Authenticated users or admins can return borrowed books.                    |
| FR12| The system calculates overdue fines automatically on return.                |
| FR13| Authenticated users can submit general feedback and book-level reviews.     |
| FR14| All users can read book-level reviews.                                      |
| FR15| Admins can view all users, change roles, activate/deactivate accounts.      |
| FR16| Admins can view all borrows and search analytics.                           |
| FR17| First-time setup creates an admin account when none exists.                 |

### 6.2 Non-Functional Requirements

| ID   | Requirement                                                                  |
|------|------------------------------------------------------------------------------|
| NFR1 | API responses must be < 500 ms at p95 under normal load.                    |
| NFR2 | Passwords must be stored as bcrypt hashes (cost factor 10).                 |
| NFR3 | All state-mutating routes must be authenticated (JWT).                      |
| NFR4 | Rate limit: 180 API requests per IP per 60 seconds.                        |
| NFR5 | The application must start successfully with only MONGODB_URI + JWT_SECRET. |
| NFR6 | Search must work without OpenAI when USE_OPENAI_SEARCH=false.               |
| NFR7 | CSP must be set on all responses; no `unsafe-eval` allowed.                 |
| NFR8 | The app must handle concurrent borrow requests without overselling copies.   |

### 6.3 Hardware / Hosting Requirements

- **Node.js** ≥ 18.x (LTS)
- **MongoDB** ≥ 6.0 (Atlas free tier is sufficient for small libraries)
- **RAM:** 256 MB minimum; 512 MB recommended
- **Storage:** Minimal (all assets are served as static files; no image uploads)

---

## 7. System Architecture Overview

### 7.1 Architectural Pattern

HLMS follows a **three-tier MVC-inspired architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Tier (Browser)                  │
│  HTML pages + vanilla JS (api.js, auth.js, books.js …)   │
│  Communicates via fetch() to /api/* endpoints             │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP/HTTPS
┌───────────────────────────▼─────────────────────────────┐
│                  Application Tier (Node.js)               │
│                                                           │
│  server.js  ──►  routes/  ──►  middleware/               │
│                    │               auth.js                │
│                    │               metrics.js             │
│                    │               rateLimit.js           │
│                    ▼                                      │
│              models/  ──►  services/  ──►  utils/        │
│            Book.js          email.js        cache.js      │
│            User.js      aiSearchAdapter.js  search.js     │
│            Borrow.js                                      │
│            Feedback.js                                    │
│            SearchLog.js                                   │
└───────────────────────────┬─────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼─────────────────────────────┐
│                   Data Tier (MongoDB)                     │
│  Collections: users · books · borrows · feedbacks        │
│               searchlogs                                  │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Request Lifecycle

A typical authenticated API request follows this path:

```
Browser fetch()
  → Express router matching
  → Helmet middleware (CSP, X-Frame-Options, etc.)
  → CORS middleware
  → JSON body parser
  → requestLogger (logs method, path, status, latency)
  → metricsCollector (accumulates per-endpoint statistics)
  → rateLimit (per-IP sliding window)
  → authRequired (JWT verification, user hydration)
  → requireRole (role check, if applicable)
  → Route handler (business logic + Mongoose queries)
  → cache.set (if cacheable)
  → res.json() back to browser
```

### 7.3 Separation of Concerns

| Layer       | Location              | Responsibility                                      |
|-------------|----------------------|-----------------------------------------------------|
| Routes      | `routes/*.js`        | HTTP binding, request validation, response shaping  |
| Models      | `models/*.js`        | Schema definition, indexes, instance methods        |
| Middleware  | `middleware/*.js`    | Cross-cutting: auth, metrics, rate-limit            |
| Services    | `services/*.js`      | External integrations (email, OpenAI)               |
| Utilities   | `utils/*.js`         | Shared pure functions (cache, search algorithms)    |
| Views       | `public/*.html`      | Static HTML pages served by Express                 |
| Client JS   | `public/js/*.js`     | Browser-side logic, API calls, DOM updates          |

---

## 8. Technology Stack and Justification

### 8.1 Runtime — Node.js

Node.js was chosen for the following reasons:

- **Non-blocking I/O** — ideal for I/O-heavy workloads (database queries, HTTP calls to OpenAI).
- **Single language** — JavaScript is used on both server and client, reducing context switching.
- **Ecosystem** — npm offers mature packages for every required capability.
- **Deployment flexibility** — runs on any Linux/macOS/Windows host; trivially containerised.

**Version:** Node.js 18+ (LTS) for stable `node:test` runner (used in test files).

### 8.2 Web Framework — Express.js 5

Express 5 (now stable) was chosen over alternatives:

- **Minimal** — no magic conventions; behaviour is explicit.
- **Middleware ecosystem** — Helmet, cors, express-rate-limit all integrate natively.
- **Express 5 improvements** — async error propagation without `next(err)` wrappers.

### 8.3 Database — MongoDB with Mongoose

MongoDB was chosen because:

- **Flexible schema** — book documents vary (some have digitalUrl, some fileUrl, some both).
- **Full-text index** — native `$text` search with TF-IDF scoring, enabling zero-dependency search.
- **Atlas free tier** — zero-cost cloud hosting for small deployments.
- **Transactions** — MongoDB sessions support ACID transactions (used in borrow/return flows).

Mongoose adds:

- Schema validation and type casting
- Virtual fields and instance methods (e.g., `user.setPassword()`, `user.comparePassword()`)
- Index management in schema definitions

### 8.4 Authentication — JSON Web Tokens (jsonwebtoken)

JWTs provide **stateless authentication**:

- No server-side session store required
- Token carries user ID and role in a signed payload
- 7-day expiry balances security and convenience
- Verified on every request via the `authRequired` middleware

**Security consideration:** The JWT secret is mandatory (`JWT_SECRET` env var). If not set, the server refuses to start.

### 8.5 Password Security — bcryptjs

- bcrypt with **cost factor 10** provides ~100 ms hash time, making brute-force attacks impractical
- `bcryptjs` is a pure-JS implementation, avoiding native module compilation issues on some hosts

### 8.6 HTTP Security — Helmet 8

Helmet sets the following headers on every response:

- `Content-Security-Policy` (fully configured — see Section 22)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Strict-Transport-Security` (when served over HTTPS)
- `X-DNS-Prefetch-Control`

### 8.7 Email — Nodemailer

Nodemailer sends password-reset emails via Gmail SMTP (or any SMTP server). The service degrades gracefully: if `EMAIL_USER` / `EMAIL_PASS` are not configured, email sending is skipped with a console warning. The reset URL is still logged to the console in development.

### 8.8 AI Integration — OpenAI API via Axios

Rather than adding the `openai` npm package (which would introduce a large transitive dependency tree), the integration calls the OpenAI Chat Completions REST endpoint directly using `axios`, which is already a project dependency. This is more transparent, easier to audit, and avoids npm package bloat.

### 8.9 Frontend — Vanilla HTML/CSS/JavaScript

No frontend framework was used:

- **Zero build step** — files are served as-is by Express's `express.static`
- **Fast load times** — no framework bundle overhead
- **Easy to audit** — every behaviour is traceable to a specific function
- **CSP compatible** — no dynamically injected scripts that would violate CSP

---

## 9. Database Design

### 9.1 Collections Overview

HLMS uses five MongoDB collections:

| Collection   | Mongoose Model | Purpose                                          |
|--------------|---------------|--------------------------------------------------|
| `users`      | `User`        | Registered accounts with authentication data     |
| `books`      | `Book`        | Library catalog (physical, digital, hybrid)      |
| `borrows`    | `Borrow`      | Borrow/return transaction records                |
| `feedbacks`  | `Feedback`    | General and book-specific reviews/ratings        |
| `searchlogs` | `SearchLog`   | Query analytics (count, last-searched-at)        |

### 9.2 User Schema

```
Field                  Type      Constraints
─────────────────────────────────────────────────────────
_id                    ObjectId  auto-generated
name                   String    required, trimmed
email                  String    required, unique, lowercase, indexed
passwordHash           String    required (bcrypt hash)
role                   String    enum: ['user','admin'], default: 'user', indexed
isActive               Boolean   default: true, indexed
resetPasswordToken     String    nullable
resetPasswordExpires   Date      nullable
createdAt              Date      auto (timestamps: true)
updatedAt              Date      auto (timestamps: true)
```

**Instance Methods:**
- `user.setPassword(plaintext)` — hashes and stores the password
- `user.comparePassword(plaintext)` — returns a Promise<boolean>

**Indexes:**
- `{ email: 1 }` — unique; fast login lookup
- `{ role: 1 }` — admin queries
- `{ isActive: 1 }` — filter active users

### 9.3 Book Schema

```
Field             Type       Constraints / Notes
────────────────────────────────────────────────────────────────────
_id               ObjectId   auto-generated
title             String     required, trimmed
authors           [String]   required (array), at least one element
description       String     default: ''
tags              [String]   lowercase, trimmed
resourceType      String     enum: ['physical','digital','hybrid'], indexed
isbn              String     sparse index (optional)
category          String     default: 'General', indexed
publicationYear   Number     indexed
totalCopies       Number     default: 1, min: 0
availableCopies   Number     default: 1, min: 0, indexed
digitalUrl        String     optional external URL
fileUrl           String     optional file link
coverImage        String     optional image URL
isActive          Boolean    default: true, indexed (soft-delete flag)
createdAt         Date       auto
updatedAt         Date       auto
```

**Text Index** (weighted):

| Field       | Weight |
|-------------|--------|
| title       | 6      |
| authors     | 5      |
| tags        | 4      |
| description | 2      |

This weighting ensures title matches rank highest, followed by author matches, then tag matches, and finally description matches.

**Compound Indexes:**
- `{ category: 1, resourceType: 1, availableCopies: -1 }` — category/type filtered browsing
- `{ createdAt: -1, isActive: 1 }` — chronological listing with active filter

### 9.4 Borrow Schema

```
Field        Type       Constraints
──────────────────────────────────────────────────────
_id          ObjectId   auto-generated
user         ObjectId   ref: User, required, indexed
book         ObjectId   ref: Book, required, indexed
status       String     enum: ['borrowed','returned'], default: 'borrowed', indexed
dueAt        Date       set on creation (configurable days from now)
returnedAt   Date       set on return
fine         Number     default: 0 (calculated on return if overdue)
note         String     optional borrower note
createdAt    Date       auto
updatedAt    Date       auto
```

**Compound Indexes:**
- `{ user: 1, status: 1, createdAt: -1 }` — my-borrows query
- `{ book: 1, status: 1, createdAt: -1 }` — book availability queries

**Business Rules:**
- Only `physical` and `hybrid` books decrement `availableCopies`
- Digital-only books can be borrowed unlimited times simultaneously
- Fine = `Math.ceil(overdueDays) × FINE_PER_DAY`

### 9.5 Feedback Schema

```
Field      Type       Constraints
────────────────────────────────────────────────────
_id        ObjectId   auto-generated
user       ObjectId   ref: User, required, indexed
book       ObjectId   ref: Book, nullable (null = general feedback)
message    String     required, trimmed, maxlength: 2000
rating     Number     min: 1, max: 5, default: 5
createdAt  Date       auto, indexed (sort)
updatedAt  Date       auto
```

### 9.6 SearchLog Schema

```
Field            Type     Constraints
────────────────────────────────────────────────────
_id              ObjectId auto-generated
query            String   unique (normalized query text)
count            Number   incremented on each search
lastSearchedAt   Date     updated on each search
```

**Upsert pattern:** Every search call does a `findOneAndUpdate` with `{ upsert: true }` to atomically increment the count.

---

## 10. Backend Implementation

### 10.1 Entry Point — `server.js`

`server.js` is the application bootstrap file. It:

1. Loads environment variables from `.env` using `dotenv`
2. Creates the Express app instance
3. Applies global middleware (Helmet, CORS, JSON parser, URL-encoded parser, requestLogger, metricsCollector, rateLimit)
4. Mounts route handlers at their respective `/api/*` prefixes
5. Serves static files from `public/`
6. Maps HTML page routes (`/`, `/books`, `/login`, etc.)
7. Registers a 404 catch-all and a global error handler
8. Connects to MongoDB and starts listening on the configured PORT

**Startup validation:** The server refuses to start if `MONGODB_URI` or `JWT_SECRET` are missing, preventing misconfigured deployments.

```javascript
// server.js startup guard (simplified)
async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  if (!process.env.JWT_SECRET)  throw new Error('JWT_SECRET is required');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
```

### 10.2 Route Structure

All API routes are prefixed with `/api`:

| Prefix           | File               | Description                          |
|------------------|--------------------|--------------------------------------|
| `/api/auth`      | `routes/auth.js`   | Registration, login, profile, reset  |
| `/api/books`     | `routes/books.js`  | Book catalog CRUD                    |
| `/api/search`    | `routes/search.js` | Smart search (fuzzy + AI)            |
| `/api/*`         | `routes/borrow.js` | Borrowing, returning, borrow history |
| `/api/feedback`  | `routes/feedback.js`| Reviews and ratings                 |
| `/api/admin`     | `routes/admin.js`  | Admin-only: users, analytics         |
| `/api/health`    | `server.js`        | Health check + metrics snapshot      |

### 10.3 Auth Routes (`routes/auth.js`)

#### POST `/api/auth/register`

Registers a new user account.

**Request body:**
```json
{ "name": "Alice Smith", "email": "alice@example.com", "password": "secret123" }
```

**Validation:**
- `name`, `email`, `password` are all required
- `password` must be at least 6 characters
- Email must be unique (409 Conflict if duplicate)

**Response (201):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": "...", "name": "Alice Smith", "email": "alice@example.com", "role": "user" }
}
```

**Implementation notes:**
- Email is normalised to lowercase before storage
- Password is hashed via `user.setPassword()` (bcrypt, cost 10)
- A JWT is issued immediately so the user is logged in after registration

#### POST `/api/auth/login`

Authenticates an existing user.

**Request body:**
```json
{ "email": "alice@example.com", "password": "secret123" }
```

**Validation:**
- Both fields required
- User must exist, password must match, account must be active

**Response (200):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": "...", "name": "Alice Smith", "email": "alice@example.com", "role": "user" }
}
```

**Security note:** Inactive accounts (`isActive: false`) receive a 401 with the same "Invalid credentials" message as wrong-password attempts. This avoids leaking account existence.

#### GET `/api/auth/me`

Returns the currently authenticated user's profile. Requires Bearer token.

**Response (200):**
```json
{
  "success": true,
  "user": { "_id": "...", "name": "Alice", "email": "alice@example.com", "role": "user", "isActive": true }
}
```

#### PUT `/api/auth/profile`

Updates the authenticated user's name, email, and/or password.

**Request body (all fields optional):**
```json
{
  "name": "Alice J. Smith",
  "email": "alice.new@example.com",
  "currentPassword": "secret123",
  "newPassword": "newSecret456"
}
```

**Rules:**
- Changing email checks for conflicts with other accounts
- Changing password requires `currentPassword` to be verified first
- New password must be ≥ 6 characters

#### POST `/api/auth/forgot-password`

Initiates a password reset flow.

**Request body:**
```json
{ "email": "alice@example.com" }
```

**Behaviour:**
- Generates a cryptographically random 32-byte hex token
- Stores the token + 1-hour expiry in the user document
- Sends a reset email via Nodemailer
- Always returns 200 with a generic message (prevents email enumeration)

#### POST `/api/auth/reset-password/:token`

Completes the password reset.

**Request body:**
```json
{ "password": "brandNewPass123" }
```

**Validation:**
- Token must exist and not be expired
- New password must be ≥ 6 characters

**On success:** Password is updated, token is cleared, user can now log in.

#### GET `/api/auth/setup-admin`

Returns whether first-admin setup is needed (no admin exists yet).

**Response:**
```json
{ "success": true, "setupNeeded": true }
```

#### POST `/api/auth/setup-admin`

Creates the first admin account. Fails with 409 if an admin already exists. If the email belongs to an existing regular user, it promotes that account to admin after verifying the password.

### 10.4 Book Routes (`routes/books.js`)

#### GET `/api/books`

Lists all active books with pagination and optional filters.

**Query parameters:**

| Parameter     | Type    | Default | Description                          |
|---------------|---------|---------|--------------------------------------|
| `page`        | int     | 1       | Page number                          |
| `limit`       | int     | 12      | Results per page (max 50)            |
| `resourceType`| string  | —       | Filter by `physical`/`digital`/`hybrid` |
| `availableOnly`| bool  | —       | `true` to show only available books  |

**Response:**
```json
{
  "success": true,
  "books": [ { "_id": "...", "title": "Clean Code", "authors": ["Robert C. Martin"], ... } ],
  "total": 42,
  "page": 1,
  "pages": 4
}
```

**Caching:** Results are cached for 20 seconds per unique `{page, limit, filters}` combination. Cache is busted when any book is created, updated, or deleted.

#### GET `/api/books/:id`

Returns a single book by MongoDB ObjectId. Returns 404 if not found or soft-deleted.

#### POST `/api/books` (Admin only)

Creates a new book.

**Request body:**
```json
{
  "title": "Clean Code",
  "authors": ["Robert C. Martin"],
  "description": "A handbook of agile software craftsmanship.",
  "tags": ["programming", "best-practices", "refactoring"],
  "resourceType": "physical",
  "isbn": "9780132350884",
  "category": "Computer Science",
  "publicationYear": 2008,
  "totalCopies": 3,
  "availableCopies": 3
}
```

**Validation:**
- `title` is required
- `authors` must be a non-empty array

#### PUT `/api/books/:id` (Admin only)

Updates any fields of a book. Partial updates are supported (only provided fields are changed).

#### DELETE `/api/books/:id` (Admin only)

Soft-deletes a book by setting `isActive: false`. The book remains in the database for historical borrow records.

### 10.5 Search Route (`routes/search.js`)

The search route is the most complex in the system. It:

1. Normalises the query (lowercase, trim, collapse whitespace)
2. Checks the in-memory cache
3. Logs/increments the search in `SearchLog`
4. Runs two parallel MongoDB queries:
   - **Text search** — `$text: { $search: query }` with TF-IDF scoring
   - **Partial regex search** — `$or` across title, authors, description, tags
5. Deduplicates results (text matches take precedence for ranking metadata)
6. Runs `rankBooks()` — fuzzy Levenshtein scoring to produce a final ranked list
7. Optionally calls OpenAI for semantic reranking (if enabled)
8. Paginates the ranked results
9. Caches the response for 20 seconds
10. Returns results with a `mode` field: `'local'`, `'ai'`, or `'local_fallback'`

**Query parameters:**

| Parameter | Type | Default | Description             |
|-----------|------|---------|-------------------------|
| `q`       | str  | —       | Search query (required) |
| `page`    | int  | 1       | Page number             |
| `limit`   | int  | 10      | Results per page (max 50)|

**Response:**
```json
{
  "success": true,
  "query": "clean code",
  "books": [ ... ],
  "total": 5,
  "page": 1,
  "pages": 1,
  "mode": "ai"
}
```

The `mode` field tells the frontend how results were ranked:
- `local` — no AI, ranked by MongoDB text score + fuzzy score
- `ai` — ranked by OpenAI GPT
- `local_fallback` — AI was requested but failed; fell back to local ranking

### 10.6 Borrow Routes (`routes/borrow.js`)

#### POST `/api/borrow/:bookId`

Borrows a book. Uses a **MongoDB session** (transaction) to prevent race conditions when multiple users try to borrow the last copy simultaneously.

**Flow:**
1. Start session and transaction
2. Find the book (`findById` within session)
3. Check availability (abort if `availableCopies <= 0` for physical/hybrid)
4. Decrement `availableCopies` and save
5. Create a `Borrow` document with due date
6. Commit transaction
7. Return the created borrow record

**Due date calculation:**
```
dueAt = now + DEFAULT_BORROW_DAYS × 24 × 60 × 60 × 1000
```
Default: 14 days. Configurable via `DEFAULT_BORROW_DAYS` env var.

**Digital books:** Can be borrowed without decrementing any counter. Unlimited simultaneous "borrows" for digital resources.

#### POST `/api/return/:borrowId`

Returns a borrowed book.

**Access control:**
- The borrower themselves can return their own book
- Any admin can return any book on behalf of a user

**Fine calculation (on return):**
```
if (returnedAt > dueAt) {
  overdueDays = ceil((returnedAt - dueAt) / 86400000)
  fine = overdueDays × FINE_PER_DAY
}
```

Default fine rate: $1/day. Configurable via `FINE_PER_DAY` env var.

**Note:** `availableCopies` is incremented (capped at `totalCopies`) on return of physical/hybrid books.

#### GET `/api/borrows/me`

Returns the authenticated user's full borrow history, populated with book title, authors, and type. Sorted newest first.

#### GET `/api/borrows/me/alerts`

Returns only **active borrows due within the next 2 days**. Used by the dashboard to show urgent alerts.

#### GET `/api/borrows` (Admin only)

Returns all borrows across all users, fully populated with user name/email and book details.

### 10.7 Feedback Routes (`routes/feedback.js`)

#### POST `/api/feedback`

Submits a feedback entry. Can be general (no `bookId`) or book-specific (with `bookId`).

**Request body:**
```json
{ "message": "Great book for beginners!", "rating": 5, "bookId": "optional-book-id" }
```

**Validation:**
- `message` is required and must be non-empty
- `rating` defaults to 5 if not provided; clamped to 1–5 by the schema
- `bookId` is optional; validated as a MongoDB ObjectId if provided

#### GET `/api/feedback/book/:bookId` (Public)

Returns all reviews for a specific book, populated with reviewer name. Sorted newest first.

#### GET `/api/feedback` (Admin only)

Returns all feedback across the system, populated with user name/email and book title.

### 10.8 Admin Routes (`routes/admin.js`)

All admin routes require authentication + `role: 'admin'`. The middleware is applied at the router level:

```javascript
router.use(authRequired, requireRole('admin'));
```

#### GET `/api/admin/analytics/searches`

Returns two arrays:
- `top` — 20 most-searched queries (by count)
- `recent` — 20 most recently searched queries

#### GET `/api/admin/users`

Lists all users with pagination and optional name/email search.

**Query parameters:**

| Parameter | Default | Description                    |
|-----------|---------|--------------------------------|
| `page`    | 1       | Page number                    |
| `limit`   | 20      | Per page (max 100)             |
| `search`  | —       | Substring filter on name/email |

Passwords (`passwordHash`) are excluded from all responses.

#### PUT `/api/admin/users/:id/role`

Changes a user's role to `user` or `admin`.

#### PUT `/api/admin/users/:id/active`

Activates or deactivates a user account. Prevents admins from deactivating their own account (to avoid lockout).

### 10.9 Health Endpoint

#### GET `/api/health`

Returns system health information and metrics:

```json
{
  "status": "ok",
  "timestamp": "2026-04-21T12:00:00.000Z",
  "database": "connected",
  "metrics": {
    "totalRequests": 1234,
    "totalErrors": 5,
    "errorRate": 0.41,
    "endpoints": [
      {
        "endpoint": "GET /api/books",
        "count": 200,
        "avgMs": 45.2,
        "maxMs": 312.0,
        "minMs": 18.1
      }
    ]
  }
}
```

---

## 11. Frontend Implementation

### 11.1 Static File Serving

All frontend assets live in the `public/` directory:

```
public/
  index.html          Landing/home page
  login.html          Login form
  register.html       Registration form
  books.html          Book catalog with search
  dashboard.html      User dashboard (borrows, alerts, feedback)
  admin.html          Admin panel (books, users, borrows, analytics)
  profile.html        Edit profile / change password
  forgot-password.html  Request password reset
  reset-password.html   Set new password via token
  setup.html          First-admin setup wizard
  css/
    style.css         Application-wide stylesheet
  js/
    api.js            All API call functions
    auth.js           Login / register / setup logic
    nav.js            Navigation bar (show/hide links based on auth state)
    books.js          Book catalog rendering + borrow + reviews
    dashboard.js      User dashboard (borrows, alerts, feedback form)
    admin.js          Admin panel (CRUD, user mgmt, analytics)
    profile.js        Profile form handling
    home.js           Landing page dynamic content
```

### 11.2 `api.js` — Centralised API Client

`api.js` exports pure functions for every API endpoint. All functions use a shared `request()` helper that:

1. Prepends `API_BASE = '/api'` to the path
2. Attaches `Content-Type: application/json` and `Authorization: Bearer <token>` headers
3. Throws a descriptive `Error` if the response is not OK or `data.success === false`
4. Returns the parsed JSON data

This single-file approach means:
- Token management is centralised (reads `localStorage.getItem('token')`)
- Error handling is consistent across all callers
- Adding a new API endpoint requires only one new function in `api.js`

Key functions:

| Function              | Method | Path                              |
|-----------------------|--------|-----------------------------------|
| `loginAPI()`          | POST   | `/auth/login`                     |
| `registerAPI()`       | POST   | `/auth/register`                  |
| `meAPI()`             | GET    | `/auth/me`                        |
| `getBooks()`          | GET    | `/books`                          |
| `smartSearch()`       | GET    | `/search?q=...`                   |
| `borrowBook()`        | POST   | `/borrow/:bookId`                 |
| `returnBorrow()`      | POST   | `/return/:borrowId`               |
| `myBorrows()`         | GET    | `/borrows/me`                     |
| `myBorrowAlerts()`    | GET    | `/borrows/me/alerts`              |
| `submitFeedback()`    | POST   | `/feedback`                       |
| `getBookFeedback()`   | GET    | `/feedback/book/:bookId`          |
| `submitBookFeedback()`| POST   | `/feedback`                       |
| `listUsers()`         | GET    | `/admin/users`                    |
| `updateUserRole()`    | PUT    | `/admin/users/:id/role`           |
| `setUserActive()`     | PUT    | `/admin/users/:id/active`         |
| `createBookAPI()`     | POST   | `/books`                          |
| `updateBook()`        | PUT    | `/books/:id`                      |
| `deleteBook()`        | DELETE | `/books/:id`                      |
| `forgotPasswordAPI()` | POST   | `/auth/forgot-password`           |
| `resetPasswordAPI()`  | POST   | `/auth/reset-password/:token`     |
| `updateProfileAPI()`  | PUT    | `/auth/profile`                   |
| `listSearchAnalytics()`| GET  | `/admin/analytics/searches`       |
| `checkSetupAPI()`     | GET    | `/auth/setup-admin`               |
| `setupAdminAPI()`     | POST   | `/auth/setup-admin`               |

### 11.3 `nav.js` — Navigation Bar

`nav.js` runs on every page. On `DOMContentLoaded` it reads the current user from `localStorage`, then:

- If logged in as admin: shows "Admin" nav link
- If logged in as user: shows "Dashboard" and "Profile" nav links
- Shows the user's name in `#nav-user`
- Shows the Logout button, which clears `localStorage` and redirects to `/login`

### 11.4 `books.js` — Book Catalog Page

The books page renders the full catalog and handles search, borrowing, and book reviews.

**`loadBooks()`:**
1. Reads the search input value
2. If a query is present, calls `smartSearch(q, 1, 20)`; otherwise calls `getBooks(1, 20)`
3. Renders each book as a card with title, authors, type, availability badge, and borrow/review buttons
4. Availability badges are colour-coded: green (available), red (unavailable)
5. Digital books always show "Digital – Always Available"

**`borrow(bookId)`:**
- Redirects to login if unauthenticated
- Calls `borrowBook(bookId)` and alerts success/failure
- Refreshes the book list on success

**`toggleBookFeedback(bookId)`:**
- Shows/hides the reviews section inline within the book card
- Lazy-loads reviews on first expand

**`loadBookFeedbackSection(bookId)`:**
- Fetches reviews via `getBookFeedback(bookId)`
- Renders star ratings (★/☆) and reviewer names
- Shows a review submission form for logged-in users

**XSS prevention:** All user-provided content rendered as HTML is escaped via `escHtml()` and `escHtmlAttr()` helper functions that replace `&`, `<`, `>`, `"`, and `'` with their HTML entities.

### 11.5 `auth.js` — Authentication Pages

Handles three pages:

**Login (`/login`):**
- `handleLogin(event)` — calls `loginAPI()`, stores `token` + `currentUser` in `localStorage`, redirects to `/dashboard` (or `/admin` for admins)

**Register (`/register`):**
- `handleRegister(event)` — calls `registerAPI()`, auto-logs in, redirects to `/dashboard`

**Setup (`/setup`):**
- `handleSetupAdmin(event)` — checks `setupNeeded`; if no admin exists, creates the first admin account

### 11.6 `dashboard.js` — User Dashboard

Renders:
1. **Due-date alerts** — calls `myBorrowAlerts()` and highlights borrows due within 2 days in amber
2. **Active borrows** — calls `myBorrows()` and renders a table with title, due date, and a Return button
3. **Feedback form** — submits general library feedback (not book-specific)

The Return action calls `returnBorrow(borrowId)` and refreshes the borrow list.

### 11.7 `admin.js` — Admin Panel

The admin panel is a single-page admin interface with multiple sections:

1. **Book Management**
   - Lists all books in a table
   - Inline edit form pre-populated with current book data
   - Delete button with confirmation
   - Create book form at the top

2. **User Management**
   - Lists all users with name, email, role, and active status
   - Buttons to promote/demote (user ↔ admin) and activate/deactivate
   - Prevents self-deactivation

3. **Borrow Management**
   - Lists all borrows with user, book, status, due date, fine
   - Admin can trigger returns for any borrow

4. **Search Analytics**
   - Two tables: Top searches (by count) and Recent searches (by last-searched-at)

### 11.8 `profile.js` — Profile Page

Pre-fills the form with the current user's name and email from `localStorage`. On submit, calls `updateProfileAPI()` with only the changed fields. Displays success/error feedback inline.

### 11.9 CSS Design (`style.css`)

The stylesheet implements a clean, minimal design:

- **Colour palette:** Navy (#0a3d62) primary, white background, subtle grey borders
- **Responsive layout:** Container max-width 1200px, flexbox navbar
- **Components:** `.btn`, `.btn-small`, `.btn-primary`, `.badge`, `.card`, `.book-card`, `.form-group`, `.loading`, `.error`, `.success`
- **Mobile-friendly:** Navbar wraps on small screens; book cards stack vertically

---

## 12. Authentication and Authorization

### 12.1 JWT Flow

```
1. Client sends credentials → POST /api/auth/login
2. Server verifies password (bcrypt.compare)
3. Server signs JWT:  { sub: userId, role: userRole }  with JWT_SECRET, expires: 7d
4. Client stores JWT in localStorage
5. Client attaches "Authorization: Bearer <token>" to every subsequent request
6. authRequired middleware:
   a. Extracts token from header
   b. Verifies signature with JWT_SECRET
   c. Looks up user in database (to check isActive)
   d. Attaches user object to req.user
   e. Calls next()
```

### 12.2 Role-Based Access Control

Two roles exist: `user` and `admin`.

| Operation                        | user | admin |
|----------------------------------|------|-------|
| Browse/search books              | ✓    | ✓     |
| Borrow books                     | ✓    | ✓     |
| Return own borrows               | ✓    | ✓     |
| Submit feedback/reviews          | ✓    | ✓     |
| View own borrows                 | ✓    | ✓     |
| Update own profile               | ✓    | ✓     |
| Create/update/delete books       | ✗    | ✓     |
| Return any borrow                | ✗    | ✓     |
| View all borrows                 | ✗    | ✓     |
| View all feedback                | ✗    | ✓     |
| Manage users (role/active)       | ✗    | ✓     |
| View search analytics            | ✗    | ✓     |

The `requireRole(...roles)` middleware is a factory that returns an Express middleware checking `req.user.role`.

### 12.3 Password Reset Security

- Token is a **32-byte cryptographically random hex string** (256-bit entropy)
- Token expires in **1 hour**
- Token is stored hashed — wait, reviewed: the token is stored in plaintext in the DB but is a random value (not derived from user data), so rainbow tables are irrelevant
- Token is cleared from the DB on successful reset or on expiry
- The email enumeration attack is mitigated: the response is identical whether the email exists or not

---

## 13. Smart Search System

### 13.1 Overview

The search system operates in two layers:

```
User query
    │
    ▼
Layer 1: MongoDB Full-Text Index ($text + TF-IDF)
    │
    ▼
Layer 2: Partial Regex Fallback (catches partial words)
    │
    ▼
Deduplication (text matches preserve _textScore)
    │
    ▼
Layer 3: Levenshtein Fuzzy Ranking (rankBooks)
    │
    ▼
Layer 4 (optional): OpenAI Semantic Reranking
    │
    ▼
Paginated results + mode indicator
```

### 13.2 Query Normalisation

```javascript
function normalizeText(value) {
  return String(value || '').toLowerCase().trim().replace(/\s+/g, ' ');
}
```

This ensures "  Clean  Code  " becomes "clean code" before any comparison.

### 13.3 MongoDB Full-Text Search

The Book schema defines a compound text index across title, authors, description, and tags with custom weights:

```javascript
BookSchema.index(
  { title: 'text', authors: 'text', description: 'text', tags: 'text' },
  { weights: { title: 6, authors: 5, tags: 4, description: 2 } }
);
```

MongoDB's `$text` operator tokenises, stems, and scores each document. The `{ score: { $meta: 'textScore' } }` projection retrieves the relevance score for each match.

**Limitation:** MongoDB's text tokeniser splits on word boundaries. "c++" may not match "cpp". "react.js" may not match "reactjs". The partial-regex layer compensates for this.

### 13.4 Partial Regex Search

For queries that the full-text engine misses (very short tokens, substrings, compound words):

```javascript
function buildPartialRegex(query) {
  const parts = normalizeText(query).split(' ').filter(Boolean).map(escapeRegex);
  return new RegExp(parts.join('.*'), 'i');
}
```

For a query "clean code", this produces `/clean.*code/i`, which matches any title/author/tag/description where "clean" appears before "code", regardless of what's between them.

The regex is run against title, authors, description, and tags fields in a `$or` query.

**Performance note:** Regex queries can be slow on large collections without indexes. The SEARCH_CANDIDATE_LIMIT (default 100) caps the result set. For very large catalogs (>10,000 books), consider adding a Typesense vector index (the `typesense` npm package is already in `package.json`).

### 13.5 Fuzzy Ranking — Levenshtein Distance

After deduplication, every candidate is scored by `rankBooks()`:

```javascript
score =
  (book._textScore || 0) * 5          // MongoDB TF-IDF (heavy weight)
  + (title.includes(q) ? 2 : 0)       // Exact substring bonus
  + fuzzyScore(q, title) * 2          // Fuzzy title match
  + fuzzyScore(q, authors)            // Fuzzy author match
  + fuzzyScore(q, tags)               // Fuzzy tag match
  + fuzzyScore(q, fullBlob) * 0.5     // Fuzzy whole-document match
```

`fuzzyScore(a, b)` returns a value in [0, 1]:
- 1.0 if `b` contains `a` as a substring
- Otherwise: `max(0, 1 - levenshtein(a,b) / max(len(a),len(b)))`

This means a query "clen code" (typo) still scores highly against the title "Clean Code" because the Levenshtein distance is small relative to the string length.

### 13.6 Search Candidate Limit

The `SEARCH_CANDIDATE_LIMIT` env var (default 100, range 20–300) controls how many candidates each MongoDB query fetches before the in-process ranking step. A higher limit improves recall but increases memory usage and latency.

---

## 14. AI-Powered Search Integration (OpenAI)

### 14.1 Overview

When `USE_OPENAI_SEARCH=true` and `OPENAI_API_KEY` is set, the search pipeline calls OpenAI's Chat Completions API to semantically rerank the top 20 candidates returned by the local search engine.

This provides benefits beyond what Levenshtein fuzzy matching can achieve:

- **Semantic understanding** — "book about memory management" finds "The C Programming Language" even without those exact words
- **Synonym expansion** — "ML framework" finds books tagged "machine learning" or "neural networks"
- **Intent-aware ranking** — "beginner python" ranks introductory books above advanced ones

### 14.2 Implementation — `services/aiSearchAdapter.js`

The adapter is structured as a single exported function `optionalAiEnhanceSearch({ query, results })`.

#### 14.2.1 Feature Flag Check

```javascript
const useOpenAI =
  String(process.env.USE_OPENAI_SEARCH || 'false').toLowerCase() === 'true';

if (!useOpenAI || !process.env.OPENAI_API_KEY) {
  return { mode: 'local', results };
}
```

Both `USE_OPENAI_SEARCH=true` AND a non-empty `OPENAI_API_KEY` are required. If either is missing, the function returns immediately with local results.

#### 14.2.2 Candidate Preparation

Only the top `MAX_CANDIDATES = 20` results are sent to OpenAI. Any results beyond position 20 are appended at the end of the reranked list unchanged:

```javascript
const candidates = results.slice(0, MAX_CANDIDATES);
const tail = results.slice(MAX_CANDIDATES);
const reRanked = await reRankWithOpenAI(query, candidates);
return { mode: 'ai', results: [...reRanked, ...tail] };
```

#### 14.2.3 Book Summarisation

Each candidate is compressed into a single line for the prompt:

```
[0] id:6123... | "Clean Code" by Robert C. Martin | tags: programming, refactoring | type: physical
[1] id:6124... | "The Pragmatic Programmer" by Andrew Hunt, David Thomas | tags: craftsmanship, productivity | type: hybrid
```

This keeps token usage minimal while giving the model enough context to judge relevance.

#### 14.2.4 Prompt Design

**System prompt:**
> You are a library search assistant. Given a user query and a numbered list of books, return ONLY a JSON array of book IDs (the "id:" value from each line) ordered from most relevant to least relevant. Include only IDs that are genuinely relevant to the query. Do not include any explanation, markdown, or extra text — just the raw JSON array.

**User prompt:**
> User query: "{query}"  
> Candidates:  
> {candidateText}  
>  
> Return a JSON array of relevant book IDs ordered by relevance, e.g. ["id1","id2"].

The `temperature: 0` setting ensures deterministic, consistent rankings. `max_tokens: 512` is sufficient for up to 20 IDs while bounding cost.

#### 14.2.5 Response Parsing and Reordering

```javascript
const orderedIds = JSON.parse(raw);  // ["id1", "id2", ...]

const idToBook = new Map(candidates.map((b) => [String(b._id), b]));
const reRanked = [];
const seen = new Set();

for (const id of orderedIds) {
  const book = idToBook.get(String(id));
  if (book && !seen.has(String(id))) {
    reRanked.push(book);
    seen.add(String(id));
  }
}

// Append candidates the AI didn't mention (safety net)
for (const book of candidates) {
  if (!seen.has(String(book._id))) reRanked.push(book);
}
```

Books that the AI considers irrelevant are excluded from the primary list. Books not mentioned at all (possibly a model oversight) are appended at the end.

#### 14.2.6 Graceful Fallback

Any error (network timeout, malformed JSON, API quota exceeded, invalid key) is caught:

```javascript
} catch (err) {
  console.error('[aiSearchAdapter] OpenAI call failed, falling back to local ranking:', err.message);
  return { mode: 'local_fallback', results };
}
```

The user receives the local fuzzy-ranked results with `mode: 'local_fallback'`. The error is logged but not propagated. The system remains fully functional even with an invalid or expired API key.

### 14.3 Enabling OpenAI Search

In your `.env` file:

```env
USE_OPENAI_SEARCH=true
OPENAI_API_KEY=sk-proj-...your-key-here...
OPENAI_MODEL=gpt-3.5-turbo    # optional, defaults to gpt-3.5-turbo
```

**Model recommendations:**

| Model          | Cost      | Speed     | Quality      |
|----------------|-----------|-----------|--------------|
| gpt-3.5-turbo  | Low       | Fast      | Good         |
| gpt-4o-mini    | Very Low  | Very Fast | Good         |
| gpt-4o         | Medium    | Medium    | Excellent    |
| gpt-4          | High      | Slow      | Excellent    |

For a library application, `gpt-3.5-turbo` or `gpt-4o-mini` provides excellent results at minimal cost. Each search call consumes approximately 300–600 tokens.

### 14.4 Cost Estimation

At `gpt-3.5-turbo` pricing (~$0.002 per 1K tokens):
- Per search: ~500 tokens ≈ $0.001
- 1,000 searches/day ≈ $1.00/day

With caching (20-second TTL), repeat searches for the same query do not incur additional API calls.

---

## 15. Feedback and Review System

### 15.1 Two Types of Feedback

| Type           | `bookId` field | Visible to     | Use case                        |
|----------------|----------------|----------------|---------------------------------|
| General        | `null`         | Admins only    | Overall library feedback        |
| Book-specific  | ObjectId       | Everyone       | Review + star rating for a book |

### 15.2 Rating System

Ratings are integers from 1 to 5 (stars). The schema enforces `min: 1, max: 5` at the database level. The frontend renders ratings using Unicode star characters (★ for filled, ☆ for empty).

### 15.3 Review Submission

Book reviews are submitted via an inline form that appears when the user clicks "Reviews" on a book card. The form is only rendered for authenticated users. Anonymous visitors see a "Login to post a review" prompt.

### 15.4 Review Display

Reviews are loaded lazily: they only fetch from the API when the reviews section is first expanded. Re-expanding a previously closed section re-fetches to show the latest reviews. Each review shows:
- Reviewer name
- Star rating (5 stars displayed)
- Review message
- Relative timestamp (from MongoDB `createdAt`)

---

## 16. Borrowing and Return System

### 16.1 Borrow Flow

```
User clicks "Borrow/Request"
       │
       ▼
Frontend checks localStorage for token
       │
   not logged in? → redirect to /login
       │
       ▼
POST /api/borrow/:bookId
       │
       ▼
Start MongoDB transaction (session)
       │
       ▼
Find book within session (locks document)
       │
  not found? → abort, 404
       │
  availableCopies <= 0 (physical/hybrid)? → abort, 400
       │
       ▼
Decrement availableCopies, save (within session)
       │
       ▼
Create Borrow document (within session):
  { user, book, dueAt = now + DEFAULT_BORROW_DAYS, status: 'borrowed' }
       │
       ▼
Commit transaction
       │
       ▼
Return 201 with borrow document
```

### 16.2 Why MongoDB Transactions?

Without transactions, two users borrowing the last copy simultaneously could both read `availableCopies: 1`, both pass the availability check, and both successfully borrow — leaving `availableCopies: -1`. The MongoDB session transaction prevents this by serialising access to the document within the session.

### 16.3 Return Flow

```
User/Admin clicks "Return"
       │
       ▼
POST /api/return/:borrowId
       │
       ▼
Start MongoDB transaction
       │
       ▼
Find borrow within session
       │
  not found? → abort, 404
  already returned? → abort, 400
  not owner AND not admin? → abort, 403
       │
       ▼
Set status='returned', returnedAt=now
       │
       ▼
Calculate fine if overdue:
  overdueDays = ceil((returnedAt - dueAt) / 86400000)
  fine = overdueDays × FINE_PER_DAY
       │
       ▼
Increment availableCopies (physical/hybrid), cap at totalCopies
       │
       ▼
Commit transaction
       │
       ▼
Return 200 with updated borrow
```

### 16.4 Due Date Alerts

The `/api/borrows/me/alerts` endpoint returns all borrows with `status: 'borrowed'` and `dueAt ≤ now + 2 days`. The dashboard renders these with a visual amber highlight to prompt the user to return before the due date.

---

## 17. Email Notification Service

### 17.1 Architecture

The email service (`services/email.js`) wraps Nodemailer with a lazy-initialised transporter. The transporter is created on first use (not at module load time) to avoid startup failures when email credentials are not configured.

### 17.2 Configuration

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-16-char-app-password
APP_URL=https://your-deployed-url.com
```

**Gmail Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a 16-character App Password for "Mail"
4. Use that password as `EMAIL_PASS` (not your regular Gmail password)

### 17.3 Graceful Degradation

If `EMAIL_USER` or `EMAIL_PASS` is not set, `sendMail()` logs a warning and returns without throwing. This means:
- The server starts normally
- The reset token is still generated and stored
- In development, the reset URL can be found in the server console logs
- Users simply won't receive the email

### 17.4 Email Content

Password reset emails include both plain-text and HTML versions:

**Subject:** `HLMS – Password Reset Request`

**HTML body:**
```html
<p>Hello <strong>Alice</strong>,</p>
<p>Reset your password by clicking the link below:</p>
<p><a href="https://example.com/reset-password?token=...">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
<p>If you did not request this, you can ignore this email.</p>
```

---

## 18. Caching System

### 18.1 Design

HLMS uses a **custom in-memory LRU cache** with TTL support (`utils/cache.js`). It does not require Redis or any external infrastructure.

### 18.2 Implementation

The cache is a `Map<string, { value, expiresAt }>` with three operations:

**`cache.get(key)`:**
- Returns `null` if key doesn't exist or has expired (and deletes the expired entry)
- Implements LRU by deleting and re-inserting the accessed entry (Maps maintain insertion order)

**`cache.set(key, value, ttlMs)`:**
- Upserts the entry with an expiry timestamp
- Enforces `MAX_ITEMS = 250` by evicting the oldest entry (first in Map order) when the limit is reached

**`cache.delByPrefix(prefix)`:**
- Deletes all keys starting with a given prefix
- Used to bust `books:list:*` and `search:*` caches on book mutations

### 18.3 Cache Keys

| Pattern                        | TTL      | Busted by              |
|--------------------------------|----------|------------------------|
| `books:list:{page}:{limit}:{filters}` | 20s | Book create/update/delete |
| `search:{query}:{page}:{limit}`       | 20s | Book create/update/delete |

### 18.4 Why Not Redis?

For a small-to-medium library with moderate traffic, an in-memory cache is entirely sufficient and keeps the deployment simple. Redis would be appropriate when:
- The application scales to multiple Node.js instances (cache would need to be shared)
- Cache sizes exceed hundreds of MB
- TTL precision below 1 second is needed

The cache implementation is easily replaceable with a Redis adapter without changing any calling code (same `get/set/delByPrefix` interface).

---

## 19. Rate Limiting

### 19.1 Design

A custom per-IP sliding-window rate limiter is implemented in `middleware/rateLimit.js`. It maintains a `Map<ip:path, { count, resetAt }>` in memory.

### 19.2 Algorithm

```javascript
const key = `${ip}:${req.path}`;
const current = buckets.get(key);

if (!current || now > current.resetAt) {
  // New window
  buckets.set(key, { count: 1, resetAt: now + windowMs });
  return next();
}

if (current.count >= max) {
  return res.status(429).json({ success: false, error: 'Too many requests.' });
}

current.count += 1;
return next();
```

Each `{IP, path}` pair has its own independent bucket. This means heavy use of search doesn't block other endpoints.

### 19.3 Configuration

```env
RATE_LIMIT_WINDOW_MS=60000   # 1 minute window
RATE_LIMIT_MAX=180           # 180 requests per window per IP per path
```

The rate limiter is applied to all `/api/*` routes:

```javascript
app.use('/api', rateLimit({ windowMs: ..., max: ... }));
```

---

## 20. Metrics and Monitoring

### 20.1 Request Logger

Every request is logged to stdout in the format:

```
2026-04-21T12:00:00.000Z GET /api/books 200 45ms
2026-04-21T12:00:01.000Z POST /api/borrow/6123... 201 120ms
```

### 20.2 Metrics Collector

The `metricsCollector` middleware accumulates per-endpoint statistics:

- **Request count**
- **Total latency** (nanosecond precision via `process.hrtime.bigint()`)
- **Max latency**
- **Min latency**
- **Average latency** (computed at read time)

And global statistics:
- **Total requests** across all endpoints
- **Total errors** (4xx + 5xx)
- **Error rate** (%)

### 20.3 Accessing Metrics

```
GET /api/health
```

Returns the full metrics snapshot alongside database connection status. This endpoint is publicly accessible (no auth required) to allow monitoring tools (UptimeRobot, Datadog agent, etc.) to poll it.

---

## 21. Security Implementation

### 21.1 Overview

Security is layered across multiple concerns:

| Threat                          | Mitigation                                         |
|---------------------------------|----------------------------------------------------|
| Stolen credentials              | Passwords hashed with bcrypt (cost 10)             |
| JWT forgery                     | Signed with 256-bit secret, verified on every req  |
| Privilege escalation            | Role checked by requireRole middleware              |
| XSS (stored)                    | All rendered content HTML-escaped in frontend      |
| XSS (reflected via CSP)         | Content-Security-Policy blocks inline scripts      |
| CSRF                            | JWT-only auth; no cookies; no CSRF surface          |
| Clickjacking                    | `X-Frame-Options: DENY` via Helmet                 |
| MIME sniffing                   | `X-Content-Type-Options: nosniff` via Helmet       |
| DoS via large payloads          | `express.json({ limit: '1mb' })`                   |
| DoS via rapid requests          | Per-IP rate limiting (180 req/min/endpoint)        |
| Path traversal                  | Express.static serves only `public/`               |
| MongoDB injection               | Mongoose schema typing prevents `$where` injection |
| Sensitive data exposure         | `passwordHash` excluded from all API responses     |
| Account enumeration (forgot pw) | Identical response whether email exists or not     |
| Admin self-lockout              | Admin cannot deactivate own account                |
| Expired tokens                  | Reset tokens expire in 1 hour; cleared on use      |

### 21.2 Input Validation

Input validation is performed at the route level before any database access:

- **String fields:** Cast with `String()`, trimmed, length-checked
- **Arrays:** Verified with `Array.isArray()`, elements cast and trimmed
- **ObjectIds:** Validated with `mongoose.isValidObjectId()` before any `findById`
- **Numeric fields:** Cast with `Number()`, bounds-checked (e.g., `Math.min/max` for pagination)
- **Role values:** Compared against a whitelist array

### 21.3 No Direct MongoDB Operator Injection

Because all queries use Mongoose model methods (`findById`, `find({field: value})`), user input is never interpolated directly into raw MongoDB query operators. The `search` parameter in admin user listing uses a regex:

```javascript
{ $or: [
  { name: { $regex: search, $options: 'i' } },
  { email: { $regex: search, $options: 'i' } }
]}
```

The `search` string is not further sanitised, but since it's placed in a `$regex` value (not a key), it cannot become a MongoDB operator. A malicious regex could cause ReDoS (Regular Expression Denial of Service); for hardening, consider adding `escapeRegex()` to this value as well.

---

## 22. Content Security Policy (CSP)

### 22.1 Background

A Content Security Policy (CSP) is a browser security mechanism that restricts which resources a page can load and which scripts can execute. It mitigates XSS attacks by blocking execution of scripts injected by attackers.

### 22.2 HLMS CSP Configuration

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"]
    }
  }
}));
```

### 22.3 Key Directives

| Directive      | Value                       | Reason                                              |
|----------------|-----------------------------|-----------------------------------------------------|
| `default-src`  | `'self'`                    | Only same-origin resources by default               |
| `script-src`   | `'self' 'unsafe-inline'`    | Allows `<script>` blocks and inline scripts         |
| `style-src`    | `'self' 'unsafe-inline'`    | Allows inline `style` attributes                    |
| `img-src`      | `'self' data: https:`       | Allows cover images from any HTTPS source           |
| `connect-src`  | `'self'`                    | fetch() and XHR only to same origin                 |
| `script-src-attr` | `'unsafe-inline'`       | **Critical fix:** allows `onsubmit`, `onclick` etc  |
| `object-src`   | `'none'`                    | Blocks Flash/plugins                                |
| `frame-src`    | `'none'`                    | Prevents embedding in iframes (clickjacking)        |

### 22.4 The `script-src-attr` Fix

Helmet 7+ emits `script-src-attr 'none'` as a **separate directive** from `script-src`. This distinction matters:

- `script-src` governs `<script>` elements and `javascript:` URLs
- `script-src-attr` governs **event handler attributes** (`onsubmit="..."`, `onclick="..."`)

Without `scriptSrcAttr: ["'unsafe-inline'"]`, every inline event handler in every HTML page would be blocked by `script-src-attr 'none'`, causing the console error:

```
Content-Security-Policy: The page's settings blocked an event handler (script-src-attr) 
from being executed because it violates the following directive: "script-src-attr 'none'".
Source: return handleLogin(event)
```

The fix adds `scriptSrcAttr: ["'unsafe-inline'"]` to the Helmet configuration, explicitly overriding the default `'none'`.

The affected HTML pages (all with inline handlers before the fix):
- `login.html` — `onsubmit="return handleLogin(event)"`
- `register.html` — `onsubmit="return handleRegister(event)"`
- `books.html` — `onkeyup="..."`, `onclick="loadBooks()"`
- `forgot-password.html` — `onsubmit="return handleForgotPassword(event)"`
- `reset-password.html` — `onsubmit="return handleResetPassword(event)"`
- `admin.html` — `onsubmit="return createBook(event)"`, `onclick="loadUsers(1)"`
- `profile.html` — `onsubmit="return submitProfile(event)"`
- `dashboard.html` — `onsubmit="return submitUserFeedback(event)"`
- `setup.html` — `onsubmit="return handleSetupAdmin(event)"`

---

## 23. API Documentation

### 23.1 Common Response Format

All API responses follow a consistent envelope:

**Success:**
```json
{ "success": true, /* data fields */ }
```

**Error:**
```json
{ "success": false, "error": "Human-readable error message" }
```

### 23.2 Authentication

Protected endpoints require:
```
Authorization: Bearer <JWT token>
```

Tokens are obtained from the login or register response.

### 23.3 Status Codes

| Code | Meaning                                     |
|------|---------------------------------------------|
| 200  | OK — successful GET, PUT, POST (non-create) |
| 201  | Created — successful POST that creates a resource |
| 400  | Bad Request — missing/invalid input         |
| 401  | Unauthorized — missing or invalid JWT       |
| 403  | Forbidden — insufficient role               |
| 404  | Not Found — resource doesn't exist          |
| 409  | Conflict — duplicate email, existing admin  |
| 429  | Too Many Requests — rate limit exceeded     |
| 500  | Internal Server Error — unexpected failure  |

### 23.4 Pagination

Paginated endpoints accept `page` (default 1) and `limit` (default varies). Responses include:

```json
{
  "total": 42,
  "page": 2,
  "pages": 5
}
```

### 23.5 Full Endpoint Reference

#### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Authenticate user
GET    /api/auth/me                Get current user (auth required)
PUT    /api/auth/profile           Update profile (auth required)
POST   /api/auth/forgot-password   Request password reset
POST   /api/auth/reset-password/:token   Reset password
GET    /api/auth/setup-admin       Check if setup is needed
POST   /api/auth/setup-admin       Create first admin
```

#### Book Endpoints

```
GET    /api/books                  List books (pagination + filters)
GET    /api/books/:id              Get single book
POST   /api/books                  Create book (admin)
PUT    /api/books/:id              Update book (admin)
DELETE /api/books/:id              Soft-delete book (admin)
```

#### Search Endpoint

```
GET    /api/search?q=...           Smart search (optional AI reranking)
```

#### Borrow/Return Endpoints

```
POST   /api/borrow/:bookId         Borrow a book (auth required)
POST   /api/return/:borrowId       Return a book (auth required)
GET    /api/borrows/me             My borrow history (auth required)
GET    /api/borrows/me/alerts      Due-soon alerts (auth required)
GET    /api/borrows                All borrows (admin)
```

#### Feedback Endpoints

```
POST   /api/feedback               Submit feedback (auth required)
GET    /api/feedback/book/:bookId  Get book reviews (public)
GET    /api/feedback               All feedback (admin)
```

#### Admin Endpoints

```
GET    /api/admin/analytics/searches    Search analytics (admin)
GET    /api/admin/users                 List users (admin)
PUT    /api/admin/users/:id/role        Change user role (admin)
PUT    /api/admin/users/:id/active      Activate/deactivate user (admin)
```

#### Utility Endpoints

```
GET    /api/health                 Health check + metrics
```

---

## 24. Admin Panel

### 24.1 Access

The admin panel (`/admin`) is accessible only to users with `role: 'admin'`. Non-admin users who navigate to `/admin` will see an empty or error state (the JS checks the user role and shows an "Access Denied" state).

### 24.2 Book Management

The admin panel's book section provides:

**Book creation form fields:**

| Field           | Type     | Required | Notes                              |
|-----------------|----------|----------|------------------------------------|
| Title           | text     | Yes      |                                    |
| Authors         | text     | Yes      | Comma-separated                    |
| Description     | textarea | No       |                                    |
| Tags            | text     | No       | Comma-separated, stored lowercase  |
| Resource Type   | select   | No       | physical / digital / hybrid        |
| ISBN            | text     | No       |                                    |
| Category        | text     | No       | Default: General                   |
| Publication Year| number   | No       |                                    |
| Total Copies    | number   | No       | Default: 1                         |
| Available Copies| number   | No       | Default: 1                         |
| Digital URL     | url      | No       | External link for digital resources|
| File URL        | url      | No       | Direct download link               |
| Cover Image URL | url      | No       |                                    |

**Edit:** Each book row has an Edit button that pre-fills the creation form (repurposed as an update form) with the book's current values.

**Delete:** Each book row has a Delete button with a confirmation dialog. Deletion is a soft-delete (`isActive: false`), preserving historical borrow records.

### 24.3 User Management

The user table shows all registered users with:
- Name, email, role, active status, join date
- Role toggle button (Admin ↔ User)
- Activate/Deactivate button

**Search:** A search box filters users by name or email (server-side, regex).

### 24.4 Borrow Management

The all-borrows table gives the admin full visibility into:
- Which user borrowed which book
- Current status (borrowed / returned)
- Due date and return date
- Fine amount
- A Return button for any active borrow

### 24.5 Search Analytics

Two views:
1. **Most searched** — shows top 20 queries by total search count
2. **Recently searched** — shows 20 queries ordered by most-recent search time

Admins use this data to:
- Understand what patrons need (high-count searches with no results → books to acquire)
- Identify peak interest periods
- Tune the search index (tags, descriptions) for popular terms

---

## 25. User Dashboard

### 25.1 Access

The dashboard (`/dashboard`) is accessible to all authenticated users. Anonymous users are redirected to `/login`.

### 25.2 Features

**Alerts section:**
- Shown only if there are borrows due within 2 days
- Each alert shows the book title, authors, and exact due date/time
- Styled in amber to draw attention

**Active borrows table:**
- Shows all current borrows with `status: 'borrowed'`
- Columns: Book Title, Authors, Type, Borrowed On, Due Date, Status, Action
- "Return" button for each active borrow
- Overdue borrows (due date in the past) highlighted in red

**Feedback form:**
- Simple textarea + star rating selector
- Submits general library feedback (not book-specific)
- Success/error message displayed inline

---

## 26. Seed Data and Initial Setup

### 26.1 Seed Script

`scripts/seed.js` inserts sample books into the database for testing and demonstration. It connects to MongoDB using the same `MONGODB_URI` from `.env` and creates a predefined set of books across different categories and resource types.

Run the seed script:
```bash
node scripts/seed.js
```

**Note:** The seed script is idempotent if books are uniquely identified; running it multiple times may create duplicates unless it checks for existing data.

### 26.2 First Admin Setup

When no admin user exists, visiting `/setup` shows the setup wizard. This creates the first admin account:

1. Navigate to `http://localhost:3001/setup`
2. Fill in name, email, and password
3. Submit — this calls `POST /api/auth/setup-admin`
4. You are logged in as admin and redirected to `/admin`

**Security:** Once an admin exists, the setup endpoint returns 409 Conflict for any further attempts.

---

## 27. Error Handling Strategy

### 27.1 Route-Level Try/Catch

Every async route handler is wrapped in `try/catch`. Caught errors return a 500 response:

```javascript
} catch (error) {
  return res.status(500).json({ success: false, error: error.message });
}
```

### 27.2 Global Error Handler

Express's error-handling middleware (four parameters: `err, req, res, next`) catches any errors that propagate out of route handlers:

```javascript
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error('Unhandled error:', err);
  if (!req.path.startsWith('/api') && req.accepts('html')) {
    return res.status(status).redirect('/');
  }
  res.status(status).json({
    success: false,
    error: status === 404 ? 'Not found' : 'Internal server error'
  });
});
```

**Browser page requests** (non-API) are redirected to `/` rather than receiving raw JSON. This ensures users see a proper page rather than a JSON error blob.

### 27.3 Transaction Abort Safety

All borrow/return transactions include a `finally` block that calls `session.endSession()` regardless of whether the transaction committed or aborted:

```javascript
} finally {
  session.endSession();
}
```

This prevents connection leaks in failure scenarios.

### 27.4 Frontend Error Display

The frontend renders errors using dedicated CSS classes:

- `.error` — red background, used for API call failures
- `.success` — green background, used for successful operations
- `.loading` — grey text, used while awaiting API responses

---

## 28. Environment Configuration

### 28.1 `.env` File

Copy `.env.example` to `.env` and fill in your values:

```env
# Required
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hlms?retryWrites=true&w=majority
MONGODB_DB=hlms
JWT_SECRET=a-very-long-random-secret-at-least-32-characters

# Optional with defaults
JWT_EXPIRES_IN=7d
DEFAULT_BORROW_DAYS=14
FINE_PER_DAY=1
SEARCH_CANDIDATE_LIMIT=100
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=180
APP_URL=http://localhost:3001

# Email (optional — skip to disable password reset emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-16-char-app-password

# AI Search (optional — skip to use local fuzzy search only)
USE_OPENAI_SEARCH=false
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-3.5-turbo
```

### 28.2 Required vs Optional Variables

| Variable             | Required | Default          | Notes                             |
|----------------------|----------|------------------|-----------------------------------|
| `MONGODB_URI`        | **Yes**  | —                | Server won't start without this   |
| `JWT_SECRET`         | **Yes**  | —                | Server won't start without this   |
| `PORT`               | No       | 3001             |                                   |
| `MONGODB_DB`         | No       | (from URI)       | Override database name            |
| `JWT_EXPIRES_IN`     | No       | `7d`             |                                   |
| `DEFAULT_BORROW_DAYS`| No       | `14`             |                                   |
| `FINE_PER_DAY`       | No       | `1`              |                                   |
| `SEARCH_CANDIDATE_LIMIT` | No  | `100`            | Range: 20–300                     |
| `RATE_LIMIT_WINDOW_MS`| No      | `60000`          |                                   |
| `RATE_LIMIT_MAX`     | No       | `180`            |                                   |
| `APP_URL`            | No       | `http://localhost:{PORT}` | Used in password reset links |
| `EMAIL_HOST`         | No       | `smtp.gmail.com` |                                   |
| `EMAIL_PORT`         | No       | `587`            |                                   |
| `EMAIL_USER`         | No       | —                | Email skipped if not set          |
| `EMAIL_PASS`         | No       | —                | Email skipped if not set          |
| `USE_OPENAI_SEARCH`  | No       | `false`          |                                   |
| `OPENAI_API_KEY`     | No       | —                | AI search disabled if not set     |
| `OPENAI_MODEL`       | No       | `gpt-3.5-turbo`  |                                   |

---

## 29. Deployment Guide

### 29.1 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/shivamawasthi515-bot/library-management-system-final.git
cd library-management-system-final

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. (Optional) Seed sample books
npm run seed

# 5. Start development server with hot reload
npm run dev

# 6. Open browser
open http://localhost:3001
```

### 29.2 Deployment on Railway

Railway is a simple Platform-as-a-Service that detects Node.js apps automatically.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Set environment variables
railway variables set MONGODB_URI="..." JWT_SECRET="..."
railway variables set PORT=3001

# Deploy
railway up
```

Railway automatically runs `npm start` (`node server.js`).

### 29.3 Deployment on Render

1. Create account at render.com
2. New → Web Service
3. Connect your GitHub repository
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables in the Render dashboard

### 29.4 Deployment on Heroku

```bash
# Install Heroku CLI and login
heroku create hlms-app-name

# Set environment variables
heroku config:set MONGODB_URI="..."
heroku config:set JWT_SECRET="..."

# Deploy
git push heroku main
```

### 29.5 Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

```bash
docker build -t hlms .
docker run -p 3001:3001 \
  -e MONGODB_URI="..." \
  -e JWT_SECRET="..." \
  hlms
```

### 29.6 MongoDB Atlas Setup

1. Create free account at mongodb.com/atlas
2. Create a new cluster (M0 free tier is sufficient)
3. Create a database user with read/write permissions
4. Add your IP (or `0.0.0.0/0` for any IP)
5. Get the connection string: Cluster → Connect → Connect your application
6. Replace `<username>`, `<password>`, and `<dbname>` in the URI

**Connection string format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hlms?retryWrites=true&w=majority
```

### 29.7 Production Checklist

Before going live:

- [ ] Set a strong, random `JWT_SECRET` (min 32 characters)
- [ ] Set `APP_URL` to your production domain
- [ ] Configure email credentials for password reset
- [ ] Set `NODE_ENV=production` (optional — no env-specific code currently)
- [ ] Enable HTTPS (handled by the hosting platform or a reverse proxy)
- [ ] Review `RATE_LIMIT_MAX` for expected traffic
- [ ] Test the first-admin setup at `/setup`
- [ ] Seed the database with initial books if needed
- [ ] Verify CSP headers are present in browser DevTools (Network → Response Headers)

---

## 30. Testing Strategy

### 30.1 Test Files

The project includes tests in the `testing/` directory:

| File                     | Description                              |
|--------------------------|------------------------------------------|
| `cache.test.js`          | Unit tests for the LRU cache utility     |
| `search-utils.test.js`   | Unit tests for normalizeText, fuzzyScore, rankBooks, buildPartialRegex |
| `test-auth.js`           | Integration test for auth routes         |
| `test-data.js`           | Test data fixtures and helpers           |
| `check-routes.js`        | Smoke test that verifies route existence |

### 30.2 Running Tests

```bash
npm test
```

This runs: `node --test testing/*.test.js`

The native Node.js test runner (`node:test`, available since Node 18) is used — no additional test framework is needed.

### 30.3 Cache Tests (`cache.test.js`)

Tests cover:
- Setting and getting a value
- TTL expiry (value returns null after TTL)
- LRU eviction (oldest item evicted when MAX_ITEMS exceeded)
- `delByPrefix` — only matching keys are deleted
- LRU recency update (accessing an item moves it to "most recent")

### 30.4 Search Utility Tests (`search-utils.test.js`)

Tests cover:
- `normalizeText` — lowercase, trim, collapse spaces
- `buildPartialRegex` — correct regex for multi-word queries
- `escapeRegex` — special characters properly escaped
- `levenshtein` — distance between pairs of strings
- `fuzzyScore` — correct scores for exact/near/distant matches
- `rankBooks` — correct ordering for a set of mock books with a given query

### 30.5 Manual Testing Checklist

A comprehensive manual test flow:

1. **Registration**
   - Register with valid credentials → expect success + token
   - Register with duplicate email → expect 409
   - Register with short password → expect 400

2. **Login**
   - Login with correct credentials → expect token
   - Login with wrong password → expect 401
   - Login with deactivated account → expect 401

3. **Search**
   - Search with exact title → book appears first
   - Search with typo → correct book still appears (fuzzy)
   - Search with empty query → empty results
   - Search with `USE_OPENAI_SEARCH=true` → mode: 'ai' in response

4. **Borrowing**
   - Borrow an available book → success, availableCopies decremented
   - Borrow same book until unavailable → 400 on next attempt
   - Borrow digital book → always succeeds regardless of copies
   - Return a borrowed book → availableCopies incremented
   - Return an already-returned book → 400

5. **Admin operations**
   - Create book with missing title → 400
   - Create book with authors not an array → 400
   - Delete book → book no longer appears in catalog
   - Change user role → role updated in DB
   - Deactivate user → user cannot log in

6. **Password reset**
   - Request reset for unknown email → 200 (no enumeration)
   - Request reset, click link, set new password → login succeeds
   - Use expired token → 400

---

## 31. Performance Considerations

### 31.1 Database Indexes

MongoDB query performance depends heavily on indexes. HLMS defines the following indexes to ensure fast queries:

**users:**
- `{ email: 1 }` — unique; login lookup is O(log n)
- `{ role: 1 }`, `{ isActive: 1 }` — admin user listing

**books:**
- Compound text index (title, authors, description, tags) — powers `$text` search
- `{ resourceType: 1 }`, `{ category: 1 }`, `{ availableCopies: -1, isActive: 1 }` — filtered browsing
- `{ createdAt: -1, isActive: 1 }` — default sort

**borrows:**
- `{ user: 1, status: 1, createdAt: -1 }` — my-borrows query
- `{ book: 1, status: 1, createdAt: -1 }` — availability check
- `{ status: 1, dueAt: 1 }` — alerts query

**feedbacks:**
- `{ book: 1 }`, `{ user: 1 }`, `{ createdAt: -1 }` — book review queries

### 31.2 Caching Impact

For a catalog of 500 books:
- Without cache: each `/api/books?page=1` query = ~5–15 ms database round-trip
- With cache (20s TTL): 0 ms for repeat requests within the TTL window

For search:
- First search for a query: ~20–100 ms (two parallel MongoDB queries + ranking)
- Repeat search within 20 seconds: <1 ms (memory cache hit)

### 31.3 Search Candidate Limit

The `SEARCH_CANDIDATE_LIMIT` (default 100) is a key performance tuning parameter:

| Limit | Recall  | Memory per search | Ranking time |
|-------|---------|-------------------|--------------|
| 20    | Low     | ~40 KB            | <1 ms        |
| 100   | Good    | ~200 KB           | ~2 ms        |
| 300   | High    | ~600 KB           | ~5 ms        |

For catalogs under 5,000 books, the default of 100 provides excellent recall. For larger catalogs, consider adding Typesense (the package is already in `package.json`) for vector-based semantic search.

### 31.4 OpenAI Latency

When AI search is enabled, each search adds ~200–800 ms for the OpenAI API call. This is mitigated by:

1. **Caching** — The full response (including AI-ranked results) is cached for 20 seconds per unique `{query, page, limit}`.
2. **Candidate cap** — Only 20 books are sent to OpenAI, keeping prompt size and latency small.
3. **Timeout** — The axios call has a 10-second timeout; if OpenAI doesn't respond in time, the local ranking is used instead.

### 31.5 Rate Limiter Memory

The rate limiter `Map` grows with one entry per unique `{IP, path}` combination. For a typical server with 1,000 unique visitors making requests to 10 distinct paths, this is 10,000 entries × ~100 bytes = ~1 MB. Well within acceptable limits.

---

## 32. Known Issues and Fixes Applied

### 32.1 Issue: CSP Blocking Inline Event Handlers

**Symptom:**
```
Content-Security-Policy: The page's settings blocked an event handler (script-src-attr) 
from being executed because it violates the following directive: "script-src-attr 'none'".
Source: return handleLogin(event)
```

**Root Cause:** Helmet 7+ emits a separate `script-src-attr 'none'` directive by default. This directive governs HTML event handler attributes (`onsubmit`, `onclick`, etc.) and is distinct from `script-src`. Having `'unsafe-inline'` in `script-src` does not affect `script-src-attr`.

**Fix Applied:** Added `scriptSrcAttr: ["'unsafe-inline'"]` to the Helmet CSP directives in `server.js`.

**Files changed:** `server.js`

### 32.2 Issue: OpenAI Smart Search Not Working

**Symptom:** Setting `USE_OPENAI_SEARCH=true` and providing `OPENAI_API_KEY` had no effect. Search results were always ranked identically to the local fuzzy mode. The `mode` field in the response was always `'local_fallback'` instead of `'ai'`.

**Root Cause:** `services/aiSearchAdapter.js` was a stub that never called the OpenAI API. It checked the feature flag but always returned the original results:

```javascript
// Previous broken implementation (stub)
async function optionalAiEnhanceSearch({ query, results }) {
  const useOpenAI = ...;
  if (!useOpenAI) {
    return { mode: 'local', results };
  }
  return { mode: 'local_fallback', results };  // ← never called OpenAI!
}
```

**Fix Applied:** Full implementation of the OpenAI integration:
- Checks both `USE_OPENAI_SEARCH=true` AND `OPENAI_API_KEY` presence
- Sends the top 20 candidates to OpenAI Chat Completions API
- Parses the returned ID array and reorders candidates accordingly
- Falls back gracefully to local results on any error

**Files changed:** `services/aiSearchAdapter.js`, `.env.example`

---

## 33. Future Enhancements

### 33.1 Short-Term (1–3 Months)

1. **Reservation queue** — Allow users to join a waitlist for unavailable physical books. Notify via email when a copy becomes available.

2. **Book cover image upload** — Instead of requiring an external URL, allow admins to upload cover images directly (requires a file storage service like AWS S3 or Cloudinary).

3. **Overdue email reminders** — A scheduled job (cron) that emails users with overdue borrows daily.

4. **Search by category/filter** — Add a category dropdown to the books page to filter the catalog before searching.

5. **Pagination UI on books page** — The current UI loads a single page. Add Previous/Next navigation.

### 33.2 Medium-Term (3–6 Months)

6. **Typesense integration** — The `typesense` package is already in `package.json`. Integrate vector search for sub-10 ms semantic search without OpenAI costs or latency.

7. **Bulk book import** — Allow admins to upload a CSV of books for batch creation.

8. **Fine payment tracking** — Mark fines as paid; generate payment receipts.

9. **User borrow history export** — Allow users to download their full borrow history as CSV/PDF.

10. **Book request system** — Allow users to request books the library doesn't have; admin can see the most-requested titles for acquisition decisions.

### 33.3 Long-Term (6+ Months)

11. **Multi-branch support** — Add a `branch` field to books and borrows. Users select their branch; availability is per-branch.

12. **Mobile app** — React Native or Flutter app using the existing REST API as a backend.

13. **Real-time notifications** — WebSocket-based notifications for due-date alerts, reservation notifications, and admin alerts.

14. **RFID/Barcode integration** — A companion browser extension or desktop app that reads barcode scans and calls the borrow/return API.

15. **Analytics dashboard** — Chart.js or D3 visualisations showing borrow trends, popular books, user activity heatmaps.

16. **Inter-library loans** — Support for requesting books from partner libraries; track cross-institution borrows.

17. **OpenAI embeddings** — Instead of sending book summaries to the Chat API, pre-compute embeddings for all books and store them in a vector database (Pinecone, Weaviate). Search then does a vector similarity query for true semantic search without per-search API calls.

---

## 34. Conclusion

The Hybrid Library Management System (HLMS) successfully addresses all seven problem statements identified in Section 3:

| Problem                        | Solution Implemented                                      |
|--------------------------------|-----------------------------------------------------------|
| No unified catalog             | Single Book model with `resourceType` field               |
| Poor search                    | MongoDB text index + Levenshtein fuzzy ranking + OpenAI   |
| No self-service borrowing      | Transactional borrow/return API with availability tracking|
| No automated overdue tracking  | Fine calculated automatically on return                   |
| No password reset              | Email-based token reset with 1-hour expiry                |
| No search visibility           | SearchLog collection + admin analytics endpoint           |
| No book reviews                | Per-book feedback with star ratings, public display       |

Beyond the core requirements, HLMS implements:
- Enterprise-grade security (CSP, rate limiting, RBAC, bcrypt)
- In-memory LRU caching for sub-millisecond repeat responses
- Request metrics for operational observability
- Optional OpenAI AI-powered semantic reranking
- Graceful degradation when external services (email, OpenAI) are unavailable
- Clean separation of concerns for long-term maintainability

The system is designed to be **deployable immediately** on any Node.js hosting platform with only two required environment variables (`MONGODB_URI` and `JWT_SECRET`), and **extensible** through well-defined service interfaces that allow swapping in Typesense, Redis, S3, or other providers without architectural changes.

---

## Appendix A – Complete File Structure

```
library-management-system-final/
├── .env.example                  Environment variable template
├── README.md                     Project overview (brief)
├── package.json                  NPM manifest + scripts
├── package-lock.json             Locked dependency tree
├── server.js                     Application entry point
│
├── controllers/
│   └── bookController.js         (Legacy; logic now in routes/books.js)
│
├── middleware/
│   ├── auth.js                   JWT verification + role enforcement
│   ├── metrics.js                Request logging + performance metrics
│   └── rateLimit.js              Per-IP sliding-window rate limiter
│
├── models/
│   ├── Book.js                   Book schema (title, authors, type, copies…)
│   ├── Borrow.js                 Borrow transaction schema
│   ├── Feedback.js               Review + rating schema
│   ├── SearchLog.js              Search query analytics schema
│   └── User.js                   User account schema
│
├── routes/
│   ├── admin.js                  Admin-only: users, analytics
│   ├── auth.js                   Register, login, profile, reset
│   ├── books.js                  Book CRUD
│   ├── borrow.js                 Borrow, return, borrow history
│   ├── feedback.js               Reviews and ratings
│   ├── issuance.js               (Reserved for future use)
│   ├── members.js                (Reserved for future use)
│   └── search.js                 Smart search endpoint
│
├── services/
│   ├── aiSearchAdapter.js        OpenAI GPT reranking integration
│   └── email.js                  Nodemailer password-reset email sender
│
├── utils/
│   ├── cache.js                  In-memory LRU cache with TTL
│   └── search.js                 normalizeText, buildPartialRegex, rankBooks
│
├── scripts/
│   └── seed.js                   Database seeder for sample books
│
├── testing/
│   ├── cache.test.js             Cache unit tests
│   ├── search-utils.test.js      Search utility unit tests
│   ├── test-auth.js              Auth integration tests
│   ├── test-data.js              Test fixtures/helpers
│   └── check-routes.js           Route smoke tests
│
├── docs/
│   ├── library-management-system.md   Brief implementation notes
│   └── PROJECT_REPORT.md              This document
│
└── public/
    ├── index.html                Landing page
    ├── login.html                Login form
    ├── register.html             Registration form
    ├── books.html                Book catalog + search
    ├── dashboard.html            User borrow/feedback dashboard
    ├── admin.html                Admin management panel
    ├── profile.html              Profile edit page
    ├── forgot-password.html      Password reset request page
    ├── reset-password.html       Password reset form
    ├── setup.html                First-admin setup wizard
    ├── css/
    │   └── style.css             Application stylesheet
    └── js/
        ├── api.js                Centralised API client functions
        ├── auth.js               Login/register/setup page logic
        ├── nav.js                Dynamic navigation bar
        ├── books.js              Book catalog, borrow, review logic
        ├── dashboard.js          User dashboard logic
        ├── admin.js              Admin panel logic
        ├── profile.js            Profile form logic
        └── home.js               Landing page logic
```

---

## Appendix B – Database Index Summary

### users

| Index Name       | Fields            | Options  |
|------------------|-------------------|----------|
| email_1          | `{ email: 1 }`    | unique   |
| role_1           | `{ role: 1 }`     |          |
| isActive_1       | `{ isActive: 1 }` |          |

### books

| Index Name             | Fields                                                          | Options |
|------------------------|-----------------------------------------------------------------|---------|
| book_text_index        | `{ title: 'text', authors: 'text', description: 'text', tags: 'text' }` | weights: title=6, authors=5, tags=4, description=2 |
| isbn_1                 | `{ isbn: 1 }`                                                   | sparse  |
| resourceType_1         | `{ resourceType: 1 }`                                           |         |
| category_1             | `{ category: 1 }`                                               |         |
| publicationYear_1      | `{ publicationYear: 1 }`                                        |         |
| availableCopies_1      | `{ availableCopies: -1 }`                                       |         |
| isActive_1             | `{ isActive: 1 }`                                               |         |
| cat_type_avail         | `{ category: 1, resourceType: 1, availableCopies: -1 }`         |         |
| created_active         | `{ createdAt: -1, isActive: 1 }`                                |         |

### borrows

| Index Name           | Fields                                     |
|----------------------|--------------------------------------------|
| user_1               | `{ user: 1 }`                              |
| book_1               | `{ book: 1 }`                              |
| status_1             | `{ status: 1 }`                            |
| user_status_created  | `{ user: 1, status: 1, createdAt: -1 }`    |
| book_status_created  | `{ book: 1, status: 1, createdAt: -1 }`    |

### feedbacks

| Index Name  | Fields            |
|-------------|-------------------|
| user_1      | `{ user: 1 }`     |
| book_1      | `{ book: 1 }`     |
| createdAt_1 | `{ createdAt: -1 }`|

### searchlogs

| Index Name | Fields         | Options |
|------------|----------------|---------|
| query_1    | `{ query: 1 }` | unique  |

---

## Appendix C – Environment Variables Reference

| Variable               | Required | Default                    | Description                                                      |
|------------------------|----------|----------------------------|------------------------------------------------------------------|
| `PORT`                 | No       | `3001`                     | HTTP port the server listens on                                  |
| `MONGODB_URI`          | **Yes**  | —                          | MongoDB connection string                                        |
| `MONGODB_DB`           | No       | from URI                   | Override the database name in the URI                            |
| `JWT_SECRET`           | **Yes**  | —                          | Secret for signing JWTs; must be long and random                 |
| `JWT_EXPIRES_IN`       | No       | `7d`                       | JWT expiry (e.g., `1d`, `7d`, `30d`)                             |
| `DEFAULT_BORROW_DAYS`  | No       | `14`                       | Days until a borrowed book is due                                |
| `FINE_PER_DAY`         | No       | `1`                        | Fine amount per overdue day (currency-agnostic)                  |
| `SEARCH_CANDIDATE_LIMIT` | No     | `100`                      | Max book candidates fetched per search query (range: 20–300)     |
| `RATE_LIMIT_WINDOW_MS` | No       | `60000`                    | Rate limit window in milliseconds                                |
| `RATE_LIMIT_MAX`       | No       | `180`                      | Max requests per IP per window per path                          |
| `APP_URL`              | No       | `http://localhost:{PORT}`  | Base URL for password reset links in emails                      |
| `EMAIL_HOST`           | No       | `smtp.gmail.com`           | SMTP server hostname                                             |
| `EMAIL_PORT`           | No       | `587`                      | SMTP server port (587 = STARTTLS, 465 = SSL)                     |
| `EMAIL_USER`           | No       | —                          | SMTP username (Gmail address)                                    |
| `EMAIL_PASS`           | No       | —                          | SMTP password (Gmail App Password)                               |
| `USE_OPENAI_SEARCH`    | No       | `false`                    | Set `true` to enable OpenAI semantic reranking                   |
| `OPENAI_API_KEY`       | No       | —                          | OpenAI API key (required when `USE_OPENAI_SEARCH=true`)          |
| `OPENAI_MODEL`         | No       | `gpt-3.5-turbo`            | OpenAI model for reranking (e.g., `gpt-4o-mini`, `gpt-4o`)      |

---

## Appendix D – API Endpoint Quick Reference

### Public Endpoints (No Authentication Required)

| Method | Path                             | Description                         |
|--------|----------------------------------|-------------------------------------|
| POST   | `/api/auth/register`             | Register new user                   |
| POST   | `/api/auth/login`                | Login (returns JWT)                 |
| POST   | `/api/auth/forgot-password`      | Request password reset email        |
| POST   | `/api/auth/reset-password/:token`| Reset password with token           |
| GET    | `/api/auth/setup-admin`          | Check if first-admin setup needed   |
| POST   | `/api/auth/setup-admin`          | Create first admin account          |
| GET    | `/api/books`                     | List books (paginated)              |
| GET    | `/api/books/:id`                 | Get single book                     |
| GET    | `/api/search`                    | Smart search (`?q=...`)             |
| GET    | `/api/feedback/book/:bookId`     | Get book reviews                    |
| GET    | `/api/health`                    | Health check + metrics              |

### Authenticated User Endpoints

| Method | Path                    | Description                      |
|--------|-------------------------|----------------------------------|
| GET    | `/api/auth/me`          | Get own profile                  |
| PUT    | `/api/auth/profile`     | Update name/email/password       |
| POST   | `/api/borrow/:bookId`   | Borrow a book                    |
| POST   | `/api/return/:borrowId` | Return a book (own borrow)       |
| GET    | `/api/borrows/me`       | My borrow history                |
| GET    | `/api/borrows/me/alerts`| Borrows due within 2 days        |
| POST   | `/api/feedback`         | Submit feedback or book review   |

### Admin-Only Endpoints

| Method | Path                              | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | `/api/books`                      | Create book                    |
| PUT    | `/api/books/:id`                  | Update book                    |
| DELETE | `/api/books/:id`                  | Soft-delete book               |
| POST   | `/api/return/:borrowId`           | Return any user's borrow       |
| GET    | `/api/borrows`                    | All borrows                    |
| GET    | `/api/feedback`                   | All feedback                   |
| GET    | `/api/admin/analytics/searches`   | Search analytics               |
| GET    | `/api/admin/users`                | List users                     |
| PUT    | `/api/admin/users/:id/role`       | Change user role               |
| PUT    | `/api/admin/users/:id/active`     | Activate/deactivate user       |

---

*End of Project Report — Hybrid Library Management System (HLMS) v1.0.0*

*Generated: April 2026 | Repository: shivamawasthi515-bot/library-management-system-final*
