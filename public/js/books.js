console.log('📖 Books.js loaded');

document.addEventListener('DOMContentLoaded', loadAllBooks);

async function loadAllBooks() {
  try {
    const booksDiv = document.getElementById('books-list');
    if (!booksDiv) return;
    
    booksDiv.innerHTML = '<div class="loading">Loading...</div>';
    const data = await getAllBooks();
    
    if (data.books && data.books.length > 0) {
      booksDiv.innerHTML = `<p><strong>Total: ${data.total}</strong></p>` + 
        data.books.map(b => `
          <div class="book-card">
            <h3>${b.title}</h3>
            <p><strong>Author:</strong> ${b.author}</p>
            <p><strong>Category:</strong> ${b.category}</p>
            <p><strong>Year:</strong> ${b.publicationYear}</p>
            <p><strong>Available:</strong> ${b.availableCopies}/${b.totalCopies}</p>
          </div>
        `).join('');
    } else {
      booksDiv.innerHTML = '<p>No books found</p>';
    }
  } catch (error) {
    const booksDiv = document.getElementById('books-list');
    if (booksDiv) {
      booksDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  }
}

async function searchBooks() {
  const query = document.getElementById('searchInput').value;
  if (!query) {
    loadAllBooks();
    return;
  }
  
  try {
    const booksDiv = document.getElementById('books-list');
    booksDiv.innerHTML = '<div class="loading">Searching...</div>';
    
    const data = await searchBooksAPI(query);
    
    if (data.books && data.books.length > 0) {
      booksDiv.innerHTML = `<p><strong>Found: ${data.total}</strong></p>` + 
        data.books.map(b => `
          <div class="book-card">
            <h3>${b.title}</h3>
            <p><strong>Author:</strong> ${b.author}</p>
            <p><strong>Available:</strong> ${b.availableCopies}/${b.totalCopies}</p>
          </div>
        `).join('');
    } else {
      booksDiv.innerHTML = '<p>No books found</p>';
    }
  } catch (error) {
    const booksDiv = document.getElementById('books-list');
    if (booksDiv) {
      booksDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  }
}