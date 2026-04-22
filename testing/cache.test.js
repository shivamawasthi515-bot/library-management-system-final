const test = require('node:test');
const assert = require('node:assert/strict');

const cache = require('../utils/cache');

test('cache stores and retrieves values', () => {
  cache.set('a:key', { ok: true }, 1000);
  assert.deepEqual(cache.get('a:key'), { ok: true });
});

test('cache invalidates by prefix', () => {
  cache.set('books:list:1', 1, 1000);
  cache.set('books:list:2', 2, 1000);
  cache.delByPrefix('books:list:');
  assert.equal(cache.get('books:list:1'), null);
  assert.equal(cache.get('books:list:2'), null);
});
