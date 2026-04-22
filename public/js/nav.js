(function () {
  const userRaw = localStorage.getItem('currentUser');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const userSpan = document.getElementById('nav-user');
  const logoutBtn = document.getElementById('nav-logout');
  const dashboardLink = document.getElementById('nav-dashboard');
  const adminLink = document.getElementById('nav-admin');
  const profileLink = document.getElementById('nav-profile');

  if (user && userSpan) userSpan.textContent = `Hi, ${user.name}`;

  if (dashboardLink) dashboardLink.style.display = user ? 'inline' : 'none';
  if (adminLink) adminLink.style.display = user?.role === 'admin' ? 'inline' : 'none';
  if (profileLink) profileLink.style.display = user ? 'inline' : 'none';

  if (logoutBtn) {
    logoutBtn.style.display = user ? 'inline-block' : 'none';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    });
  }
})();
