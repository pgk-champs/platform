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

test('у каждого упражнения есть якорь и путь без расширения', () => {
  for (const mech of REG)
    for (const ex of mech.exercises) {
      assert.ok(ex.blockId, `${mech.component}: нет blockId`);
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
