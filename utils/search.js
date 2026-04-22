function normalizeText(value) {
  return String(value || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPartialRegex(query) {
  const normalized = normalizeText(query);
  if (!normalized) return null;
  const parts = normalized.split(' ').filter(Boolean).map(escapeRegex);
  if (!parts.length) return null;
  return new RegExp(parts.join('.*'), 'i');
}

function levenshtein(a, b) {
  const left = normalizeText(a);
  const right = normalizeText(b);
  const matrix = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function fuzzyScore(query, candidate) {
  const q = normalizeText(query);
  const c = normalizeText(candidate);
  if (!q || !c) return 0;
  if (c.includes(q)) return 1;
  const dist = levenshtein(q, c);
  const maxLen = Math.max(q.length, c.length);
  return Math.max(0, 1 - dist / maxLen);
}

function rankBooks(books, query) {
  const q = normalizeText(query);
  return books
    .map((book) => {
      const title = normalizeText(book.title);
      const authors = normalizeText((book.authors || []).join(' '));
      const tags = normalizeText((book.tags || []).join(' '));
      const desc = normalizeText(book.description || '');
      const blob = `${title} ${authors} ${tags} ${desc}`;

      const score =
        (book._textScore || 0) * 5 +
        (title.includes(q) ? 2 : 0) +
        fuzzyScore(q, title) * 2 +
        fuzzyScore(q, authors) +
        fuzzyScore(q, tags) +
        fuzzyScore(q, blob) * 0.5;

      return { ...book, _rankScore: score };
    })
    .sort((a, b) => b._rankScore - a._rankScore);
}

module.exports = { normalizeText, buildPartialRegex, fuzzyScore, rankBooks };
