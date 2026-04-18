const API_BASE = 'http://localhost:3001/api';

console.log('🔌 API.js loaded');

async function getAllBooks(page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_BASE}/books/all?page=${page}&limit=${limit}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

async function searchBooksAPI(query) {
  try {
    const response = await fetch(`${API_BASE}/books/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

async function getStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`);
    return await response.json();
  } catch (error) {
    console.error('Status error:', error);
    throw error;
  }
}

async function loginAPI(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function registerAPI(name, email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}