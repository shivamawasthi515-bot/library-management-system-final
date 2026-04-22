const MAX_ITEMS = 250;
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  // LRU policy: refresh recency by moving the touched key to the end of the Map.
  store.delete(key);
  store.set(key, entry);
  return entry.value;
}

function set(key, value, ttlMs = 30_000) {
  if (store.has(key)) store.delete(key);
  store.set(key, { value, expiresAt: Date.now() + ttlMs });

  while (store.size > MAX_ITEMS) {
    const firstKey = store.keys().next().value;
    store.delete(firstKey);
  }
}

function delByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { get, set, delByPrefix };
