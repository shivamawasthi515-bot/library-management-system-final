console.log('🏠 Home.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
  await loadStatus();
  await loadFeaturedBooks();
});

async function loadStatus() {
  try {
    const status = await getStatus();
    const statusDiv = document.getElementById('status-info');
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div class="success">
          <h3>✓ Server: ${status.status}</h3>
          <p>Database: ${status.database}</p>
        </div>
      `;
    }
  } catch (error) {
    const statusDiv = document.getElementById('status-info');
    if (statusDiv) {
      statusDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  }
}

async function loadFeaturedBooks() {
  try {
    const data = await getAllBooks(1, 6);
    const div = document.getElementById('featured-list');
    if (!div) return;
    
    if (data.books && data.books.length > 0) {
      div.innerHTML = data.books.map(b => `
        <div class="book-card">
          <h3>${b.title}</h3>
          <p><strong>Author:</strong> ${b.author}</p>
          <p><strong>Category:</strong> ${b.category}</p>
          <p><strong>Available:</strong> ${b.availableCopies}/${b.totalCopies}</p>
        </div>
      `).join('');
    } else {
      div.innerHTML = '<p>No books available</p>';
    }
  } catch (error) {
    const div = document.getElementById('featured-list');
    if (div) {
      div.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  }
}