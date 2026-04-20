function ensureUser() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}

async function loadAlerts() {
  try {
    const data = await myBorrowAlerts();
    const alertsEl = document.getElementById('due-alerts');
    if (!alertsEl) return;
    if (!data.alerts.length) {
      alertsEl.style.display = 'none';
      return;
    }
    alertsEl.style.display = 'block';
    alertsEl.innerHTML = `
      <div class="alert-box">
        <strong>⚠️ Due Soon</strong>
        <ul style="margin:0.4rem 0 0 1rem;">
          ${data.alerts.map((a) => {
            const due = new Date(a.dueAt);
            const overdue = due < new Date();
            return `<li>${a.book?.title || 'Unknown'} — <span style="color:${overdue ? '#9f1a1a' : '#b06000'}">${overdue ? 'Overdue!' : `Due ${due.toLocaleDateString()}`}</span></li>`;
          }).join('')}
        </ul>
      </div>`;
  } catch (_) {
    // Alerts are non-critical; silently ignore errors
  }
}

async function loadDashboard() {
  const user = ensureUser();
  if (!user) return;

  document.getElementById('dashboard-title').textContent = `${user.name}'s Dashboard`;

  await loadAlerts();

  try {
    const data = await myBorrows();
    const list = document.getElementById('borrow-list');
    if (!data.borrows.length) {
      list.innerHTML = '<p>No borrow history found.</p>';
      return;
    }

    list.innerHTML = data.borrows
      .map((entry) => {
        const due = entry.dueAt ? new Date(entry.dueAt) : null;
        const overdue = entry.status === 'borrowed' && due && due < new Date();
        return `
      <div class="book-card">
        <h3>${entry.book?.title || 'Unknown book'}</h3>
        <p><strong>Status:</strong> ${entry.status}${overdue ? ' <span style="color:#9f1a1a;font-weight:bold;">⚠️ Overdue</span>' : ''}</p>
        <p><strong>Borrowed:</strong> ${new Date(entry.createdAt).toLocaleString()}</p>
        <p><strong>Due:</strong> ${due ? due.toLocaleDateString() : '-'}</p>
        ${entry.fine > 0 ? `<p><strong>Fine:</strong> <span style="color:#9f1a1a;">₹${entry.fine} (${entry.fine} day${entry.fine !== 1 ? 's' : ''} overdue)</span></p>` : ''}
        ${
          entry.status === 'borrowed'
            ? `<button class="btn" onclick="returnItem('${entry._id}')">Return</button>`
            : `<p><strong>Returned:</strong> ${new Date(entry.returnedAt).toLocaleString()}</p>`
        }
      </div>
    `;
      })
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
