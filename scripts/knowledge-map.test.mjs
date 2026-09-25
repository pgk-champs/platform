import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { buildMap } from './knowledge-map.mjs';

test('collects tagged chapters sorted by order', () => {
  const map = buildMap('scripts/fixtures/good');
  assert.deepEqual(map.map(e => e.id), ['terminal', 'prefixed', 'kotlin-vars']);
  assert.equal(map[0].audience, 'все');
  assert.equal(map[0].level, 'база');
  assert.equal(map[0].path, 'terminal.md');
});

test('strips numeric order prefix from id and path, but NOT from file', () => {
  const map = buildMap('scripts/fixtures/good');
  const prefixed = map.find(e => e.id === 'prefixed');
  assert.ok(prefixed);
  assert.equal(prefixed.path, 'prefixed.md');
  assert.ok(!prefixed.path.includes('02-'));
  // path — это URL-слаг (Docusaurus сам режет префикс у ссылок), а не файловый
  // путь. file — настоящее имя на диске: server/index.mjs берёт исходник
  // главы у GitHub по file, взять для этого path значило бы просить файл,
  // которого не существует (см. запись в CLAUDE.md §7 от 25.09.2026).
  assert.equal(prefixed.file, '02-prefixed.md');
});

test('file всегда указывает на настоящий файл — по всем 137 главам, не по выборке', () => {
  // Реконструкция вида `${num}-${path}` здесь не годится: у части глав
  // (docs/advanced/*) num чисто декоративный и не совпадает ни с каким
  // префиксом в имени файла — семь из 137 сломались бы именно так, если
  // это когда-нибудь попробуют «оптимизировать» обратно.
  const map = buildMap('docs');
  const missing = map.filter((c) => !fs.existsSync(`docs/${c.file}`)).map((c) => c.id);
  assert.deepEqual(missing, []);
});

test('throws on missing tags', () => {
  assert.throws(() => buildMap('scripts/fixtures/bad'), /missing frontmatter/);
});
