const store = new Map();

/**
 * Get cached value by key.
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set cached value with TTL (ms).
 */
function set(key, value, ttlMs = 30_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Delete key(s) by prefix, helpful after writes.
 */
function delByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { get, set, delByPrefix };