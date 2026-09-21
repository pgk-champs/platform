// Права наставника — на живом сервере, а не по чтению кода.
//
// Разбор 21.09.2026 показал три дыры, которые не видно ни одним статическим
// тестом: любой наставник выгружал ВСЮ базу платформы, стирал результат
// ЛЮБОГО человека и раздавал роли (а роль автора — это коммит в main).
// Проверять это можно только запросами, поэтому тест поднимает сервер.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

// Сервер нельзя поднять без своих зависимостей (better-sqlite3 лежит в
// server/package.json). У того, кто их не ставил, тест не должен падать
// красным — он должен честно сказать, чего не хватает. В CI они ставятся
// отдельным шагом, так что там проверка идёт по-настоящему.
let готов = true;
try {
  createRequire(import.meta.url)('better-sqlite3');
} catch {
  готов = false;
}

const PORT = 4873; // высокий и свободный; занят — тест честно упадёт на ожидании
const B = `http://localhost:${PORT}`;
const DB = path.join(os.tmpdir(), `pgk-perm-${process.pid}.db`);
let srv;

const tok = async (login) => {
  const r = await fetch(`${B}/auth/dev-login?login=${login}`, { redirect: 'manual' });
  return r.headers.get('location').split('#pgk_token=')[1];
};
const call = async (t, p, opts = {}) => {
  const r = await fetch(B + p, {
    ...opts,
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  return { status: r.status, body: await r.json().catch(() => null) };
};

before(async () => {
  if (!готов) return;
  srv = spawn(process.execPath, ['server/index.mjs'], {
    env: { ...process.env, DEV_LOGIN: '1', MENTORS: 'root', SESSION_SECRET: 'тест', DB_PATH: DB, PORT: String(PORT), BASE_URL: B },
    stdio: 'ignore',
  });
  for (let i = 0; i < 100; i += 1) {
    try {
      if ((await fetch(`${B}/health`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('сервер не поднялся');
});

after(() => {
  srv?.kill();
  for (const f of [DB, `${DB}-wal`, `${DB}-shm`]) fs.rmSync(f, { force: true });
});

const пропуск = { skip: готов ? false : 'нет зависимостей сервера: npm ci --prefix server' };

test('роли раздаёт только владелец платформы', пропуск, async () => {
  const root = await tok('root');
  const alice = await tok('alice');
  // до выдачи роли алиса вообще не наставник
  assert.equal((await call(alice, '/mentor/mentors', { method: 'POST', body: '{"login":"alice"}' })).status, 403);
  assert.equal((await call(root, '/mentor/mentors', { method: 'POST', body: '{"login":"alice"}' })).status, 200);
  // теперь она наставник — и всё равно не раздаёт роли
  assert.equal((await call(alice, '/mentor/mentors', { method: 'POST', body: '{"login":"mallory"}' })).status, 403);
  assert.equal((await call(alice, '/content/authors', { method: 'POST', body: '{"login":"alice"}' })).status, 403);
  assert.equal((await call(alice, '/moderate/people', { method: 'POST', body: '{"login":"alice"}' })).status, 403);
});

test('наставник видит только своих учеников, а проваленный квиз не засчитан', пропуск, async () => {
  const alice = await tok('alice');
  const bob = await tok('bob');
  const carol = await tok('carol');

  const grp = await call(alice, '/mentor/groups', { method: 'POST', body: '{"name":"Гр"}' });
  const code = grp.body.group?.code ?? grp.body.code;
  await call(carol, '/groups/join', { method: 'POST', body: JSON.stringify({ code }) });

  const квизы = { typing: { q1: { correct: 0, total: 3 }, q2: { correct: 3, total: 3 } } };
  await call(bob, '/progress', { method: 'PUT', body: JSON.stringify({ quizzes: квизы }) });
  await call(carol, '/progress', { method: 'PUT', body: JSON.stringify({ quizzes: { typing: { q1: { correct: 0, total: 3 } } } }) });

  const roster = await call(alice, '/mentor/students');
  assert.deepEqual(roster.body.students.map((s) => s.login), ['carol'], 'чужие ученики в сводке');
  assert.equal(roster.body.students[0].quizzesDone, 0, 'проваленный квиз засчитан');

  const все = await call(await tok('root'), '/mentor/students');
  const b = все.body.students.find((s) => s.login === 'bob');
  assert.equal(b.quizzesDone, 1, 'верный квиз не засчитан');
});

test('результат ученика стирает только его наставник', пропуск, async () => {
  const alice = await tok('alice');
  const root = await tok('root');
  const bob = await tok('bob');
  await call(bob, '/leaderboard', { method: 'PUT', body: '{"module":"a","score":5,"maxScore":10}' });
  const все = await call(root, '/mentor/students');
  const bobId = все.body.students.find((s) => s.login === 'bob').gh_id;

  assert.equal((await call(alice, `/mentor/results/${bobId}/a`, { method: 'DELETE' })).status, 403);
  assert.equal((await call(root, `/mentor/results/${bobId}/a`, { method: 'DELETE' })).status, 200);
});

test('слишком большое тело обрывает соединение, а не копится в памяти', пропуск, async () => {
  const bob = await tok('bob');
  const big = JSON.stringify({ junk: 'x'.repeat(2_000_000) });
  const r = await fetch(`${B}/progress`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${bob}`, 'Content-Type': 'application/json' },
    body: big,
  }).catch((e) => ({ status: 0, err: e.cause?.code }));
  assert.ok(r.status === 0 || r.status === 400, `ответ ${r.status}`);
});

// --- ключи внешних сервисов, вживую ---

test('ключ не ходит в кабинет и не может больше владельца', пропуск, async () => {
  const stud = await tok('stud');
  // право наставника студенту не выдадут
  const отказ = await call(stud, '/keys', { method: 'POST', body: '{"name":"бот","scopes":["groups:read"]}' });
  assert.equal(отказ.status, 403);

  const made = await call(stud, '/keys', { method: 'POST', body: '{"name":"читатель","scopes":["content:read"]}' });
  assert.equal(made.status, 200);
  const key = made.body.ключ;
  assert.match(key, /^pgk_/);

  // ключ отвергается ВСЕМИ ручками кабинета — это главное свойство модели
  for (const p of ['/me', '/progress', '/mentor/students', '/keys']) {
    assert.equal((await call(key, p)).status, 401, `ключ пустили в ${p}`);
  }
  assert.equal((await call(key, '/progress', { method: 'PUT', body: '{"xp":999999}' })).status, 401);

  // а в своё API — ходит
  const me = await call(key, '/v1/me');
  assert.equal(me.status, 200);
  assert.deepEqual(me.body.ключ.права, ['content:read']);

  // чего не выдано — нельзя
  assert.equal((await call(key, '/v1/groups')).status, 403);
  // чего нет в белом списке — нет вовсе
  assert.equal((await call(key, '/v1/chapters/typing', { method: 'DELETE' })).status, 404);
});

test('отзыв действует мгновенно и остаётся след в журнале', пропуск, async () => {
  const stud = await tok('stud2');
  const key = (await call(stud, '/keys', { method: 'POST', body: '{"name":"временный","scopes":["content:read"]}' })).body.ключ;
  assert.equal((await call(key, '/v1/me')).status, 200);

  const список = await call(stud, '/keys');
  const id = список.body.ключи[0].id;
  assert.equal((await call(stud, `/keys/${id}/revoke`, { method: 'POST' })).status, 200);
  assert.equal((await call(key, '/v1/me')).status, 401);

  const журнал = await call(stud, `/keys/${id}/log`);
  assert.ok(журнал.body.записи.length >= 1, 'журнал пуст');
  assert.equal(журнал.body.записи.at(-1).path, '/me');
});

test('чужой ключ не виден и не отзывается', пропуск, async () => {
  const a = await tok('anna');
  const b = await tok('boris');
  await call(a, '/keys', { method: 'POST', body: '{"name":"аннин","scopes":["content:read"]}' });
  const чужие = await call(b, '/keys');
  assert.deepEqual(чужие.body.ключи, []);
  const списокA = await call(a, '/keys');
  assert.equal((await call(b, `/keys/${списокA.body.ключи[0].id}/revoke`, { method: 'POST' })).status, 404);
});

test('карточка ученика говорит, КАКИЕ тренажёры пройдены', пропуск, async () => {
  // Раньше id выбрасывались прямо в ответе, и «пять тренажёров» не отвечало
  // на вопрос «прошёл ли он выданный набор»: у зала под одним chapterId
  // лежат и механики, и наборы (preset:…).
  const root = await tok('root');
  const stud = await tok('dima');
  await call(stud, '/progress', {
    method: 'PUT',
    body: JSON.stringify({
      trainers: { gym: { 'gym-typing': { result: {}, ts: 1 }, 'preset:abc12': { result: {}, ts: 2 } } },
    }),
  });
  const все = await call(root, '/mentor/students');
  const id = все.body.students.find((s) => s.login === 'dima').gh_id;
  const карточка = await call(root, `/mentor/students/${id}`);
  const зал = карточка.body.chapters.find((c) => c.chapterId === 'gym');
  assert.equal(зал.trainers, 2);
  assert.ok(зал.trainerIds.includes('preset:abc12'), 'набор не виден наставнику');
});
