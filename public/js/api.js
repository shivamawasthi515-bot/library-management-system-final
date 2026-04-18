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

function listUsers() {
  return request('/admin/users');
}

function updateUserRole(userId, role) {
  return request(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
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
