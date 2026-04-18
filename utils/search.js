function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Escape regex special chars
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a safe regex that matches tokens in order (good for partial titles)
 * Example: "digital signal" => /digital.*signal/i
 */
function buildFuzzyRegex(query) {
  const q = normalize(query);
  if (!q) return null;

  const tokens = q.split(' ').filter(Boolean).map(escapeRegex);
  if (!tokens.length) return null;

  return new RegExp(tokens.join('.*'), 'i');
}

/**
 * Simple scoring: boosts title matches above author/keywords.
 */
function scoreBook(book, query) {
  const q = normalize(query);
  const title = normalize(book.title);
  const author = normalize(book.author);
  const desc = normalize(book.description);
  const keywords = Array.isArray(book.keywords) ? book.keywords.map(normalize).join(' ') : '';

  let score = 0;

  if (title === q) score += 100;
  if (author === q) score += 70;

  if (title.includes(q)) score += 60;
  if (author.includes(q)) score += 40;
  if (keywords.includes(q)) score += 25;
  if (desc.includes(q)) score += 10;

  // token bonus
  const tokens = q.split(' ').filter(Boolean);
  for (const t of tokens) {
    if (title.includes(t)) score += 8;
    if (author.includes(t)) score += 5;
    if (keywords.includes(t)) score += 3;
  }

  return score;
}

module.exports = { normalize, buildFuzzyRegex, scoreBook };