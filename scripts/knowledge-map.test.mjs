import { test } from 'node:test';
import assert from 'node:assert';
import { buildMap } from './knowledge-map.mjs';

test('collects tagged chapters sorted by order', () => {
  const map = buildMap('scripts/fixtures/good');
  assert.deepEqual(map.map(e => e.id), ['terminal', 'kotlin-vars']);
  assert.equal(map[0].audience, 'все');
  assert.equal(map[0].level, 'база');
  assert.equal(map[0].path, 'terminal.md');
});

test('throws on missing tags', () => {
  assert.throws(() => buildMap('scripts/fixtures/bad'), /missing frontmatter/);
});
