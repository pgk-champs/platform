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
// Наставники (по GitHub-логину) видят дашборд группы. Список — в .env.
const MENTORS = (process.env.MENTORS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const isRootMentor = (u) => !!u && MENTORS.includes(String(u.login).toLowerCase());
// Наставник = корневой из env ИЛИ добавленный со-наставник из таблицы mentors.
const isMentor = (u) => isRootMentor(u) || (!!u && !!mentorRow.get(String(u.login).toLowerCase()));

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
const groupsByOwner = db.prepare(`SELECT g.*, (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS members
  FROM groups g WHERE g.owner = ? ORDER BY g.created_at DESC`);
const deleteGroup = db.prepare('DELETE FROM groups WHERE id = ? AND owner = ?');
const deleteGroupMembers = db.prepare('DELETE FROM group_members WHERE group_id = ?');
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

// Каталог сообщества с модерацией: ученик присылает материал (pending),
// наставник одобряет/отклоняет. Одобренные отдаются публично и ложатся в
// каталог поверх статичного community.json.
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
  FROM community WHERE status = 'approved' ORDER BY created_at DESC`);
const communityByStatus = db.prepare(`SELECT id, type, chapter_id, title, data, author_login, status, created_at
  FROM community WHERE status = ? ORDER BY created_at DESC LIMIT 500`);
const setCommunityStatus = db.prepare('UPDATE community SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?');
const pendingCountForUser = db.prepare("SELECT COUNT(*) AS n FROM community WHERE author_gh_id = ? AND status = 'pending'");

const COMMUNITY_TYPES = new Set(['preset', 'repo', 'link', 'video', 'source']);

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
      return json(res, 200, { id: u.gh_id, login: u.login, name: u.name, avatar: u.avatar, mentor: isMentor(u), root: isRootMentor(u) });
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
        if (!g || g.owner !== me.gh_id) return json(res, 403, { error: 'forbidden' });
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
           WHERE m.gh_id = ? AND g.owner = ?`,
        )
        .all(row.gh_id, me.gh_id);
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
      return json(res, 200, { groups: groupsByOwner.all(g.u.gh_id) });
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

    // /mentor/groups/<id>  и  /mentor/groups/<id>/remove
    const gm = path.match(/^\/mentor\/groups\/(\d+)(\/remove)?$/);
    if (gm) {
      const guard = mentorGuard();
      if (guard.err) return json(res, guard.err[0], { error: guard.err[1] });
      const id = Number(gm[1]);
      const g = groupById.get(id);
      if (!g || g.owner !== guard.u.gh_id) return json(res, 404, { error: 'not found' });

      if (!gm[2] && req.method === 'DELETE') {
        deleteGroupMembers.run(id);
        deleteGroup.run(id, guard.u.gh_id);
        return json(res, 200, { ok: true });
      }
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
        if (!data || typeof data !== 'object' || Array.isArray(data)) return json(res, 400, { error: 'пресет должен быть объектом' });
      } else {
        if (typeof data !== 'string' || !/^https:\/\//.test(data) || data.length > 500) {
          return json(res, 400, { error: 'нужна https-ссылка' });
        }
      }
      insertCommunity.run({
        type,
        chapter_id: chapterId || null,
        title,
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
      const items = communityByStatus.all(status).map((r) => ({
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
