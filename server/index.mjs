// Личный кабинет платформы pgk-champs.
//
// Делает ровно три вещи: вход через GitHub (OAuth web flow — секрет живёт
// только здесь, на сервере), хранение прогресса ученика в SQLite по его
// GitHub-идентификатору, и выдачу/приём этого прогресса по токену сессии.
// Больше ничего: ни доступа к репозиториям ученика, ни лишних прав.

import http from 'node:http';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { mergeProgress } from './merge.mjs';

const PORT = Number(process.env.PORT || 3000);
const CLIENT_ID = process.env.GH_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GH_CLIENT_SECRET || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const BASE_URL = (process.env.BASE_URL || 'https://edu.alspio.com').replace(/\/$/, '');
const DB_PATH = process.env.DB_PATH || '/data/account.db';
// Тестовый вход без GitHub — включается только явным флагом, для локальной
// проверки синхронизации до регистрации OAuth-приложения. В проде выключен.
const DEV_LOGIN = process.env.DEV_LOGIN === '1';
const ORIGINS = (process.env.ALLOW_ORIGINS || BASE_URL)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!SESSION_SECRET) {
  console.error('SESSION_SECRET обязателен'); // подпись токенов без него небезопасна
  process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users (
  gh_id     INTEGER PRIMARY KEY,
  login     TEXT NOT NULL,
  name      TEXT,
  avatar    TEXT,
  progress  TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL DEFAULT 0
)`);
const upsertUser = db.prepare(`INSERT INTO users (gh_id, login, name, avatar, progress, updated_at)
  VALUES (@gh_id, @login, @name, @avatar, '{}', 0)
  ON CONFLICT(gh_id) DO UPDATE SET login=@login, name=@name, avatar=@avatar`);
const getUser = db.prepare('SELECT * FROM users WHERE gh_id = ?');
const saveProgress = db.prepare('UPDATE users SET progress=?, updated_at=? WHERE gh_id=?');

// Рейтинг: лучший результат ученика по каждому модулю симулятора чемпионата.
db.exec(`CREATE TABLE IF NOT EXISTS results (
  gh_id        INTEGER NOT NULL,
  module       TEXT NOT NULL,
  title        TEXT,
  score        REAL NOT NULL,
  max_score    REAL NOT NULL,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  ts           INTEGER NOT NULL,
  PRIMARY KEY (gh_id, module)
)`);
// Обновляем строку, только если новый результат лучше: выше балл, а при равном —
// быстрее. Так «Отправить» можно жать сколько угодно, рекорд не ухудшится.
const upsertResult = db.prepare(`INSERT INTO results (gh_id, module, title, score, max_score, duration_sec, ts)
  VALUES (@gh_id, @module, @title, @score, @max_score, @duration_sec, @ts)
  ON CONFLICT(gh_id, module) DO UPDATE SET
    title=excluded.title, score=excluded.score, max_score=excluded.max_score,
    duration_sec=excluded.duration_sec, ts=excluded.ts
  WHERE excluded.score > results.score
     OR (excluded.score = results.score AND excluded.duration_sec < results.duration_sec)`);
const boardByModule = db.prepare(`SELECT r.gh_id, u.login, u.name, u.avatar, r.score, r.max_score, r.duration_sec, r.ts
  FROM results r JOIN users u ON u.gh_id = r.gh_id
  WHERE r.module = ? ORDER BY r.score DESC, r.duration_sec ASC, r.ts ASC LIMIT 200`);
const boardOverall = db.prepare(`SELECT r.gh_id, u.login, u.name, u.avatar,
    ROUND(SUM(r.score), 2) AS score, ROUND(SUM(r.max_score), 2) AS max_score,
    SUM(r.duration_sec) AS duration_sec, COUNT(*) AS modules, MAX(r.ts) AS ts
  FROM results r JOIN users u ON u.gh_id = r.gh_id
  GROUP BY r.gh_id ORDER BY score DESC, duration_sec ASC LIMIT 200`);
const modulesList = db.prepare('SELECT module, title, COUNT(*) AS players FROM results GROUP BY module ORDER BY module');
const myResults = db.prepare('SELECT module, title, score, max_score, duration_sec, ts FROM results WHERE gh_id = ? ORDER BY module');

// --- сессии: подписанный токен, без кук; клиент шлёт его в Authorization ---
const b64u = (buf) => Buffer.from(buf).toString('base64url');
function sign(payload) {
  const body = b64u(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verify(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expect = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  // timingSafeEqual бросает на разной длине — сравниваем аккуратно
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    const MAX_AGE = 180 * 24 * 3600 * 1000;
    if (!payload.iat || Date.now() - payload.iat > MAX_AGE) return null;
    return payload;
  } catch {
    return null;
  }
}

// state для OAuth (защита от CSRF на входе): короткоживущие одноразовые метки.
const states = new Map();
function makeState(ret) {
  const s = crypto.randomBytes(16).toString('hex');
  states.set(s, { ret, exp: Date.now() + 10 * 60 * 1000 });
  return s;
}
function takeState(s) {
  const e = states.get(s);
  states.delete(s);
  if (!e || e.exp < Date.now()) return null;
  return e;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of states) if (v.exp < now) states.delete(k);
}, 60 * 1000).unref();

// --- helpers ---
function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  }
}
const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};
function bearer(req) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/.exec(h);
  return m ? verify(m[1]) : null;
}
function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > limit) reject(new Error('too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
const safeReturn = (ret) => {
  // возвращаем только на свой сайт, чужие адреса игнорируем
  try {
    if (ret && ORIGINS.some((o) => ret.startsWith(o))) return ret;
  } catch {}
  return `${BASE_URL}/`;
};

async function ghExchange(code) {
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
  });
  const data = await r.json();
  if (!data.access_token) throw new Error('нет токена: ' + (data.error || 'unknown'));
  return data.access_token;
}
async function ghUser(token) {
  const r = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'pgk-champs' },
  });
  if (!r.ok) throw new Error('github /user ' + r.status);
  return r.json();
}

function loginUser(u, ret, res) {
  upsertUser.run({
    gh_id: u.id,
    login: u.login,
    name: u.name || u.login,
    avatar: u.avatar_url || '',
  });
  const token = sign({ id: u.id, login: u.login, iat: Date.now() });
  // отдаём токен фронту через фрагмент URL — он не попадает в логи сервера
  const url = new URL(safeReturn(ret));
  url.hash = `pgk_token=${encodeURIComponent(token)}`;
  res.writeHead(302, { Location: url.toString() });
  res.end();
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  const url = new URL(req.url, BASE_URL);
  const path = url.pathname.replace(/^\/api/, '') || '/';

  try {
    // oauth: подключено ли GitHub-приложение. Пока нет — фронт показывает
    // «скоро», а не кнопку входа, которая привела бы к 503.
    if (path === '/health') return json(res, 200, { ok: true, dev: DEV_LOGIN, oauth: !!CLIENT_ID || DEV_LOGIN });

    if (path === '/auth/login') {
      if (!CLIENT_ID) return json(res, 503, { error: 'oauth not configured' });
      const state = makeState(url.searchParams.get('return') || `${BASE_URL}/`);
      const gh = new URL('https://github.com/login/oauth/authorize');
      gh.searchParams.set('client_id', CLIENT_ID);
      gh.searchParams.set('redirect_uri', `${BASE_URL}/api/auth/callback`);
      gh.searchParams.set('scope', 'read:user');
      gh.searchParams.set('state', state);
      res.writeHead(302, { Location: gh.toString() });
      return res.end();
    }

    if (path === '/auth/callback') {
      const st = takeState(url.searchParams.get('state'));
      if (!st) return json(res, 400, { error: 'bad state' });
      const code = url.searchParams.get('code');
      if (!code) return json(res, 400, { error: 'no code' });
      const token = await ghExchange(code);
      const u = await ghUser(token);
      return loginUser(u, st.ret, res);
    }

    // Локальный тестовый вход — без GitHub, только если явно включён.
    if (path === '/auth/dev-login' && DEV_LOGIN) {
      const login = url.searchParams.get('login') || 'test-student';
      const u = { id: 900000 + (hash(login) % 1000), login, name: login, avatar_url: '' };
      return loginUser(u, url.searchParams.get('return') || `${BASE_URL}/`, res);
    }

    if (path === '/me') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      const u = getUser.get(s.id);
      if (!u) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { id: u.gh_id, login: u.login, name: u.name, avatar: u.avatar });
    }

    if (path === '/progress' && req.method === 'GET') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      const u = getUser.get(s.id);
      if (!u) return json(res, 401, { error: 'unauthorized' });
      return json(res, 200, { progress: JSON.parse(u.progress || '{}'), updated_at: u.updated_at });
    }

    if (path === '/progress' && req.method === 'PUT') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      const u = getUser.get(s.id);
      if (!u) return json(res, 401, { error: 'unauthorized' });
      let incoming;
      try {
        incoming = JSON.parse(await readBody(req));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      // Всегда сливаем с тем, что уже на сервере — второе устройство не затрёт
      // прогресс первого.
      const merged = mergeProgress(JSON.parse(u.progress || '{}'), incoming || {});
      const now = Date.now();
      saveProgress.run(JSON.stringify(merged), now, s.id);
      return json(res, 200, { progress: merged, updated_at: now });
    }

    // --- Рейтинг ---
    // Приём результата симулятора от вошедшего ученика.
    if (path === '/leaderboard' && req.method === 'PUT') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      if (!getUser.get(s.id)) return json(res, 401, { error: 'unauthorized' });
      let body;
      try {
        body = JSON.parse(await readBody(req, 10_000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const module = String(body.module || '').slice(0, 64);
      const score = Number(body.score);
      const maxScore = Number(body.maxScore);
      // Доверять клиентскому баллу нельзя вслепую, но и судейство тут условное:
      // ограничиваем диапазон здравыми рамками, чтобы нельзя было прислать 10^9.
      if (!module || !Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0 || score < 0 || score > maxScore) {
        return json(res, 400, { error: 'bad result' });
      }
      upsertResult.run({
        gh_id: s.id,
        module,
        title: String(body.title || module).slice(0, 200),
        score: Math.round(score * 100) / 100,
        max_score: Math.round(maxScore * 100) / 100,
        duration_sec: Math.max(0, Math.min(24 * 3600, Math.round(Number(body.durationSec) || 0))),
        ts: Date.now(),
      });
      return json(res, 200, { ok: true });
    }

    // Таблица лидеров: ?module=<id> или overall (по умолчанию). Публичная.
    if (path === '/leaderboard' && req.method === 'GET') {
      const module = url.searchParams.get('module');
      const rows =
        module && module !== 'overall' ? boardByModule.all(module) : boardOverall.all();
      const me = bearer(req);
      return json(res, 200, {
        module: module || 'overall',
        modules: modulesList.all(),
        rows: rows.map((r, i) => ({ ...r, place: i + 1, me: !!(me && me.id === r.gh_id) })),
      });
    }

    // Мои результаты и места — для профиля.
    if (path === '/leaderboard/me') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      const mine = myResults.all(s.id);
      const withPlace = mine.map((r) => {
        const board = boardByModule.all(r.module);
        const place = board.findIndex((b) => b.gh_id === s.id) + 1;
        return { ...r, place, players: board.length };
      });
      const overall = boardOverall.all();
      const overallPlace = overall.findIndex((b) => b.gh_id === s.id) + 1;
      return json(res, 200, {
        modules: withPlace,
        overall: overallPlace ? { place: overallPlace, players: overall.length } : null,
      });
    }

    return json(res, 404, { error: 'not found' });
  } catch (e) {
    console.error(path, e.message);
    return json(res, 500, { error: 'server error' });
  }
});

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

server.listen(PORT, '0.0.0.0', () => console.log(`account api on ${PORT}, dev=${DEV_LOGIN}`));
