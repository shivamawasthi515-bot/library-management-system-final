function renderMessage(targetId, kind, text) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = `<div class="${kind}">${text}</div>`;
}

function getRedirectPath(defaultPath) {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  return redirect && redirect.startsWith('/') ? redirect : defaultPath;
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    renderMessage('login-message', 'loading', 'Signing in...');
    const data = await loginAPI(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    renderMessage('login-message', 'success', 'Login successful, redirecting...');
    const defaultPath = data.user.role === 'admin' ? '/admin' : '/dashboard';
    window.location.href = getRedirectPath(defaultPath);
  } catch (error) {
    renderMessage('login-message', 'error', error.message);
  }

  return false;
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (password !== confirm) {
    renderMessage('register-message', 'error', 'Passwords do not match');
    return false;
  }

  try {
    renderMessage('register-message', 'loading', 'Creating account...');
    await registerAPI(name, email, password);
    renderMessage('register-message', 'success', 'Registration successful, redirecting to login...');
    window.location.href = '/login?redirect=/dashboard';
  } catch (error) {
    renderMessage('register-message', 'error', error.message);
  }

  return false;
}
