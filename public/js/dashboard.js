function ensureUser() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}

async function loadDashboard() {
  const user = ensureUser();
  if (!user) return;

  document.getElementById('dashboard-title').textContent = `${user.name}'s Dashboard`;

  try {
    const data = await myBorrows();
    const list = document.getElementById('borrow-list');
    if (!data.borrows.length) {
      list.innerHTML = '<p>No borrow history found.</p>';
      return;
    }

    list.innerHTML = data.borrows
      .map(
        (entry) => `
      <div class="book-card">
        <h3>${entry.book?.title || 'Unknown book'}</h3>
        <p><strong>Status:</strong> ${entry.status}</p>
        <p><strong>Borrowed:</strong> ${new Date(entry.createdAt).toLocaleString()}</p>
        <p><strong>Due:</strong> ${entry.dueAt ? new Date(entry.dueAt).toLocaleDateString() : '-'}</p>
        ${
          entry.status === 'borrowed'
            ? `<button class="btn" onclick="returnItem('${entry._id}')">Return</button>`
            : `<p><strong>Returned:</strong> ${new Date(entry.returnedAt).toLocaleString()}</p>`
        }
      </div>
    `
      )
      .join('');
  } catch (error) {
    document.getElementById('borrow-list').innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function returnItem(borrowId) {
  try {
    await returnBorrow(borrowId);
    await loadDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function submitUserFeedback(event) {
  event.preventDefault();
  const message = document.getElementById('feedback-message').value.trim();
  const rating = document.getElementById('feedback-rating').value;
  if (!message) return false;

  try {
    await submitFeedback(message, Number(rating));
    document.getElementById('feedback-message').value = '';
    document.getElementById('feedback-status').innerHTML = '<div class="success">Feedback submitted.</div>';
  } catch (error) {
    document.getElementById('feedback-status').innerHTML = `<div class="error">${error.message}</div>`;
  }

  return false;
}

document.addEventListener('DOMContentLoaded', loadDashboard);
