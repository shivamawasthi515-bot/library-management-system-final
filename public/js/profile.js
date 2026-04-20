(function () {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login?redirect=/profile';
    return;
  }

  document.getElementById('profile-name').value = user.name || '';
  document.getElementById('profile-email').value = user.email || '';
})();

async function submitProfile(event) {
  event.preventDefault();
  const statusEl = document.getElementById('profile-status');
  statusEl.innerHTML = '';

  const name = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  const currentPassword = document.getElementById('profile-current-pw').value;
  const newPassword = document.getElementById('profile-new-pw').value;
  const confirmPassword = document.getElementById('profile-confirm-pw').value;

  if (newPassword && newPassword !== confirmPassword) {
    statusEl.innerHTML = '<div class="error">New passwords do not match.</div>';
    return false;
  }

  try {
    statusEl.innerHTML = '<div class="loading">Saving…</div>';
    const payload = { name, email };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const data = await updateProfileAPI(payload);
    // Update cached user in localStorage
    const cached = getCurrentUser();
    if (cached) {
      localStorage.setItem('currentUser', JSON.stringify({ ...cached, name: data.user.name, email: data.user.email }));
    }
    statusEl.innerHTML = '<div class="success">Profile updated successfully.</div>';
    document.getElementById('profile-current-pw').value = '';
    document.getElementById('profile-new-pw').value = '';
    document.getElementById('profile-confirm-pw').value = '';
  } catch (error) {
    statusEl.innerHTML = `<div class="error">${error.message}</div>`;
  }

  return false;
}
