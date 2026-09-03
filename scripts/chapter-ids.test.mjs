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

// У каждой главы должен быть финальный экзамен (ChapterExam) — для единообразия
// и чтобы дашборд наставника видел «экзамен сдан». Пробел раньше появлялся
// незаметно (9 глав без экзамена), теперь он ловится тестом.
test('every chapter has a final exam (ChapterExam)', () => {
  const walk = d =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(path.join(d, e.name)) : /\.mdx?$/.test(e.name) ? [path.join(d, e.name)] : [],
    );
  // index.* — страницы-разделы трека, а не главы; экзамен им не нужен.
  const missing = walk('docs')
    .filter((f) => !/(^|\/)index\.mdx?$/.test(f))
    .filter((f) => !fs.readFileSync(f, 'utf8').includes('<ChapterExam'));
  assert.deepEqual(missing, []);
});

// 2-5 иллюстраций на главу — держит текст читаемым, но не голым (ночная
// директива: «на статьи было 2-5 картинок»).
test('every chapter has 2-5 <Figure> illustrations', () => {
  const walk = d =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(path.join(d, e.name)) : /\.mdx?$/.test(e.name) ? [path.join(d, e.name)] : [],
    );
  const problems = walk('docs')
    .filter((f) => !/(^|\/)index\.mdx?$/.test(f))
    .map((f) => [f, (fs.readFileSync(f, 'utf8').match(/<Figure\b/g) ?? []).length])
    .filter(([, n]) => n < 2 || n > 5)
    .map(([f, n]) => `${f}: ${n}`);
  assert.deepEqual(problems, []);
});

// <Hint type="..."> ловится только рендером на SSG (Hint.tsx падает на
// undefined.icon) — typecheck/vitest это не видят, т.к. type: string
// в JSX-пропах не проверяется как литерал. Пойман 3-го сентября на
// build-е (advice/warning вместо tip/important/fact); страж — чтобы
// не пришлось ловить снова на живой сборке.
test('every <Hint type="..."> in docs uses a valid HintType', () => {
  const walk = d =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(path.join(d, e.name)) : /\.mdx?$/.test(e.name) ? [path.join(d, e.name)] : [],
    );
  const valid = new Set(['tip', 'important', 'fact']);
  const problems = [];
  for (const file of walk('docs')) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/<Hint\b[^>]*\btype="([^"]+)"/g)) {
      if (!valid.has(m[1])) problems.push(`${file}: type="${m[1]}"`);
    }
  }
  assert.deepEqual(problems, []);
});

// 4-5 куратор-видео на главу (src/data/chapter-videos.json, рендерятся
// ChapterVideos в футере) — та же ночная директива, «по 4-5 видео».
test('every chapter has 4-5 curated videos in chapter-videos.json', () => {
  const byPath = new Map(buildMap('docs').map(e => [e.path.replace(/\.mdx?$/, ''), e.id]));
  const videos = JSON.parse(fs.readFileSync('src/data/chapter-videos.json', 'utf8'));
  const problems = [];
  for (const id of new Set(byPath.values())) {
    const n = (videos[id] ?? []).length;
    if (n < 4 || n > 5) problems.push(`${id}: ${n}`);
  }
  assert.deepEqual(problems, []);
});
