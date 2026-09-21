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
