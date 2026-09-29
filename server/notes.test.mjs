// Заметки ученика — на живом сервере, как и права наставника в
// permissions.test.mjs: кто что читает, проверяется только запросами.

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

const PORT = 4874; // высокий и свободный; занят — тест честно упадёт на ожидании
const B = `http://localhost:${PORT}`;
const DB = path.join(os.tmpdir(), `pgk-notes-${process.pid}.db`);
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


test('заметку ученика читают автор, наставник его группы и корневой — и больше никто', пропуск, async () => {
  const root = await tok('root');
  const nina = await tok('nina');
  const oleg = await tok('oleg');
  const pasha = await tok('pasha');
  await call(root, '/mentor/mentors', { method: 'POST', body: '{"login":"nina"}' });
  await call(root, '/mentor/mentors', { method: 'POST', body: '{"login":"oleg"}' });
  const g = await call(nina, '/mentor/groups', { method: 'POST', body: '{"name":"Нинина"}' });
  await call(pasha, '/groups/join', { method: 'POST', body: JSON.stringify({ code: g.body.group?.code ?? g.body.code }) });

  const made = await call(pasha, '/notes', {
    method: 'POST',
    body: JSON.stringify({ title: 'git', body: 'rebase ≠ merge', chapterId: 'git-branches' }),
  });
  assert.equal(made.status, 200);
  const id = made.body.note.id;
  assert.equal((await call(pasha, '/notes?chapter=git-branches')).body.notes.length, 1);
  assert.equal((await call(pasha, '/notes?chapter=kotlin-vars')).body.notes.length, 0);

  const seen = async (t) => (await call(t, '/mentor/student-notes')).body?.notes?.some((n) => n.id === id) ?? false;
  assert.equal(await seen(nina), true, 'наставник группы не видит заметку');
  assert.equal(await seen(root), true, 'корневой не видит заметку');
  assert.equal(await seen(oleg), false, 'чужой наставник видит заметку');
  assert.equal((await call(pasha, '/mentor/student-notes')).status, 403);

  // чужую не правят и не удаляют, и ответ не отличается от «нет такой»
  assert.equal((await call(oleg, `/notes/${id}`, { method: 'PUT', body: '{"title":"x"}' })).status, 404);
  assert.equal((await call(oleg, `/notes/${id}`, { method: 'DELETE' })).status, 404);
  assert.equal((await call(oleg, `/notes/${id}/share`, { method: 'POST' })).status, 404);
});

test('ссылка открывает заметку без входа, отзыв её убивает', пропуск, async () => {
  const rita = await tok('rita');
  const id = (await call(rita, '/notes', { method: 'POST', body: '{"title":"шпора","body":"val — неизменяемая"}' })).body.note.id;
  const tokenA = (await call(rita, `/notes/${id}/share`, { method: 'POST' })).body.note.shareToken;
  assert.ok(tokenA && tokenA.length >= 16);

  const anon = await fetch(`${B}/notes/shared/${tokenA}`);
  assert.equal(anon.status, 200);
  const got = await anon.json();
  assert.equal(got.note.body, 'val — неизменяемая');
  assert.equal(got.author.login, 'rita');

  await call(rita, `/notes/${id}/share`, { method: 'DELETE' });
  assert.equal((await fetch(`${B}/notes/shared/${tokenA}`)).status, 404, 'отозванная ссылка всё ещё работает');
  const tokenB = (await call(rita, `/notes/${id}/share`, { method: 'POST' })).body.note.shareToken;
  assert.notEqual(tokenB, tokenA, 'после отзыва выдан тот же токен');

  assert.equal((await call(rita, `/notes/${id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await fetch(`${B}/notes/shared/${tokenB}`)).status, 404, 'удалённая заметка читается по ссылке');
});

test('пустую заметку и мусор вместо главы не принимает', пропуск, async () => {
  const sasha = await tok('sasha');
  assert.equal((await call(sasha, '/notes', { method: 'POST', body: '{"title":"  ","body":" "}' })).status, 400);
  assert.equal((await call(sasha, '/notes', { method: 'POST', body: '{"title":"a","chapterId":"../x"}' })).status, 400);
  const onlyBody = await call(sasha, '/notes', { method: 'POST', body: '{"body":"первая строка\\nвторая"}' });
  assert.equal(onlyBody.body.note.title, 'первая строка', 'заголовок не взят из первой строки');
  assert.equal((await call(null, '/notes')).status, 401);
});
