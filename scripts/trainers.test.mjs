import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { buildTrainers } from './knowledge-map.mjs';

const REG = buildTrainers('docs');

test('в реестре ровно те механики, что стоят в главах', () => {
  // Независимый обход: если генератор кого-то потеряет, счёт разойдётся.
  const seen = new Set();
  const walk = (d) =>
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) return walk(p);
      if (!/\.mdx?$/.test(e.name)) return;
      const src = fs.readFileSync(p, 'utf8');
      for (const m of src.matchAll(/<([A-Z]\w*)[^>]*?trainerId="/g)) seen.add(m[1]);
    });
  walk('docs');

  const inRegistry = new Set(REG.map((r) => r.component));
  const lost = [...seen].filter((c) => !inRegistry.has(c));
  assert.deepEqual(lost, [], `тренажёры потерялись: ${lost.join(', ')}`);
});

test('якорь не выдуман: он либо есть в главе, либо null', () => {
  // Выдуманный якорь — ссылка в никуда. <Block> рендерит id ровно из blockId,
  // и у 84 наборов печати этого атрибута нет: там честный null, а ссылка ведёт
  // на главу. Раньше подставлялся trainerId, и 84 ссылки вели в пустоту.
  const sources = new Map();
  for (const mech of REG)
    for (const ex of mech.exercises) {
      if (ex.blockId === null) continue;
      if (!sources.has(ex.path)) {
        const dir = path.dirname(path.join('docs', ex.path));
        const want = path.basename(ex.path);
        const hit = fs
          .readdirSync(dir)
          .find((n) => n.replace(/\.mdx?$/, '').replace(/^\d+[-_.]/, '') === want);
        sources.set(ex.path, fs.readFileSync(path.join(dir, hit), 'utf8'));
      }
      assert.ok(
        sources.get(ex.path).includes(`blockId="${ex.blockId}"`),
        `${mech.component}: якорь ${ex.blockId} выдуман — в ${ex.path} его нет`,
      );
    }
});

test('у каждого упражнения есть путь без расширения', () => {
  for (const mech of REG)
    for (const ex of mech.exercises) {
      assert.ok(ex.chapterId, `${mech.component}: нет chapterId`);
      assert.doesNotMatch(ex.path, /\.mdx?$/, `${mech.component}: путь с расширением`);
      assert.doesNotMatch(ex.path, /\/\d+-/, `${mech.component}: числовой префикс в пути`);
    }
});

test('ни один trainerId из глав не потерян', () => {
  // Считаем сырые вхождения — совсем другим способом, чем генератор. Замер
  // регэкспом <Component ...trainerId= недосчитал один: в advanced/repo-anatomy
  // сниппет печати содержит «echo '.env' >> .gitignore», и разбор спотыкался
  // о > внутри кавычек. Счёт по подстроке об это не спотыкается.
  let raw = 0;
  const walk = (d) =>
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) return walk(p);
      if (!/\.mdx?$/.test(e.name)) return;
      raw += (fs.readFileSync(p, 'utf8').match(/trainerId="/g) || []).length;
    });
  walk('docs');
  assert.equal(REG.reduce((s, m) => s + m.exercises.length, 0), raw);
});

test('механик 46, упражнений 228', () => {
  // Числа из замера 17.09.2026. Растут при написании глав — тогда поднять их
  // здесь осознанно, а не молча: падение означает «проверь, что добавилось».
  assert.equal(REG.length, 46);
  assert.equal(REG.reduce((s, m) => s + m.exercises.length, 0), 228);
});

test('у каждой механики есть подпись', () => {
  // Подпись — редакторский текст, генерировать её нельзя. Зато можно не дать
  // списку отстать: новая механика без записи роняет тесты. Так же устроен
  // Figure.test.tsx, и за всё время ни одна схема мимо него не проехала.
  const src = fs.readFileSync('src/data/trainer-names.ts', 'utf8');
  const named = new Set([...src.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]));
  const missing = REG.map((r) => r.component).filter((c) => !named.has(c));
  assert.deepEqual(missing, [], `нет подписи: ${missing.join(', ')}`);

  const extra = [...named].filter((c) => !REG.some((r) => r.component === c));
  assert.deepEqual(extra, [], `подпись есть, а тренажёра нет: ${extra.join(', ')}`);
});
