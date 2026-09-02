import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { buildMap, stripNumberPrefix } from './knowledge-map.mjs';

// Каждая глава пишет прогресс в store под chapterId; он обязан совпадать с id
// из knowledge-map (тот же, что и у Docusaurus: числовой префикс «NN-» срезан,
// буквенно-числовой «02b-» — нет). Иначе /route никогда не увидит прогресс главы.
test('every chapterId literal in docs matches the knowledge-map id of its file', () => {
  const byPath = new Map(buildMap('docs').map(e => [e.path.replace(/\.mdx?$/, ''), e.id]));
  const walk = d =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(path.join(d, e.name)) : /\.mdx?$/.test(e.name) ? [path.join(d, e.name)] : [],
    );
  const problems = [];
  for (const file of walk('docs')) {
    const ids = [...new Set([...fs.readFileSync(file, 'utf8').matchAll(/chapterId="([^"]+)"/g)].map(m => m[1]))];
    if (ids.length === 0) continue;
    const key = path
      .relative('docs', file)
      .replace(/\.mdx?$/, '')
      .split(path.sep)
      .map(stripNumberPrefix)
      .join('/');
    const expected = byPath.get(key);
    if (!expected || ids.length !== 1 || ids[0] !== expected) problems.push(`${file}: ${ids.join(', ')} (ожидалось ${expected})`);
  }
  assert.deepEqual(problems, []);
});
