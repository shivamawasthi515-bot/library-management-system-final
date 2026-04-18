(function () {
  const userSpan = document.getElementById('nav-user');
  const logoutBtn = document.getElementById('nav-logout');

  const userRaw = localStorage.getItem('currentUser');
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (user && userSpan) {
    userSpan.textContent = `Hi, ${user.name}`;
  }

  if (logoutBtn) {
    if (user) logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    });
  }
})();