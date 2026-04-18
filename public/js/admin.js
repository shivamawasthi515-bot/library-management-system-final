function ensureAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '/dashboard';
    return false;
  }
  return true;
}

async function loadAdminData() {
  if (!ensureAdmin()) return;

  await Promise.all([loadUsers(), loadBorrows(), loadSearchAnalytics(), loadFeedbackItems()]);
}

async function loadUsers() {
  try {
    const data = await listUsers();
    document.getElementById('admin-users').innerHTML = data.users
      .map(
        (u) => `
      <div class="book-card">
        <h3>${u.name}</h3>
        <p>${u.email}</p>
        <p><strong>Role:</strong> ${u.role}</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    document.getElementById('admin-users').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function loadBorrows() {
  try {
    const data = await allBorrows();
    document.getElementById('admin-borrows').innerHTML = data.borrows
      .slice(0, 30)
      .map(
        (b) => `
      <div class="book-card">
        <h3>${b.book?.title || 'Unknown'}</h3>
        <p><strong>User:</strong> ${b.user?.name || 'Unknown'} (${b.user?.email || '-'})</p>
        <p><strong>Status:</strong> ${b.status}</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    document.getElementById('admin-borrows').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function loadSearchAnalytics() {
  try {
    const data = await listSearchAnalytics();
    const top = data.top
      .map((s) => `<li>${s.query} (${s.count}) - ${new Date(s.lastSearchedAt).toLocaleString()}</li>`)
      .join('');
    document.getElementById('admin-searches').innerHTML = `<ul>${top || '<li>No search logs yet.</li>'}</ul>`;
  } catch (error) {
    document.getElementById('admin-searches').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function loadFeedbackItems() {
  try {
    const data = await listFeedback();
    document.getElementById('admin-feedback').innerHTML = data.feedback
      .map(
        (f) => `
      <div class="book-card">
        <p><strong>${f.user?.name || 'Unknown user'}</strong> (${f.user?.email || '-'})</p>
        <p><strong>Rating:</strong> ${f.rating}/5</p>
        <p>${f.message}</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    document.getElementById('admin-feedback').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function createBook(event) {
  event.preventDefault();
  try {
    const title = document.getElementById('book-title').value.trim();
    const authors = document.getElementById('book-authors').value
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    const resourceType = document.getElementById('book-type').value;
    const totalCopies = Number(document.getElementById('book-copies').value || 1);
    const category = document.getElementById('book-category').value.trim() || 'General';
    const description = document.getElementById('book-description').value.trim();

    await request('/books', {
      method: 'POST',
      body: JSON.stringify({
        title,
        authors,
        resourceType,
        totalCopies,
        availableCopies: totalCopies,
        category,
        description
      })
    });

    document.getElementById('book-form').reset();
    document.getElementById('book-status').innerHTML = '<div class="success">Book added.</div>';
  } catch (error) {
    document.getElementById('book-status').innerHTML = `<div class="error">${error.message}</div>`;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', loadAdminData);
