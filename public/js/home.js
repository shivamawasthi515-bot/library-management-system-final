document.addEventListener('DOMContentLoaded', async () => {
  try {
    const status = await healthAPI();
    const statusDiv = document.getElementById('status-info');
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div class="success">
          <h3>System: ${status.status}</h3>
          <p>Database: ${status.database}</p>
          <p>Total requests: ${status.metrics.totalRequests}</p>
        </div>
      `;
    }

    const books = await getBooks(1, 6);
    const list = document.getElementById('featured-list');
    if (list) {
      list.innerHTML = books.books
        .map(
          (b) => `
        <div class="book-card">
          <h3>${b.title}</h3>
          <p><strong>Authors:</strong> ${(b.authors || []).join(', ')}</p>
          <p><strong>Type:</strong> ${b.resourceType}</p>
          <p><strong>Available:</strong> ${b.availableCopies}/${b.totalCopies}</p>
        </div>
      `
        )
        .join('');
    }
  } catch (error) {
    const statusDiv = document.getElementById('status-info');
    if (statusDiv) statusDiv.innerHTML = `<div class="error">${error.message}</div>`;
  }
});
