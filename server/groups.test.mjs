import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// Группы построены целиком — таблицы, ручки, экран наставника, вступление по
// коду, — но на 21.09.2026 в боевой базе было 0 групп и 0 участников: путь ни
// разу не проходили живьём. Пройден вручную полностью (создание → код →
// вступление → синхронизация → сводка), и нашлась ровно одна дыра: запрос
// myGroups был написан и НИ РАЗУ не вызван, поэтому студент после вступления
// терял всякий след своей группы при первой же перезагрузке.

const src = fs.readFileSync('server/index.mjs', 'utf8');

test('профиль отдаёт свои группы — иначе студент их не увидит', () => {
  const me = /if \(path === '\/me'\)([\s\S]*?)\n    \}/.exec(src);
  assert.ok(me, 'ручка /me не найдена');
  assert.match(me[1], /groups:\s*myGroups\.all/, '/me не отдаёт группы студента');
});

test('ни один подготовленный запрос про группы не остался мёртвым', () => {
  // Мёртвый запрос — след недоделанной фичи: myGroups пролежал таким до
  // 21.09.2026 и стоил студенту возможности проверить, в той ли он группе.
  const declared = [...src.matchAll(/^const (\w*[Gg]roup\w*|myGroups|addMember|removeMember|memberIds) = db\.prepare/gm)].map(
    (m) => m[1],
  );
  assert.ok(declared.length > 5, `ожидались запросы про группы, найдено ${declared.length}`);
  const dead = declared.filter((name) => {
    const uses = src.split(new RegExp(`\\b${name}\\b`)).length - 1;
    return uses < 2; // объявление + хотя бы одно использование
  });
  assert.deepEqual(dead, [], `запросы объявлены и не используются: ${dead.join(', ')}`);
});
