function ensureAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '/dashboard';
    return false;
  }
  return true;
}

function escHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// In-memory cache so book data is available for edit forms
const _bookCache = {};

async function loadAdminData() {
  if (!ensureAdmin()) return;

  await Promise.all([loadBooks(), loadUsers(1), loadBorrows(), loadSearchAnalytics(), loadFeedbackItems()]);
}

// ── Books ────────────────────────────────────────────────────────────────────

async function loadBooks() {
  try {
    const data = await getBooks(1, 50);
    data.books.forEach((b) => { _bookCache[b._id] = b; });
    const container = document.getElementById('admin-books-list');
    if (!data.books.length) {
      container.innerHTML = '<p>No books found.</p>';
      return;
    }
    container.innerHTML = data.books
      .map(
        (b) => `
      <div class="book-card" id="book-card-${b._id}">
        ${b.coverImage ? `<img src="${escHtml(b.coverImage)}" alt="Cover" class="book-cover">` : ''}
        <h3>${escHtml(b.title)}</h3>
        <p><strong>Authors:</strong> ${escHtml(b.authors.join(', '))}</p>
        <p><strong>Type:</strong> ${b.resourceType} &nbsp;|&nbsp; <strong>Available:</strong> ${b.availableCopies}/${b.totalCopies}</p>
        <p><strong>Category:</strong> ${escHtml(b.category || '-')}</p>
        ${b.fileUrl ? `<p><a href="${escHtml(b.fileUrl)}" target="_blank" rel="noreferrer">📄 Digital/PDF</a></p>` : ''}
        <div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn-small" onclick="toggleEditBook('${b._id}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteBookItem('${b._id}')">Delete</button>
        </div>
        <div id="edit-form-${b._id}" style="display:none;margin-top:0.8rem;"></div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    document.getElementById('admin-books-list').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

function toggleEditBook(id) {
  const formDiv = document.getElementById(`edit-form-${id}`);
  if (!formDiv) return;
  if (formDiv.style.display === 'none') {
    const b = _bookCache[id];
    if (!b) return;
    formDiv.innerHTML = `
      <hr style="margin:0.5rem 0;">
      <form onsubmit="return submitEditBook(event, '${id}')">
        <div class="form-group"><label>Title</label><input id="et-title-${id}" value="${escHtml(b.title)}" required></div>
        <div class="form-group"><label>Authors (comma-separated)</label><input id="et-authors-${id}" value="${escHtml(b.authors.join(', '))}" required></div>
        <div class="form-group"><label>Type</label>
          <select id="et-type-${id}">
            <option value="physical" ${b.resourceType === 'physical' ? 'selected' : ''}>physical</option>
            <option value="digital"  ${b.resourceType === 'digital'  ? 'selected' : ''}>digital</option>
            <option value="hybrid"   ${b.resourceType === 'hybrid'   ? 'selected' : ''}>hybrid</option>
          </select>
        </div>
        <div class="form-group"><label>Total Copies</label><input id="et-copies-${id}" type="number" min="1" value="${b.totalCopies}"></div>
        <div class="form-group"><label>Category</label><input id="et-category-${id}" value="${escHtml(b.category || '')}"></div>
        <div class="form-group"><label>Cover Image URL</label><input id="et-cover-${id}" value="${escHtml(b.coverImage || '')}" placeholder="https://…/cover.jpg"></div>
        <div class="form-group"><label>Digital URL</label><input id="et-digital-${id}" value="${escHtml(b.digitalUrl || '')}" placeholder="https://…"></div>
        <div class="form-group"><label>File / PDF URL</label><input id="et-file-${id}" value="${escHtml(b.fileUrl || '')}" placeholder="https://…/book.pdf"></div>
        <div class="form-group"><label>Description</label><textarea id="et-desc-${id}" rows="2">${escHtml(b.description || '')}</textarea></div>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-primary" type="submit">Save</button>
          <button class="btn" type="button" onclick="document.getElementById('edit-form-${id}').style.display='none'">Cancel</button>
        </div>
      </form>`;
    formDiv.style.display = 'block';
  } else {
    formDiv.style.display = 'none';
  }
}

async function submitEditBook(event, id) {
  event.preventDefault();
  try {
    const title = document.getElementById(`et-title-${id}`).value.trim();
    const authors = document.getElementById(`et-authors-${id}`).value
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    const resourceType = document.getElementById(`et-type-${id}`).value;
    const totalCopies = Number(document.getElementById(`et-copies-${id}`).value || 1);
    const category = document.getElementById(`et-category-${id}`).value.trim() || 'General';
    const coverImage = document.getElementById(`et-cover-${id}`).value.trim();
    const digitalUrl = document.getElementById(`et-digital-${id}`).value.trim();
    const fileUrl = document.getElementById(`et-file-${id}`).value.trim();
    const description = document.getElementById(`et-desc-${id}`).value.trim();

    await updateBook(id, { title, authors, resourceType, totalCopies, category, coverImage, digitalUrl, fileUrl, description });
    await loadBooks();
  } catch (error) {
    alert(error.message);
  }
  return false;
}

async function deleteBookItem(id) {
  const b = _bookCache[id];
  if (!confirm(`Delete "${b ? b.title : id}"? The book will be hidden from the catalog.`)) return;
  try {
    await deleteBook(id);
    await loadBooks();
  } catch (error) {
    alert(error.message);
  }
}

// ── Users ────────────────────────────────────────────────────────────────────

let _usersPage = 1;
const _usersLimit = 10;

async function loadUsers(page = 1) {
  _usersPage = page;
  try {
    const search = document.getElementById('admin-users-search')?.value?.trim() || '';
    const data = await listUsers(page, _usersLimit, search);
    const currentUser = getCurrentUser();
    const container = document.getElementById('admin-users');

    const paginationHtml = data.pages > 1 ? `
      <div class="pagination" style="margin-bottom:0.5rem;">
        ${page > 1 ? `<button class="btn btn-small" onclick="loadUsers(${page - 1})">← Prev</button>` : ''}
        <span style="margin:0 0.5rem;">Page ${page} / ${data.pages} (${data.total} users)</span>
        ${page < data.pages ? `<button class="btn btn-small" onclick="loadUsers(${page + 1})">Next →</button>` : ''}
      </div>` : '';

    container.innerHTML = paginationHtml + data.users
      .map(
        (u) => `
      <div class="book-card">
        <h3>${escHtml(u.name)}</h3>
        <p>${escHtml(u.email)}</p>
        <p>
          <strong>Role:</strong> ${u.role} &nbsp;|&nbsp;
          <strong>Status:</strong> <span style="color:${u.isActive ? '#1b6d2a' : '#9f1a1a'}">${u.isActive ? 'Active' : 'Inactive'}</span>
        </p>
        ${
          currentUser && u._id !== currentUser.id
            ? `<div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                <button class="btn btn-small" onclick="changeRole('${u._id}', '${u.role === 'admin' ? 'user' : 'admin'}')">
                  Make ${u.role === 'admin' ? 'User' : 'Admin'}
                </button>
                <button class="btn btn-small ${u.isActive ? 'btn-danger' : ''}" onclick="toggleActive('${u._id}', ${!u.isActive})">
                  ${u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>`
            : ''
        }
      </div>
    `
      )
      .join('') + paginationHtml;
  } catch (error) {
    document.getElementById('admin-users').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function changeRole(userId, newRole) {
  try {
    await updateUserRole(userId, newRole);
    await loadUsers(_usersPage);
  } catch (error) {
    alert(error.message);
  }
}

async function toggleActive(userId, isActive) {
  try {
    await setUserActive(userId, isActive);
    await loadUsers(_usersPage);
  } catch (error) {
    alert(error.message);
  }
}

// ── Borrows ──────────────────────────────────────────────────────────────────

async function loadBorrows() {
  try {
    const data = await allBorrows();
    document.getElementById('admin-borrows').innerHTML = data.borrows
      .slice(0, 30)
      .map(
        (b) => `
      <div class="book-card">
        <h3>${escHtml(b.book?.title || 'Unknown')}</h3>
        <p><strong>User:</strong> ${escHtml(b.user?.name || 'Unknown')} (${escHtml(b.user?.email || '-')})</p>
        <p><strong>Status:</strong> ${b.status}</p>
        <p><strong>Borrowed:</strong> ${new Date(b.createdAt).toLocaleString()}</p>
        ${b.dueAt ? `<p><strong>Due:</strong> ${new Date(b.dueAt).toLocaleDateString()}</p>` : ''}
        ${b.returnedAt ? `<p><strong>Returned:</strong> ${new Date(b.returnedAt).toLocaleString()}</p>` : ''}
        ${b.status === 'borrowed' ? `<button class="btn btn-small" onclick="forceReturn('${b._id}')">Force Return</button>` : ''}
      </div>
    `
      )
      .join('');
  } catch (error) {
    document.getElementById('admin-borrows').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function forceReturn(borrowId) {
  if (!confirm('Force-return this borrow record?')) return;
  try {
    await returnBorrow(borrowId);
    await loadBorrows();
  } catch (error) {
    alert(error.message);
  }
}

// ── Analytics & Feedback ─────────────────────────────────────────────────────

async function loadSearchAnalytics() {
  try {
    const data = await listSearchAnalytics();
    const top = data.top
      .map((s) => `<li>${escHtml(s.query)} (${s.count}) &mdash; ${new Date(s.lastSearchedAt).toLocaleString()}</li>`)
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
        <p><strong>${escHtml(f.user?.name || 'Unknown user')}</strong> (${escHtml(f.user?.email || '-')})</p>
        <p><strong>Rating:</strong> ${f.rating}/5</p>
        <p>${escHtml(f.message)}</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    document.getElementById('admin-feedback').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

// ── Add Book ─────────────────────────────────────────────────────────────────

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
    const coverImage = document.getElementById('book-cover').value.trim();
    const digitalUrl = document.getElementById('book-digital').value.trim();
    const fileUrl = document.getElementById('book-file').value.trim();
    const description = document.getElementById('book-description').value.trim();

    await createBookAPI({
        title,
        authors,
        resourceType,
        totalCopies,
        availableCopies: totalCopies,
        category,
        coverImage,
        digitalUrl,
        fileUrl,
        description
      });

    document.getElementById('book-form').reset();
    document.getElementById('book-status').innerHTML = '<div class="success">Book added.</div>';
    await loadBooks();
  } catch (error) {
    document.getElementById('book-status').innerHTML = `<div class="error">${error.message}</div>`;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', loadAdminData);
