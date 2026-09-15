import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// Путь к файлу приходит от автора. Если проверку однажды ослабят, тем же
// запросом можно будет переписать код сервера или workflow деплоя — поэтому
// она проверяется отдельным тестом, а не «на глаз» при ревью.
const src = fs.readFileSync(new URL('./index.mjs', import.meta.url), 'utf8');
const m = src.match(/const SAFE_DOC_PATH = (\/.*\/);/);
assert.ok(m, 'в index.mjs нет SAFE_DOC_PATH — проверка пути пропала');
const SAFE = new RegExp(m[1].slice(1, -1));
const safeDocPath = (p) => typeof p === 'string' && SAFE.test(p) && !p.includes('..');

test('правится только страница внутри трека', () => {
  for (const p of [
    'docs/mobile/01-kotlin-vars.mdx',
    'docs/advanced/grep-regex.mdx',
    'docs/newtrack/00-intro.mdx',
  ]) assert.equal(safeDocPath(p), true, p);
});

test('всё остальное запрещено', () => {
  for (const p of [
    'server/index.mjs',
    'docs/../server/index.mjs',
    'docs/mobile/../../server/index.mjs',
    'docs/mobile/file.mdx/../../../evil.mjs',
    '.github/workflows/deploy.yml',
    'package.json',
    'docs/mobile/nested/deep.mdx',
    'docs/mobile/file.js',
    'docs/mobile/',
    '/etc/passwd',
    'docs//mobile/x.mdx',
    '',
  ]) assert.equal(safeDocPath(p), false, p);
});

test('не строка — тоже запрещено', () => {
  for (const p of [null, undefined, 42, {}, ['docs/mobile/x.mdx']])
    assert.equal(safeDocPath(p), false, String(p));
});
