const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeText, buildPartialRegex, fuzzyScore, rankBooks } = require('../utils/search');

test('normalizeText normalizes whitespace and case', () => {
  assert.equal(normalizeText('  HeLLo   World  '), 'hello world');
});

test('buildPartialRegex supports partial multi-token matching', () => {
  const regex = buildPartialRegex('digital signal');
  assert.ok(regex.test('Digital processing and signal theory'));
});

test('fuzzyScore returns higher score for closer matches', () => {
  const near = fuzzyScore('harry poter', 'harry potter');
  const far = fuzzyScore('harry poter', 'quantum mechanics');
  assert.ok(near > far);
});

test('rankBooks prioritizes strong title matches', () => {
  const ranked = rankBooks(
    [
      { title: 'Learning JavaScript', authors: ['Ethan Brown'], tags: ['web'], description: '', _textScore: 0.2 },
      { title: 'JavaScript', authors: ['Someone'], tags: ['code'], description: '', _textScore: 1.1 }
    ],
    'javascript'
  );

  assert.equal(ranked[0].title, 'JavaScript');
});
