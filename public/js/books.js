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
      .map(
        (b) => `
      <div class="book-card">
        <h3>${b.title}</h3>
        <p><strong>Authors:</strong> ${(b.authors || []).join(', ')}</p>
        <p><strong>Type:</strong> ${b.resourceType}</p>
        <p><strong>Category:</strong> ${b.category || 'General'}</p>
        <p><strong>Available:</strong> ${b.availableCopies}/${b.totalCopies}</p>
        ${b.digitalUrl ? `<p><a href="${b.digitalUrl}" target="_blank" rel="noreferrer">Open digital resource</a></p>` : ''}
        <button class="btn" onclick="borrow('${b._id}')">Borrow/Request</button>
      </div>
    `
      )
      .join('');
  } catch (error) {
    list.innerHTML = `<div class="error">${error.message}</div>`;
  }
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

document.addEventListener('DOMContentLoaded', loadBooks);
