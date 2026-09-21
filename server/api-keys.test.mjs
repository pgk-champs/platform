// Ключи внешних сервисов. Здесь — чистая логика; живые запросы по ключу
// проверяет server/permissions.test.mjs на настоящем сервере.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newKey, hashKey, looksLikeKey, keyHint, cleanScopes, scopesAllowedFor, effectiveScopes, keyUsable, makeLimiter } from './api-keys.mjs';
import { ROUTES, SCOPES, SCOPE_LIST, matchRoute } from './api-routes.mjs';

test('ключ случаен, узнаваем и хранится только хешем', () => {
  const a = newKey();
  const b = newKey();
  assert.notEqual(a.secret, b.secret);
  assert.ok(looksLikeKey(a.secret));
  assert.equal(hashKey(a.secret), a.hash);
  assert.equal(a.hash.length, 64);
  // по подсказке ключ не восстановить
  assert.ok(!a.hash.includes(a.secret));
  assert.match(keyHint(a.secret), /^pgk_….{4}$/u);
});

test('ключ не может больше своего владельца', () => {
  const хочет = ['content:read', 'content:write', 'groups:read', 'community:moderate'];
  assert.deepEqual(effectiveScopes(хочет, {}), ['content:read']);
  assert.deepEqual(effectiveScopes(хочет, { author: true }), ['content:read', 'content:write']);
  assert.deepEqual(effectiveScopes(хочет, { mentor: true }), ['content:read', 'groups:read', 'community:moderate']);
});

test('права пересчитываются, а не запоминаются: сняли роль — право пропало', () => {
  const выдано = 'content:read,content:write';
  assert.ok(effectiveScopes(выдано, { author: true }).includes('content:write'));
  assert.ok(!effectiveScopes(выдано, { author: false }).includes('content:write'));
});

test('выдуманные права отбрасываются', () => {
  assert.deepEqual(cleanScopes(['content:read', 'admin:everything', '']), ['content:read']);
  assert.deepEqual(cleanScopes('content:read, content:read'), ['content:read']);
});

test('отозванный и просроченный ключ мертвы', () => {
  const now = 1000;
  assert.equal(keyUsable({ revoked_at: null, expires_at: null }, now), true);
  assert.equal(keyUsable({ revoked_at: 900, expires_at: null }, now), false);
  assert.equal(keyUsable({ revoked_at: null, expires_at: 900 }, now), false);
  assert.equal(keyUsable(null, now), false);
});

test('в белом списке нет ничего разрушительного', () => {
  // Это не стилистика: удаление групп и результатов необратимо, а прогресс и
  // рейтинг сервер не проверяет — что прислали, то и сохранилось.
  for (const r of ROUTES) assert.notEqual(r.method, 'DELETE', `${r.pattern} — удаление ключу недоступно`);
  const пути = ROUTES.map((r) => r.pattern);
  for (const запрет of ['/progress', '/leaderboard', '/mentor/mentors', '/content/authors', '/moderate/people']) {
    assert.ok(!пути.some((p) => p.includes(запрет)), `${запрет} не должен быть в API`);
  }
});

test('каждый маршрут ссылается на существующее право', () => {
  for (const r of ROUTES) if (r.scope) assert.ok(SCOPE_LIST.includes(r.scope), `${r.pattern}: нет права ${r.scope}`);
});

test('маршруты разбираются с параметрами и не ловят лишнего', () => {
  assert.equal(matchRoute('GET', '/chapters/kotlin-null').params.id, 'kotlin-null');
  assert.equal(matchRoute('GET', '/chapters/a/b'), null);
  assert.equal(matchRoute('PUT', '/community'), null);
  assert.deepEqual(matchRoute('POST', '/community/12/approve').params, { id: '12', action: 'approve' });
});

test('ограничение частоты: по минуте и отдельно по дорогим маршрутам', () => {
  const L = makeLimiter({ perMinute: 3 });
  for (let i = 0; i < 3; i += 1) assert.equal(L.check(1, null, 0), null);
  assert.match(L.check(1, null, 0).reason, /в минуту/);
  // другой ключ не страдает
  assert.equal(L.check(2, null, 0), null);
  // следующая минута — снова можно
  assert.equal(L.check(1, null, 60_000), null);

  const дорогой = { pattern: '/chapters/:id', limit: 2 };
  const L2 = makeLimiter({ perMinute: 100 });
  assert.equal(L2.check(1, дорогой, 0), null);
  assert.equal(L2.check(1, дорогой, 0), null);
  assert.match(L2.check(1, дорогой, 0).reason, /в час/);
});

test('у каждого права есть объяснение, у каждого маршрута — описание', () => {
  for (const s of SCOPE_LIST) assert.ok(SCOPES[s].что.length > 10, s);
  for (const r of ROUTES) {
    assert.ok(r.title && r.desc.length > 20, r.pattern);
  }
});
