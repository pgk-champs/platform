import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// Роль модератора повторяет роль автора: та же таблица из трёх колонок и та же
// выдача наставником. Тест стережёт, что очередь закрыта проверкой роли, а
// выдавать роль может только наставник — ошибка здесь сделала бы очередь
// публичной, и об этом никто бы не узнал.
const src = fs.readFileSync(new URL('./index.mjs', import.meta.url), 'utf8');

test('таблица модераторов заведена', () => {
  assert.match(src, /CREATE TABLE IF NOT EXISTS moderators/);
});

test('очередь закрыта проверкой роли', () => {
  const i = src.indexOf("path === '/moderate/queue'");
  assert.ok(i > 0, 'ручки очереди нет');
  assert.match(src.slice(i, i + 400), /moderatorGuard\(\)/);
});

test('выдавать роль может только наставник', () => {
  const i = src.indexOf("path === '/moderate/people' && req.method === 'POST'");
  assert.ok(i > 0, 'ручки выдачи роли нет');
  assert.match(src.slice(i, i + 400), /mentorGuardTop\(\)/);
});
