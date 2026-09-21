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
import { checkLink } from './linkcheck.mjs';
import { normalizePreset, presetSummary } from './preset.mjs';

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
// Правка страниц: токен с правом записи ТОЛЬКО в этот репозиторий. Лежит на
// сервере, ученикам и авторам не показывается — у них OAuth просит лишь
// read:user, и расширять это право нельзя.
const CONTENT_TOKEN = process.env.CONTENT_TOKEN || '';
const CONTENT_REPO = process.env.CONTENT_REPO || 'pgk-champs/platform';
const CONTENT_BRANCH = process.env.CONTENT_BRANCH || 'main';
// Корневые авторы — из .env, остальных добавляет наставник через кабинет.
const CONTENT_AUTHORS = (process.env.CONTENT_AUTHORS || '')
  .split(',')
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);

// Наставники (по GitHub-логину) видят дашборд группы. Список — в .env.
const MENTORS = (process.env.MENTORS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const isRootMentor = (u) => !!u && MENTORS.includes(String(u.login).toLowerCase());
// Наставник = корневой из env ИЛИ добавленный со-наставник из таблицы mentors.
const isMentor = (u) => isRootMentor(u) || (!!u && !!mentorRow.get(String(u.login).toLowerCase()));
// Управлять группой может её владелец или со-наставник этой группы.
const canManageGroup = (u, g) =>
  !!u && !!g && (g.owner === u.gh_id || !!isGroupMentor.get(g.id, String(u.login).toLowerCase()));

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
const allUsers = db.prepare('SELECT gh_id, login, name, avatar, progress, updated_at FROM users');

// Группы (потоки/классы): наставник создаёт группу, ученик входит по коду.
db.exec(`CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  owner INTEGER NOT NULL,
  created_at INTEGER NOT NULL
)`);
db.exec(`CREATE TABLE IF NOT EXISTS group_members (
  group_id INTEGER NOT NULL,
  gh_id INTEGER NOT NULL,
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (group_id, gh_id)
)`);
const createGroup = db.prepare('INSERT INTO groups (name, code, owner, created_at) VALUES (?, ?, ?, ?)');
const groupByCode = db.prepare('SELECT * FROM groups WHERE code = ?');
const groupById = db.prepare('SELECT * FROM groups WHERE id = ?');
const deleteGroup = db.prepare('DELETE FROM groups WHERE id = ? AND owner = ?');
const deleteGroupMembers = db.prepare('DELETE FROM group_members WHERE group_id = ?');

// Со-наставничество: у группы, помимо владельца, могут быть со-наставники —
// они видят и ведут группу, но удалить её и менять состав со-наставников может
// только владелец.
db.exec(`CREATE TABLE IF NOT EXISTS group_mentors (
  group_id INTEGER NOT NULL, login TEXT NOT NULL, added_at INTEGER NOT NULL,
  PRIMARY KEY (group_id, login)
)`);
const addGroupMentor = db.prepare('INSERT OR IGNORE INTO group_mentors (group_id, login, added_at) VALUES (?, ?, ?)');
const removeGroupMentor = db.prepare('DELETE FROM group_mentors WHERE group_id = ? AND login = ?');
const groupMentorsOf = db.prepare('SELECT login FROM group_mentors WHERE group_id = ?');
const deleteGroupMentors = db.prepare('DELETE FROM group_mentors WHERE group_id = ?');
const isGroupMentor = db.prepare('SELECT 1 FROM group_mentors WHERE group_id = ? AND login = ?');
// Группы, которыми наставник управляет: свои + где он со-наставник.
const groupsIManage = db.prepare(`SELECT g.*, (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS members
  FROM groups g
  WHERE g.owner = @gh_id OR EXISTS (SELECT 1 FROM group_mentors gm WHERE gm.group_id = g.id AND gm.login = @login)
  ORDER BY g.created_at DESC`);
const addMember = db.prepare('INSERT OR IGNORE INTO group_members (group_id, gh_id, joined_at) VALUES (?, ?, ?)');
const removeMember = db.prepare('DELETE FROM group_members WHERE group_id = ? AND gh_id = ?');
const memberIds = db.prepare('SELECT gh_id FROM group_members WHERE group_id = ?');
const myGroups = db.prepare(`SELECT g.id, g.name FROM groups g
  JOIN group_members m ON m.group_id = g.id WHERE m.gh_id = ?`);
const deleteResult = db.prepare('DELETE FROM results WHERE gh_id = ? AND module = ?');

// Со-наставники: роль наставника поверх env-списка. Env-логины — «корневые»
// (их нельзя снять из UI), добавленные живут здесь.
db.exec(`CREATE TABLE IF NOT EXISTS mentors (
  login TEXT PRIMARY KEY, added_by TEXT, added_at INTEGER
)`);
const mentorRow = db.prepare('SELECT login FROM mentors WHERE login = ?');
const allMentorRows = db.prepare('SELECT login, added_by, added_at FROM mentors ORDER BY added_at');
const addMentor = db.prepare('INSERT OR IGNORE INTO mentors (login, added_by, added_at) VALUES (?, ?, ?)');
const removeMentorRow = db.prepare('DELETE FROM mentors WHERE login = ?');

// Авторы страниц. Роль отдельная от наставника намеренно: вести группу и
// писать в репозиторий — разные права, и раздавать второе всем со-наставникам
// групп не стоит.
db.exec(`CREATE TABLE IF NOT EXISTS authors (
  login TEXT PRIMARY KEY, added_by TEXT, added_at INTEGER
)`);
const authorRow = db.prepare('SELECT login FROM authors WHERE login = ?');
const allAuthorRows = db.prepare('SELECT login, added_by, added_at FROM authors ORDER BY added_at');
const addAuthor = db.prepare('INSERT OR IGNORE INTO authors (login, added_by, added_at) VALUES (?, ?, ?)');
const removeAuthorRow = db.prepare('DELETE FROM authors WHERE login = ?');
const isAuthor = (u) =>
  !!u && (CONTENT_AUTHORS.includes(String(u.login).toLowerCase()) || !!authorRow.get(String(u.login).toLowerCase()));

// Модератор проверяет материалы сообщества. Отдельно от наставника: проверять
// чужие ссылки и вести группу — разные занятия, и второе отдавать не обязательно.
db.exec(`CREATE TABLE IF NOT EXISTS moderators (
  login TEXT PRIMARY KEY, added_by TEXT, added_at INTEGER
)`);
const moderatorRow = db.prepare('SELECT login FROM moderators WHERE login = ?');
const allModeratorRows = db.prepare('SELECT login, added_by, added_at FROM moderators ORDER BY added_at');
const addModeratorRow = db.prepare('INSERT OR IGNORE INTO moderators (login, added_by, added_at) VALUES (?, ?, ?)');
const removeModeratorRow = db.prepare('DELETE FROM moderators WHERE login = ?');
// Наставник модерирует и без роли: она нужна, чтобы отдать проверку студенту.
const isModerator = (u) => !!u && (isMentor(u) || !!moderatorRow.get(String(u.login).toLowerCase()));

// Каталог сообщества с модерацией: ученик присылает материал (pending),
// наставник одобряет/отклоняет. Одобренные отдаются публично — это
// единственный источник каталога с 21.09.2026 (24 материала перевезены).
db.exec(`CREATE TABLE IF NOT EXISTS community (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  chapter_id TEXT,
  title TEXT NOT NULL,
  data TEXT NOT NULL,
  author_gh_id INTEGER NOT NULL,
  author_login TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  reviewed_by TEXT,
  reviewed_at INTEGER
)`);
const insertCommunity = db.prepare(`INSERT INTO community
  (type, chapter_id, title, data, author_gh_id, author_login, status, created_at)
  VALUES (@type, @chapter_id, @title, @data, @author_gh_id, @author_login, 'pending', @created_at)`);
const approvedCommunity = db.prepare(`SELECT id, type, chapter_id, title, data, author_login, created_at
  FROM community WHERE status = 'approved' ORDER BY created_at DESC LIMIT 500`);
const communityByStatus = db.prepare(`SELECT id, type, chapter_id, title, data, author_login, status, created_at
  FROM community WHERE status = ? ORDER BY created_at DESC LIMIT 500`);
const setCommunityStatus = db.prepare('UPDATE community SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?');
const pendingCountForUser = db.prepare("SELECT COUNT(*) AS n FROM community WHERE author_gh_id = ? AND status = 'pending'");

const COMMUNITY_TYPES = new Set(['preset', 'repo', 'link', 'video', 'source']);

// Уведомления наставнику: с какого момента он «всё видел». Считаем, что нового
// появилось после этой отметки.
db.exec(`CREATE TABLE IF NOT EXISTS mentor_seen (login TEXT PRIMARY KEY, last_seen INTEGER NOT NULL)`);
const getSeen = db.prepare('SELECT last_seen FROM mentor_seen WHERE login = ?');
const setSeen = db.prepare('INSERT INTO mentor_seen (login, last_seen) VALUES (?, ?) ON CONFLICT(login) DO UPDATE SET last_seen = excluded.last_seen');
const pendingCount = db.prepare("SELECT COUNT(*) AS n FROM community WHERE status = 'pending'");
const newMembersCount = db.prepare(`SELECT COUNT(*) AS n FROM group_members m JOIN groups g ON g.id = m.group_id
  WHERE m.joined_at > @since AND (g.owner = @gh_id
    OR EXISTS (SELECT 1 FROM group_mentors gm WHERE gm.group_id = g.id AND gm.login = @login))`);

// Код присоединения: 6 символов без похожих (0/O, 1/I) — диктовать голосом легко.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeGroupCode() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const bytes = crypto.randomBytes(6);
    let code = '';
    for (const b of bytes) code += CODE_ALPHABET[b % CODE_ALPHABET.length];
    if (!groupByCode.get(code)) return code;
  }
  throw new Error('cannot allocate group code');
}

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

// ─── правка страниц через GitHub ──────────────────────────────────────────
// Путь приходит от автора, поэтому его проверяем строго: править можно ТОЛЬКО
// файлы глав. Без этой проверки автор мог бы переписать код сервера или CI
// тем же самым запросом.
// Единственный файл, который правит ручка видео. Лежит константой рядом с
// защитой путей, чтобы обе было видно сразу.
const VIDEOS_PATH = 'src/data/chapter-videos.json';
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const SAFE_DOC_PATH = /^docs\/[a-z0-9][a-z0-9-]*\/[A-Za-z0-9][A-Za-z0-9._-]*\.mdx$/;
const safeDocPath = (p) => typeof p === 'string' && SAFE_DOC_PATH.test(p) && !p.includes('..');

async function gh(path, { method = 'GET', body } = {}) {
  const r = await fetch(`https://api.github.com/repos/${CONTENT_REPO}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${CONTENT_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'edu-alspio',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* не json — отдадим как есть */ }
  return { ok: r.ok, status: r.status, data, text };
}

const b64encode = (str) => Buffer.from(str, 'utf8').toString('base64');
const b64decode = (str) => Buffer.from(String(str).replace(/\n/g, ''), 'base64').toString('utf8');

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
  // Возвращаем ТОЛЬКО на свой сайт. Сравнивать надо разобранный origin, а не
  // начало строки: проверка startsWith пропускала адрес вида
  // https://edu.alspio.com.чужой.example/ — и после входа туда уезжал
  // сессионный токен во фрагменте, то есть полный доступ к чужому аккаунту на
  // 180 дней. Поймано 21.09.2026 при разборе публичного API.
  try {
    if (!ret) return `${BASE_URL}/`;
    const u = new URL(ret, BASE_URL);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return `${BASE_URL}/`;
    if (ORIGINS.includes(u.origin)) return u.toString();
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
      // Свои группы отдаём вместе с профилем: запрос myGroups был написан
      // и НИ РАЗУ не вызван, поэтому студент, вступивший по коду, видел
      // подтверждение один раз и после перезагрузки терял всякий след —
      // проверить, в той ли он группе, было негде.
      return json(res, 200, {
        id: u.gh_id,
        login: u.login,
        name: u.name,
        avatar: u.avatar,
        mentor: isMentor(u),
        root: isRootMentor(u),
        groups: myGroups.all(u.gh_id),
      });
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

    // --- Дашборд наставника: сводка по всей группе. Только для наставников. ---
    if (path === '/mentor/students') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      const me = getUser.get(s.id);
      if (!isMentor(me)) return json(res, 403, { error: 'forbidden' });
      const overall = new Map(boardOverall.all().map((r) => [r.gh_id, r]));
      // Фильтр по группе: ?group=<id> ограничивает выборку её участниками.
      const groupId = Number(url.searchParams.get('group'));
      let roster = allUsers.all();
      if (groupId) {
        const g = groupById.get(groupId);
        if (!canManageGroup(me, g)) return json(res, 403, { error: 'forbidden' });
        const ids = new Set(memberIds.all(groupId).map((r) => r.gh_id));
        roster = roster.filter((u) => ids.has(u.gh_id));
      }
      const students = roster.map((row) => {
        let p = {};
        try {
          p = JSON.parse(row.progress || '{}');
        } catch {
          p = {};
        }
        const sections = p.sections && typeof p.sections === 'object' ? p.sections : {};
        const coverage = {};
        let sectionsRead = 0;
        for (const [ch, list] of Object.entries(sections)) {
          const n = Array.isArray(list) ? list.length : 0;
          if (n > 0) coverage[ch] = n;
          sectionsRead += n;
        }
        const countInner = (m) =>
          m && typeof m === 'object'
            ? Object.values(m).reduce((a, v) => a + (v && typeof v === 'object' ? Object.keys(v).length : 0), 0)
            : 0;
        const examsDone = p.exams && typeof p.exams === 'object' ? Object.keys(p.exams).length : 0;
        const best = overall.get(row.gh_id);
        return {
          gh_id: row.gh_id,
          login: row.login,
          name: row.name,
          avatar: row.avatar,
          xp: Number(p.xp) || 0,
          chaptersStarted: Object.keys(coverage).length,
          sectionsRead,
          quizzesDone: countInner(p.quizzes),
          trainersDone: countInner(p.trainers),
          examsDone,
          achievements: Array.isArray(p.achievementsUnlocked) ? p.achievementsUnlocked.length : 0,
          coverage,
          updatedAt: row.updated_at || 0,
          bestScore: best ? best.score : null,
        };
      });
      students.sort((a, b) => b.xp - a.xp || b.sectionsRead - a.sectionsRead);
      return json(res, 200, { students, count: students.length });
    }

    // Детальная карточка одного ученика (наставник): что именно пройдено.
    const sd = path.match(/^\/mentor\/students\/(\d+)$/);
    if (sd && req.method === 'GET') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      const me = getUser.get(s.id);
      if (!isMentor(me)) return json(res, 403, { error: 'forbidden' });
      const row = getUser.get(Number(sd[1]));
      if (!row) return json(res, 404, { error: 'not found' });
      let p = {};
      try {
        p = JSON.parse(row.progress || '{}');
      } catch {
        p = {};
      }
      const secMap = p.sections && typeof p.sections === 'object' ? p.sections : {};
      const quizMap = p.quizzes && typeof p.quizzes === 'object' ? p.quizzes : {};
      const examMap = p.exams && typeof p.exams === 'object' ? p.exams : {};
      const trainMap = p.trainers && typeof p.trainers === 'object' ? p.trainers : {};
      const chapterIds = [
        ...new Set([...Object.keys(secMap), ...Object.keys(quizMap), ...Object.keys(examMap), ...Object.keys(trainMap)]),
      ];
      const bestExam = (arr) =>
        Array.isArray(arr) && arr.length
          ? arr.reduce((a, b) => (Number(b.correct) > Number(a.correct) ? b : a))
          : null;
      const chapters = chapterIds.map((ch) => ({
        chapterId: ch,
        sections: Array.isArray(secMap[ch]) ? secMap[ch].length : 0,
        quizzes: quizMap[ch] && typeof quizMap[ch] === 'object'
          ? Object.entries(quizMap[ch]).map(([id, q]) => ({ id, correct: q.correct, total: q.total }))
          : [],
        exam: bestExam(examMap[ch]),
        trainers: trainMap[ch] && typeof trainMap[ch] === 'object' ? Object.keys(trainMap[ch]).length : 0,
      }));
      // Группы этого ученика, которыми владеет ЭТОТ наставник (чужие не раскрываем).
      const groups = db
        .prepare(
          `SELECT g.id, g.name FROM groups g JOIN group_members m ON m.group_id = g.id
           WHERE m.gh_id = @sid AND (g.owner = @gh_id
             OR EXISTS (SELECT 1 FROM group_mentors gm WHERE gm.group_id = g.id AND gm.login = @login))`,
        )
        .all({ sid: row.gh_id, gh_id: me.gh_id, login: String(me.login).toLowerCase() });
      return json(res, 200, {
        student: {
          gh_id: row.gh_id,
          login: row.login,
          name: row.name,
          avatar: row.avatar,
          xp: Number(p.xp) || 0,
          updatedAt: row.updated_at || 0,
        },
        chapters,
        results: myResults.all(row.gh_id),
        achievements: Array.isArray(p.achievementsUnlocked) ? p.achievementsUnlocked : [],
        groups,
      });
    }

    // Ученик присоединяется к группе по коду (любой вошедший).
    if (path === '/groups/join' && req.method === 'POST') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      if (!getUser.get(s.id)) return json(res, 401, { error: 'unauthorized' });
      let body;
      try {
        body = JSON.parse(await readBody(req, 1000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const code = String(body.code || '').trim().toUpperCase();
      const g = code && groupByCode.get(code);
      if (!g) return json(res, 404, { error: 'группа не найдена' });
      addMember.run(g.id, s.id, Date.now());
      return json(res, 200, { ok: true, group: { id: g.id, name: g.name } });
    }

    // --- Управление группами: только наставник-владелец ---
    const mentorGuard = () => {
      const s = bearer(req);
      if (!s) return { err: [401, 'unauthorized'] };
      const u = getUser.get(s.id);
      if (!isMentor(u)) return { err: [403, 'forbidden'] };
      return { u };
    };

    if (path === '/mentor/groups' && req.method === 'GET') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      const rows = groupsIManage.all({ gh_id: g.u.gh_id, login: String(g.u.login).toLowerCase() });
      const groups = rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        members: row.members,
        owner: row.owner === g.u.gh_id,
        comentors: groupMentorsOf.all(row.id).map((r) => r.login),
      }));
      return json(res, 200, { groups });
    }

    if (path === '/mentor/groups' && req.method === 'POST') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 1000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const name = String(body.name || '').trim().slice(0, 80);
      if (!name) return json(res, 400, { error: 'нужно имя группы' });
      const code = makeGroupCode();
      const info = createGroup.run(name, code, g.u.gh_id, Date.now());
      return json(res, 200, { id: info.lastInsertRowid, name, code, members: 0 });
    }

    // /mentor/groups/<id> · /remove · /comentor · /comentor/<login>
    const gm = path.match(/^\/mentor\/groups\/(\d+)(\/remove|\/comentor(?:\/([A-Za-z\d-]+))?)?$/);
    if (gm) {
      const guard = mentorGuard();
      if (guard.err) return json(res, guard.err[0], { error: guard.err[1] });
      const id = Number(gm[1]);
      const g = groupById.get(id);
      if (!g || !canManageGroup(guard.u, g)) return json(res, 404, { error: 'not found' });
      const isOwner = g.owner === guard.u.gh_id;

      // Удалить группу — только владелец.
      if (!gm[2] && req.method === 'DELETE') {
        if (!isOwner) return json(res, 403, { error: 'удалить группу может только владелец' });
        deleteGroupMembers.run(id);
        deleteGroupMentors.run(id);
        deleteGroup.run(id, guard.u.gh_id);
        return json(res, 200, { ok: true });
      }
      // Убрать ученика — любой управляющий группой.
      if (gm[2] === '/remove' && req.method === 'POST') {
        let body;
        try {
          body = JSON.parse(await readBody(req, 1000));
        } catch {
          return json(res, 400, { error: 'bad json' });
        }
        removeMember.run(id, Number(body.gh_id));
        return json(res, 200, { ok: true });
      }
      // Добавить со-наставника группы — только владелец.
      if (gm[2] === '/comentor' && req.method === 'POST') {
        if (!isOwner) return json(res, 403, { error: 'добавить со-наставника может только владелец' });
        let body;
        try {
          body = JSON.parse(await readBody(req, 1000));
        } catch {
          return json(res, 400, { error: 'bad json' });
        }
        const login = String(body.login || '').trim().toLowerCase().replace(/^@/, '');
        if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) return json(res, 400, { error: 'нужен GitHub-логин' });
        addGroupMentor.run(id, login, Date.now());
        return json(res, 200, { ok: true });
      }
      // Снять со-наставника группы — только владелец.
      if (gm[3] && req.method === 'DELETE') {
        if (!isOwner) return json(res, 403, { error: 'только владелец' });
        removeGroupMentor.run(id, gm[3].toLowerCase());
        return json(res, 200, { ok: true });
      }
    }

    // Модерация рейтинга: наставник удаляет подозрительный результат ученика.
    const rm = path.match(/^\/mentor\/results\/(\d+)\/([A-Za-z0-9_-]+)$/);
    if (rm && req.method === 'DELETE') {
      const guard = mentorGuard();
      if (guard.err) return json(res, guard.err[0], { error: guard.err[1] });
      deleteResult.run(Number(rm[1]), rm[2]);
      return json(res, 200, { ok: true });
    }

    // --- Каталог сообщества с модерацией ---
    // Публичная выдача одобренного (каталог ложит поверх статичного community.json).
    if (path === '/community' && req.method === 'GET') {
      const items = approvedCommunity.all().map((r) => ({
        id: `srv-${r.id}`,
        type: r.type,
        title: r.title,
        author: r.author_login,
        chapterId: r.chapter_id || undefined,
        data: safeParse(r.data),
        addedAt: new Date(r.created_at).toISOString().slice(0, 10),
      }));
      return json(res, 200, { items });
    }

    // Ученик присылает материал на модерацию.
    if (path === '/community' && req.method === 'POST') {
      const s = bearer(req);
      if (!s) return json(res, 401, { error: 'unauthorized' });
      const u = getUser.get(s.id);
      if (!u) return json(res, 401, { error: 'unauthorized' });
      if (pendingCountForUser.get(s.id).n >= 20) {
        return json(res, 429, { error: 'слишком много материалов на модерации, дождись проверки' });
      }
      let body;
      try {
        body = JSON.parse(await readBody(req, 20_000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const type = String(body.type || '');
      const title = String(body.title || '').trim().slice(0, 200);
      const chapterId = String(body.chapterId || '').trim().slice(0, 64);
      if (!COMMUNITY_TYPES.has(type) || !title) return json(res, 400, { error: 'нужны тип и название' });
      // url-типы принимают только https-ссылку; пресет — объект. Чужой код не
      // исполняется: фронт рендерит только данные для своих движков и https.
      let data = body.data;
      if (type === 'preset') {
        // Правила набора общие с сайтом (./preset.mjs). Раньше здесь стояло
        // «объект и не массив», и одобренная запись могла не пройти кодек на
        // клиенте — материал молча пропадал уже после проверки модератором.
        const ok = normalizePreset(data);
        if (!ok) return json(res, 400, { error: 'набор не по правилам: проверь название, движок и размер' });
        data = ok;
      } else {
        if (typeof data !== 'string' || !/^https:\/\//.test(data) || data.length > 500) {
          return json(res, 400, { error: 'нужна https-ссылка' });
        }
      }
      // Мёртвая ссылка не доходит до очереди: отказ виден отправителю сразу,
      // а модератору не приходится ходить по чужим ссылкам руками.
      let checkedTitle = title;
      if (type !== 'preset') {
        const check = await checkLink(data);
        if (!check.ok) return json(res, 400, { error: check.reason });
        if (check.title && !body.title) checkedTitle = String(check.title).slice(0, 200);
      }

      insertCommunity.run({
        type,
        chapter_id: chapterId || null,
        title: checkedTitle,
        data: JSON.stringify(data),
        author_gh_id: s.id,
        author_login: u.login,
        created_at: Date.now(),
      });
      return json(res, 200, { ok: true });
    }

    // Очередь модерации (наставник).
    if (path === '/mentor/community' && req.method === 'GET') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      const status = url.searchParams.get('status') || 'pending';
      // summary — чтобы модератор не одобрял набор вслепую: очередь рисовала
      // только тип, заголовок и ссылку, а у набора data — объект, и в
      // карточке не было видно ни движка, ни единой карточки.
      const items = communityByStatus.all(status).map((r) => {
        const data = safeParse(r.data);
        const preset = r.type === 'preset' ? normalizePreset(data) : null;
        return {
          id: r.id,
          type: r.type,
          title: r.title,
          author: r.author_login,
          chapterId: r.chapter_id || undefined,
          data,
          summary: preset ? presetSummary(preset) : undefined,
          status: r.status,
          addedAt: new Date(r.created_at).toISOString().slice(0, 10),
        };
      });
      return json(res, 200, { items });
    }

    // Одобрить/отклонить материал (наставник).
    const cm = path.match(/^\/mentor\/community\/(\d+)$/);
    if (cm && req.method === 'POST') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 1000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const action = body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : null;
      if (!action) return json(res, 400, { error: 'action: approve|reject' });
      setCommunityStatus.run(action, g.u.login, Date.now(), Number(cm[1]));
      return json(res, 200, { ok: true, status: action });
    }

    // --- Уведомления наставнику ---
    if (path === '/mentor/notifications' && req.method === 'GET') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      const login = String(g.u.login).toLowerCase();
      const since = getSeen.get(login)?.last_seen ?? 0;
      const pending = pendingCount.get().n;
      const newMembers = newMembersCount.get({ since, gh_id: g.u.gh_id, login }).n;
      return json(res, 200, { pendingMaterials: pending, newMembers, since });
    }
    if (path === '/mentor/notifications/seen' && req.method === 'POST') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      setSeen.run(String(g.u.login).toLowerCase(), Date.now());
      return json(res, 200, { ok: true });
    }

    // --- Со-наставники ---
    if (path === '/mentor/mentors' && req.method === 'GET') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      const roots = MENTORS.map((login) => ({ login, root: true }));
      const added = allMentorRows.all().map((r) => ({ login: r.login, root: false, addedBy: r.added_by }));
      return json(res, 200, { mentors: [...roots, ...added] });
    }

    if (path === '/mentor/mentors' && req.method === 'POST') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 1000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const login = String(body.login || '').trim().toLowerCase().replace(/^@/, '');
      if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) return json(res, 400, { error: 'нужен GitHub-логин' });
      if (MENTORS.includes(login)) return json(res, 200, { ok: true, already: true });
      addMentor.run(login, g.u.login, Date.now());
      return json(res, 200, { ok: true });
    }

    const mmDel = path.match(/^\/mentor\/mentors\/([A-Za-z\d-]+)$/);
    if (mmDel && req.method === 'DELETE') {
      const g = mentorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      // Корневых (env) снимать нельзя — только через настройку сервера.
      if (!isRootMentor(g.u)) return json(res, 403, { error: 'снять со-наставника может только главный наставник' });
      const login = mmDel[1].toLowerCase();
      if (MENTORS.includes(login)) return json(res, 400, { error: 'корневого наставника нельзя снять здесь' });
      removeMentorRow.run(login);
      return json(res, 200, { ok: true });
    }

    const mentorGuardTop = () => {
      const sess = bearer(req);
      if (!sess) return { err: [401, 'unauthorized'] };
      const u = getUser.get(sess.id);
      if (!isMentor(u)) return { err: [403, 'forbidden'] };
      return { u };
    };

    // ─── роль «автор»: кто может править страницы ────────────────────────
    const authorGuard = () => {
      const sess = bearer(req);
      if (!sess) return { err: [401, 'unauthorized'] };
      const u = getUser.get(sess.id);
      if (!isAuthor(u)) return { err: [403, 'нужна роль автора'] };
      if (!CONTENT_TOKEN) return { err: [503, 'на сервере не настроен CONTENT_TOKEN'] };
      return { u };
    };

    // Что умеет редактор: есть ли доступ, какие треки, какие страницы.
    if (path === '/content/meta' && req.method === 'GET') {
      const sess = bearer(req);
      const u = sess ? getUser.get(sess.id) : null;
      const can = isAuthor(u);
      if (!can) return json(res, 200, { canEdit: false, configured: !!CONTENT_TOKEN });
      const tree = await gh(`git/trees/${CONTENT_BRANCH}?recursive=1`);
      if (!tree.ok) return json(res, 502, { error: 'github: ' + tree.status });
      const files = (tree.data.tree || [])
        .filter((n) => n.type === 'blob' && safeDocPath(n.path))
        .map((n) => n.path)
        .sort();
      return json(res, 200, { canEdit: true, configured: !!CONTENT_TOKEN, repo: CONTENT_REPO, branch: CONTENT_BRANCH, files });
    }

    // Чтение исходника страницы.
    if (path === '/content/file' && req.method === 'GET') {
      const g = authorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      const file = url.searchParams.get('path') || '';
      if (!safeDocPath(file)) return json(res, 400, { error: 'править можно только docs/<трек>/файл.mdx' });
      const r = await gh(`contents/${encodeURI(file)}?ref=${CONTENT_BRANCH}`);
      if (r.status === 404) return json(res, 404, { error: 'нет такого файла' });
      if (!r.ok) return json(res, 502, { error: 'github: ' + r.status });
      return json(res, 200, { path: file, sha: r.data.sha, text: b64decode(r.data.content) });
    }

    // Сохранение: создаёт файл или обновляет существующий одним коммитом.
    // sha обязателен при правке — это защита от «двое правили одну страницу»:
    // если файл успели изменить, GitHub ответит 409 и мы честно об этом скажем.
    if (path === '/content/file' && req.method === 'PUT') {
      const g = authorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 400_000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const file = String(body.path || '');
      if (!safeDocPath(file)) return json(res, 400, { error: 'править можно только docs/<трек>/файл.mdx' });
      const text = String(body.text ?? '');
      if (!text.trim()) return json(res, 400, { error: 'пустая страница' });
      if (text.length > 300_000) return json(res, 400, { error: 'страница слишком большая' });
      const message = String(body.message || '').trim() ||
        `Страница ${file.split('/').pop()}: правка через кабинет`;
      const payload = {
        message,
        content: b64encode(text),
        branch: CONTENT_BRANCH,
        ...(body.sha ? { sha: String(body.sha) } : {}),
      };
      const r = await gh(`contents/${encodeURI(file)}`, { method: 'PUT', body: payload });
      if (r.status === 409 || r.status === 422)
        return json(res, 409, { error: 'страницу успели изменить — откройте её заново' });
      // 403 почти всегда означает права ключа, а не содержимое страницы. Но
      // «почти» — поэтому ответ GitHub показываем дословно, а подсказку добавляем
      // рядом: иначе при другой причине сообщение уверенно соврёт.
      if (r.status === 403)
        return json(res, 502, {
          error: 'GitHub не разрешил запись',
          detail:
            (r.data?.message ? r.data.message + '. ' : '') +
            'Обычно это значит, что ключу доступа не выдано право Contents: Read and write — ' +
            'чинится в настройках ключа на GitHub, страница тут ни при чём',
        });
      if (!r.ok) return json(res, 502, { error: 'github: ' + r.status, detail: r.data?.message });
      return json(res, 200, { ok: true, sha: r.data.content?.sha, commit: r.data.commit?.html_url });
    }

    // Управление ролью автора — только наставник.
    const moderatorGuard = () => {
      const s2 = bearer(req);
      if (!s2) return { err: [401, 'unauthorized'] };
      const u = getUser.get(s2.id);
      if (!isModerator(u)) return { err: [403, 'нужна роль модератора'] };
      return { u };
    };

    // Выдача роли — раньше проверки очереди: '/moderate/people' не должен
    // попасть под регулярку '/moderate/:id'.
    if (path === '/moderate/people' && req.method === 'GET') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      return json(res, 200, {
        moderators: allModeratorRows.all().map((r) => ({ login: r.login, addedBy: r.added_by })),
      });
    }

    if (path === '/moderate/people' && req.method === 'POST') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 1000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const login = String(body.login || '').trim().toLowerCase().replace(/^@/, '');
      if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) {
        return json(res, 400, { error: 'нужен GitHub-логин' });
      }
      addModeratorRow.run(login, gm.u.login, Date.now());
      return json(res, 200, { ok: true });
    }

    const modPeopleDel = path.match(/^\/moderate\/people\/([A-Za-z\d-]+)$/);
    if (modPeopleDel && req.method === 'DELETE') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      removeModeratorRow.run(modPeopleDel[1].toLowerCase());
      return json(res, 200, { ok: true });
    }

    if (path === '/moderate/queue' && req.method === 'GET') {
      const g = moderatorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      const items = communityByStatus.all('pending').map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        author: r.author_login,
        chapterId: r.chapter_id || undefined,
        data: safeParse(r.data),
        status: r.status,
        addedAt: new Date(r.created_at).toISOString().slice(0, 10),
      }));
      return json(res, 200, { items });
    }

    const modDecide = path.match(/^\/moderate\/(\d+)$/);
    if (modDecide && req.method === 'POST') {
      const g = moderatorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 1000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const action = body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : null;
      if (!action) return json(res, 400, { error: 'action: approve|reject' });
      setCommunityStatus.run(action, g.u.login, Date.now(), Number(modDecide[1]));
      return json(res, 200, { ok: true, status: action });
    }

    // Кураторские видео главы. Путь ЗАХАРДКОЖЕН и в теле запроса не принимается:
    // иначе этой же ручкой можно было бы переписать любой файл репозитория,
    // включая workflow деплоя. SAFE_DOC_PATH тут ни при чём и не расширяется.
    if (path === '/content/videos' && req.method === 'PUT') {
      const g = authorGuard();
      if (g.err) return json(res, g.err[0], { error: g.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 20_000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const chapterId = String(body.chapterId || '').trim();
      const videos = Array.isArray(body.videos) ? body.videos : null;
      if (!chapterId || !videos) return json(res, 400, { error: 'нужны глава и список роликов' });
      if (videos.length < 4 || videos.length > 5) {
        return json(res, 400, { error: 'роликов должно быть от четырёх до пяти' });
      }

      // Название и канал берём из ответа oEmbed той же проверки: заполнять их
      // руками незачем, а на клиенте это был бы лишний внешний запрос на каждую
      // добавленную ссылку.
      const checked = [];
      for (const v of videos) {
        if (!v || !VIDEO_ID.test(String(v.videoId || ''))) {
          return json(res, 400, { error: 'у ролика неверный идентификатор' });
        }
        const check = await checkLink(`https://www.youtube.com/watch?v=${v.videoId}`);
        if (!check.ok) return json(res, 400, { error: `ролик ${v.videoId}: ${check.reason}` });
        checked.push({
          videoId: String(v.videoId),
          title: String(v.title || check.title || '').slice(0, 200),
          channel: String(v.channel || check.channel || '').slice(0, 120),
        });
      }

      const cur = await gh(`contents/${VIDEOS_PATH}`);
      if (!cur.ok) return json(res, 502, { error: 'не удалось прочитать файл видео' });
      const all = JSON.parse(b64decode(cur.data.content));
      all[chapterId] = checked;

      const put = await gh(`contents/${VIDEOS_PATH}`, {
        method: 'PUT',
        body: {
          message: `Видео главы ${chapterId}: правка через кабинет`,
          content: b64encode(JSON.stringify(all, null, 2) + '\n'),
          branch: CONTENT_BRANCH,
          sha: cur.data.sha,
        },
      });
      if (put.status === 409 || put.status === 422) {
        return json(res, 409, { error: 'файл успели изменить — откройте главу заново' });
      }
      if (!put.ok) {
        return json(res, 502, {
          error: 'GitHub не разрешил запись',
          detail:
            (put.data?.message ? put.data.message + '. ' : '') +
            'Обычно это значит, что ключу доступа не выдано право Contents: Read and write',
        });
      }
      return json(res, 200, { ok: true });
    }

    if (path === '/content/authors' && req.method === 'GET') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      const roots = CONTENT_AUTHORS.map((login) => ({ login, root: true }));
      const added = allAuthorRows.all().map((r) => ({ login: r.login, root: false, addedBy: r.added_by }));
      return json(res, 200, { authors: [...roots, ...added] });
    }

    if (path === '/content/authors' && req.method === 'POST') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      let body;
      try {
        body = JSON.parse(await readBody(req, 1000));
      } catch {
        return json(res, 400, { error: 'bad json' });
      }
      const login = String(body.login || '').trim().toLowerCase().replace(/^@/, '');
      if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) return json(res, 400, { error: 'нужен GitHub-логин' });
      if (CONTENT_AUTHORS.includes(login)) return json(res, 200, { ok: true, already: true });
      addAuthor.run(login, gm.u.login, Date.now());
      return json(res, 200, { ok: true });
    }

    const authDel = path.match(/^\/content\/authors\/([A-Za-z\d-]+)$/);
    if (authDel && req.method === 'DELETE') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      const login = authDel[1].toLowerCase();
      if (CONTENT_AUTHORS.includes(login)) return json(res, 400, { error: 'автора из .env здесь снять нельзя' });
      removeAuthorRow.run(login);
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: 'not found' });
  } catch (e) {
    console.error(path, e.message);
    return json(res, 500, { error: 'server error' });
  }
});

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

server.listen(PORT, '0.0.0.0', () => console.log(`account api on ${PORT}, dev=${DEV_LOGIN}`));
