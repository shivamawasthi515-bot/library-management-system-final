const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
    ...options
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

function loginAPI(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

function registerAPI(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

function meAPI() {
  return request('/auth/me');
}

function getBooks(page = 1, limit = 12) {
  return request(`/books?page=${page}&limit=${limit}`);
}

function getBook(id) {
  return request(`/books/${id}`);
}

function smartSearch(query, page = 1, limit = 10) {
  return request(`/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
}

function borrowBook(bookId, note = '') {
  return request(`/borrow/${bookId}`, {
    method: 'POST',
    body: JSON.stringify({ note })
  });
}

function returnBorrow(borrowId) {
  return request(`/return/${borrowId}`, { method: 'POST' });
}

function myBorrows() {
  return request('/borrows/me');
}

function allBorrows() {
  return request('/borrows');
}

function submitFeedback(message, rating = 5) {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify({ message, rating })
  });
}

function listFeedback() {
  return request('/feedback');
}

function healthAPI() {
  return request('/health');
}

function listSearchAnalytics() {
  return request('/admin/analytics/searches');
}

function listUsers(page = 1, limit = 20, search = '') {
  const q = search ? `&search=${encodeURIComponent(search)}` : '';
  return request(`/admin/users?page=${page}&limit=${limit}${q}`);
}

function updateUserRole(userId, role) {
  return request(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
}

function setUserActive(userId, isActive) {
  return request(`/admin/users/${userId}/active`, {
    method: 'PUT',
    body: JSON.stringify({ isActive })
  });
}

function createBookAPI(data) {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

function updateBook(bookId, data) {
  return request(`/books/${bookId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

function deleteBook(bookId) {
  return request(`/books/${bookId}`, { method: 'DELETE' });
}

function forgotPasswordAPI(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

function resetPasswordAPI(token, password) {
  return request(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password })
  });
}

function updateProfileAPI(data) {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

function myBorrowAlerts() {
  return request('/borrows/me/alerts');
}

function getBookFeedback(bookId) {
  return request(`/feedback/book/${bookId}`);
}

function submitBookFeedback(bookId, message, rating = 5) {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify({ message, rating, bookId })
  });
}

function checkSetupAPI() {
  return request('/auth/setup-admin');
}

function setupAdminAPI(name, email, password) {
  return request('/auth/setup-admin', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}
