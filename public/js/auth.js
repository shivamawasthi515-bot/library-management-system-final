function renderMessage(targetId, kind, text) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = `<div class="${kind}">${text}</div>`;
}

function getRedirectPath(defaultPath) {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  return redirect && redirect.startsWith('/') ? redirect : defaultPath;
}

// Redirect already-authenticated users away from login/register pages
(function redirectIfLoggedIn() {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return;
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(window.location.pathname);
  if (!isAuthPage) return;
  try {
    const user = JSON.parse(raw);
    window.location.replace(user.role === 'admin' ? '/admin' : '/dashboard');
  } catch (_) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }
})();

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
    const data = await registerAPI(name, email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    renderMessage('register-message', 'success', 'Account created! Redirecting...');
    window.location.href = '/dashboard';
  } catch (error) {
    renderMessage('register-message', 'error', error.message);
  }

  return false;
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById('fp-email').value.trim();

  try {
    renderMessage('fp-message', 'loading', 'Sending reset link...');
    const data = await forgotPasswordAPI(email);
    if (data.resetUrl) {
      renderMessage(
        'fp-message',
        'success',
        `Reset link ready. <strong><a href="${data.resetUrl}">Click here to reset your password</a></strong><br>
         <small style="color:#555">(In production this link would be sent to your email.)</small>`
      );
    } else {
      renderMessage('fp-message', 'success', data.message);
    }
  } catch (error) {
    renderMessage('fp-message', 'error', error.message);
  }

  return false;
}

async function handleResetPassword(event) {
  event.preventDefault();
  const token = new URLSearchParams(window.location.search).get('token');
  const password = document.getElementById('rp-password').value;
  const confirm = document.getElementById('rp-confirm').value;

  if (!token) {
    renderMessage('rp-message', 'error', 'Invalid reset link. Please request a new one.');
    return false;
  }

  if (password !== confirm) {
    renderMessage('rp-message', 'error', 'Passwords do not match');
    return false;
  }

  try {
    renderMessage('rp-message', 'loading', 'Resetting password...');
    const data = await resetPasswordAPI(token, password);
    renderMessage('rp-message', 'success', `${data.message} <a href="/login">Login now</a>`);
    document.getElementById('rp-form').style.display = 'none';
  } catch (error) {
    renderMessage('rp-message', 'error', error.message);
  }

  return false;
}
