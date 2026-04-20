let currentBooks = [];

async function loadBooks() {
  const list = document.getElementById('books-list');
  list.innerHTML = '<div class="loading">Loading books...</div>';

  try {
    const q = document.getElementById('searchInput').value.trim();
    const data = q ? await smartSearch(q, 1, 20) : await getBooks(1, 20);
    currentBooks = data.books || [];

    if (!currentBooks.length) {
      list.innerHTML = '<p>No books found.</p>';
      return;
    }

    list.innerHTML = currentBooks
      .map((b) => {
        const isPhysicalOrHybrid = b.resourceType === 'physical' || b.resourceType === 'hybrid';
        const available = isPhysicalOrHybrid ? b.availableCopies > 0 : true;
        const badgeColor = available ? '#1b6d2a' : '#9f1a1a';
        const badgeText = isPhysicalOrHybrid
          ? (available ? `Available (${b.availableCopies}/${b.totalCopies})` : `Unavailable (0/${b.totalCopies})`)
          : 'Digital – Always Available';

        return `
      <div class="book-card">
        ${b.coverImage ? `<img src="${escHtmlAttr(b.coverImage)}" alt="Cover" class="book-cover">` : ''}
        <h3>${escHtml(b.title)}</h3>
        <p><strong>Authors:</strong> ${escHtml((b.authors || []).join(', '))}</p>
        <p><strong>Type:</strong> ${b.resourceType} &nbsp;|&nbsp; <strong>Category:</strong> ${escHtml(b.category || 'General')}</p>
        <p><span class="badge" style="background:${badgeColor}">${badgeText}</span></p>
        ${b.digitalUrl ? `<p><a href="${escHtmlAttr(b.digitalUrl)}" target="_blank" rel="noreferrer">🔗 Open digital resource</a></p>` : ''}
        ${b.fileUrl ? `<p><a href="${escHtmlAttr(b.fileUrl)}" target="_blank" rel="noreferrer">📄 Read PDF / digital copy</a></p>` : ''}
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;">
          ${available ? `<button class="btn" onclick="borrow('${b._id}')">Borrow/Request</button>` : '<button class="btn" disabled style="opacity:0.5;cursor:not-allowed;">Not Available</button>'}
          <button class="btn btn-small" onclick="toggleBookFeedback('${b._id}')">Reviews</button>
        </div>
        <div id="feedback-section-${b._id}" style="display:none;margin-top:0.75rem;"></div>
      </div>
    `;
      })
      .join('');
  } catch (error) {
    list.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

function escHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escHtmlAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function borrow(bookId) {
  if (!localStorage.getItem('token')) {
    alert('Please login first');
    window.location.href = '/login';
    return;
  }

  try {
    await borrowBook(bookId);
    alert('Book borrowed/requested successfully');
    loadBooks();
  } catch (error) {
    alert(error.message);
  }
}

async function toggleBookFeedback(bookId) {
  const section = document.getElementById(`feedback-section-${bookId}`);
  if (!section) return;
  if (section.style.display !== 'none') {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  section.innerHTML = '<div class="loading">Loading reviews…</div>';
  try {
    const data = await getBookFeedback(bookId);
    const user = getCurrentUser();
    const reviewsHtml = data.feedback.length
      ? data.feedback.map((f) => `
          <div style="border-top:1px solid #ddd;padding:0.5rem 0;">
            <strong>${escHtml(f.user?.name || 'User')}</strong>
            <span style="color:#888;font-size:0.85rem;margin-left:0.5rem;">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
            <p style="margin:0.2rem 0 0;">${escHtml(f.message)}</p>
          </div>`).join('')
      : '<p style="color:#888;">No reviews yet.</p>';

    const formHtml = user ? `
      <form onsubmit="return submitBookReview(event, '${bookId}')" style="margin-top:0.5rem;">
        <div class="form-group">
          <label>Rating</label>
          <select id="br-rating-${bookId}">
            <option value="5">★★★★★</option><option value="4">★★★★☆</option>
            <option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option>
            <option value="1">★☆☆☆☆</option>
          </select>
        </div>
        <div class="form-group">
          <textarea id="br-msg-${bookId}" rows="2" placeholder="Write a review…" required></textarea>
        </div>
        <button class="btn btn-small btn-primary" type="submit">Post Review</button>
        <div id="br-status-${bookId}" style="margin-top:0.4rem;"></div>
      </form>` : '<p style="color:#888;"><a href="/login">Login</a> to post a review.</p>';

    section.innerHTML = `<h4 style="margin-bottom:0.4rem;">Reviews</h4>${reviewsHtml}${formHtml}`;
  } catch (error) {
    section.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function submitBookReview(event, bookId) {
  event.preventDefault();
  const msg = document.getElementById(`br-msg-${bookId}`).value.trim();
  const rating = Number(document.getElementById(`br-rating-${bookId}`).value);
  const statusEl = document.getElementById(`br-status-${bookId}`);
  try {
    await submitBookFeedback(bookId, msg, rating);
    statusEl.innerHTML = '<div class="success">Review posted!</div>';
    document.getElementById(`br-msg-${bookId}`).value = '';
    // Refresh reviews
    await toggleBookFeedback(bookId);
    await toggleBookFeedback(bookId);
  } catch (error) {
    statusEl.innerHTML = `<div class="error">${error.message}</div>`;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', loadBooks);
