import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Страж наполнимости главы. Сосуд Маршрута считает (секции + идеальные
// проверки + тренажёры) / (всего того же). Если блок не умеет записаться в
// store, его знаменатель растёт, а числитель — нет, и глава НИКОГДА не дойдёт
// до крышки: ни сертификата, ни словаря. Молча, без единого падения.
//
// Так и было 17.09.2026 в одиннадцати главах из 137: в девяти у <SelfCheck>
// не было quizId (SelfCheck.tsx:52 без него выходит, ничего не записав), в
// двух стоял <WordOrder>, вовсе не подключённый к store.

const files = [];
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (/\.mdx?$/.test(e.name)) files.push(p);
  });
walk('docs');

test('у каждого SelfCheck есть quizId — иначе он не записывается', () => {
  const bad = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const all = (src.match(/<SelfCheck/g) || []).length;
    const withId = (src.match(/<SelfCheck[^>]*quizId/g) || []).length;
    if (all !== withId) bad.push(`${path.basename(f)}: ${all - withId} из ${all} без quizId`);
  }
  assert.deepEqual(bad, [], `проверки не запишутся:\n${bad.join('\n')}`);
});

test('quizId уникальны внутри главы — дубль съедает вторую проверку', () => {
  const bad = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const ids = [...src.matchAll(/<SelfCheck[^>]*quizId="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) bad.push(`${path.basename(f)}: ${[...new Set(dup)].join(', ')}`);
  }
  assert.deepEqual(bad, [], `дубли quizId:\n${bad.join('\n')}`);
});

test('каждая механика тренажёра умеет записать прохождение', () => {
  // Знаменатель главы считает тренажёры по trainerId в тексте. Если компонент
  // не вызывает markTrainerDone, его экземпляры вечно висят непройденными и
  // глава не дойдёт до крышки. На 17.09.2026 пишут все 46 из 46.
  const reg = JSON.parse(fs.readFileSync('src/data/trainers.json', 'utf8'));
  const mute = [];
  for (const m of reg) {
    const p = `src/components/${m.component}.tsx`;
    if (!fs.existsSync(p)) {
      mute.push(`${m.component}: файла нет`);
      continue;
    }
    if (!/markTrainerDone\(/.test(fs.readFileSync(p, 'utf8')))
      mute.push(`${m.component} (${m.exercises.length} упражнений)`);
  }
  assert.deepEqual(mute, [], `тренажёры не записывают прохождение:\n${mute.join('\n')}`);
});
