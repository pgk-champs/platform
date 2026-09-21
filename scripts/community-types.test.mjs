// Сервер принимает пять типов материала, а отправить из интерфейса можно было
// четыре: тип 'preset' сервер принимал, каталог его рисовал и запускал, но
// кнопки, которая его шлёт, не существовало нигде в src/ — половина дороги,
// построенная с обеих сторон и не соединённая. Страж не даёт этому повториться.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('каждый тип, который принимает сервер, можно отправить из интерфейса', () => {
  const сервер = fs.readFileSync('server/index.mjs', 'utf8');
  const m = /COMMUNITY_TYPES = new Set\(\[([^\]]+)\]\)/.exec(сервер);
  assert.ok(m, 'COMMUNITY_TYPES не нашёлся в server/index.mjs');
  const принимает = [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
  assert.ok(принимает.length >= 5);

  // Всё, что где-либо уходит в submitCommunity({ type: ... }).
  const фронт = ['src/components/SubmitCommunity.tsx', 'src/components/GymBuilder.tsx']
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
  const шлёт = new Set([
    ...[...фронт.matchAll(/value: '([a-z]+)'/g)].map((x) => x[1]),
    ...[...фронт.matchAll(/type: '([a-z]+)'/g)].map((x) => x[1]),
  ]);

  const немые = принимает.filter((t) => !шлёт.has(t));
  assert.deepEqual(немые, [], `сервер принимает, а отправить нечем: ${немые.join(', ')}`);
});

test('правила набора не разъехались: сайт читает тот же модуль, что сервер', () => {
  const builder = fs.readFileSync('src/components/GymBuilder.tsx', 'utf8');
  assert.match(builder, /from '\.\.\/\.\.\/server\/preset\.mjs'/, 'GymBuilder перестал читать общие правила');
  const сервер = fs.readFileSync('server/index.mjs', 'utf8');
  assert.match(сервер, /normalizePreset\(data\)/, 'сервер перестал проверять набор общими правилами');
});
