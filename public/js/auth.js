console.log('🔐 Auth.js loaded');

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please fill all fields');
    return false;
  }

  loginUser(email, password);
  return false;
}

function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!name || !email || !password) {
    alert('Please fill all fields');
    return false;
  }

  if (password !== confirmPassword) {
    document.getElementById('register-message').innerHTML =
      '<div class="error">✗ Passwords do not match</div>';
    return false;
  }

  registerUser(name, email, password);
  return false;
}

async function loginUser(email, password) {
  const messageDiv = document.getElementById('login-message');
  messageDiv.innerHTML = '<div class="loading">⏳ Logging in...</div>';

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (data.token) localStorage.setItem('token', data.token);

      // ✅ store logged-in user
      if (data.user) localStorage.setItem('currentUser', JSON.stringify(data.user));

      messageDiv.innerHTML = '<div class="success">✓ Login successful! Redirecting...</div>';
      setTimeout(() => (window.location.href = '/'), 1200);
    } else {
      messageDiv.innerHTML = `<div class="error">✗ ${data.error || data.message || 'Login failed'}</div>`;
    }
  } catch (error) {
    console.error('✗ Login error:', error);
    messageDiv.innerHTML = `<div class="error">✗ Error: ${error.message}</div>`;
  }
}

async function registerUser(name, email, password) {
  const messageDiv = document.getElementById('register-message');
  messageDiv.innerHTML = '<div class="loading">⏳ Registering...</div>';

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      messageDiv.innerHTML =
        '<div class="success">✓ Registration successful! Redirecting to login...</div>';
      setTimeout(() => (window.location.href = '/login'), 1200);
    } else {
      messageDiv.innerHTML = `<div class="error">✗ ${data.error || data.message || 'Registration failed'}</div>`;
    }
  } catch (error) {
    console.error('✗ Register error:', error);
    messageDiv.innerHTML = `<div class="error">✗ Error: ${error.message}</div>`;
  }
}