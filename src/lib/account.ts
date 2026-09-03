import { store } from './store';

// Личный кабинет: вход через GitHub и синхронизация прогресса с сервером.
// Офлайн-ферст: учебник работает и без входа (прогресс в localStorage), а после
// входа локальное сливается с аккаунтом на сервере и синхронизируется между
// устройствами. Слияние делает сервер — клиент отправляет своё и принимает
// «не хуже» в ответ.

// База API. На своём домене — тот же origin (/api). На другом (например, старом
// адресе Pages в переходный период) ходим на явный адрес сервера.
const EXPLICIT_API = 'https://edu.alspio.com/api';
function apiBase(): string {
  if (typeof window === 'undefined') return EXPLICIT_API;
  const h = window.location.hostname;
  if (h === 'edu.alspio.com' || h === 'localhost' || h === '127.0.0.1') return '/api';
  return EXPLICIT_API;
}

const TOKEN_KEY = 'pgk-account-token';
export type Profile = { id: number; login: string; name: string; avatar: string; mentor?: boolean; root?: boolean };

export type MentorStudent = {
  gh_id: number;
  login: string;
  name: string;
  avatar: string;
  xp: number;
  chaptersStarted: number;
  sectionsRead: number;
  quizzesDone: number;
  trainersDone: number;
  examsDone: number;
  achievements: number;
  coverage: Record<string, number>;
  updatedAt: number;
  bestScore: number | null;
};

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function setToken(t: string | null): void {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // приватный режим — вход просто не запомнится, не критично
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Готов ли кабинет к входу: сервер поднят И GitHub-приложение подключено.
 *  Пока нет — страница показывает «скоро», а не кнопку, ведущую к ошибке. */
export async function apiAvailable(): Promise<boolean> {
  try {
    const r = await fetch(`${apiBase()}/health`, { signal: AbortSignal.timeout?.(4000) });
    if (!r.ok) return false;
    const data = await r.json();
    return !!data.oauth;
  } catch {
    return false;
  }
}

/** Начать вход: уводим на сервер, он — на GitHub и обратно с токеном в #. */
export function login(): void {
  const ret = window.location.href.split('#')[0];
  window.location.href = `${apiBase()}/auth/login?return=${encodeURIComponent(ret)}`;
}

export function logout(): void {
  setToken(null);
  notify();
}

/** Считать токен из #pgk_token=... после возврата с сервера и убрать из URL. */
export function captureTokenFromUrl(): boolean {
  if (typeof window === 'undefined' || !window.location.hash) return false;
  const m = /[#&]pgk_token=([^&]+)/.exec(window.location.hash);
  if (!m) return false;
  setToken(decodeURIComponent(m[1]));
  // чистим адресную строку, чтобы токен не остался в истории/закладке
  const clean = window.location.href.replace(/([#&])pgk_token=[^&]+/, '$1').replace(/[#&]$/, '');
  window.history.replaceState(null, '', clean);
  return true;
}

async function api(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  return fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function fetchProfile(): Promise<Profile | null> {
  if (!getToken()) return null;
  try {
    const r = await api('/me');
    if (r.status === 401) {
      setToken(null);
      notify();
      return null;
    }
    if (!r.ok) return null;
    return (await r.json()) as Profile;
  } catch {
    return null;
  }
}

let syncing = false;
export function isSyncing(): boolean {
  return syncing;
}

/**
 * Синхронизация: отправляем локальный прогресс, сервер сливает его с аккаунтом
 * и возвращает объединённый — принимаем его как новое локальное состояние.
 * Возвращает true при успехе.
 */
export async function sync(): Promise<boolean> {
  if (!getToken() || syncing) return false;
  syncing = true;
  notify();
  try {
    const r = await api('/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store.snapshot()),
    });
    if (r.status === 401) {
      setToken(null);
      return false;
    }
    if (!r.ok) return false;
    const data = await r.json();
    if (data && data.progress) store.importState(data.progress);
    return true;
  } catch {
    return false;
  } finally {
    syncing = false;
    notify();
  }
}

// --- Рейтинг ---
export type BoardRow = {
  gh_id: number;
  login: string;
  name: string;
  avatar: string;
  score: number;
  max_score: number;
  duration_sec: number;
  modules?: number;
  place: number;
  me: boolean;
};
export type Board = {
  module: string;
  modules: { module: string; title: string; players: number }[];
  rows: BoardRow[];
};
export type MyPlaces = {
  modules: { module: string; title: string; score: number; max_score: number; duration_sec: number; place: number; players: number }[];
  overall: { place: number; players: number } | null;
};

/** Отправить результат симулятора в рейтинг от имени вошедшего ученика.
 *  Возвращает true при успехе; молча false, если не вошёл или сеть недоступна. */
export async function submitResult(r: {
  module: string;
  title: string;
  score: number;
  maxScore: number;
  durationSec: number;
}): Promise<boolean> {
  if (!getToken()) return false;
  try {
    const res = await api('/leaderboard', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchBoard(module = 'overall'): Promise<Board | null> {
  try {
    const r = await api(`/leaderboard?module=${encodeURIComponent(module)}`);
    return r.ok ? ((await r.json()) as Board) : null;
  } catch {
    return null;
  }
}

export async function fetchMentorStudents(groupId?: number): Promise<MentorStudent[] | null> {
  if (!getToken()) return null;
  try {
    const q = groupId ? `?group=${groupId}` : '';
    const r = await api(`/mentor/students${q}`);
    if (!r.ok) return null;
    const data = await r.json();
    return (data.students as MentorStudent[]) ?? [];
  } catch {
    return null;
  }
}

// Детальная карточка ученика для наставника.
export type StudentDetail = {
  student: { gh_id: number; login: string; name: string; avatar: string; xp: number; updatedAt: number };
  chapters: {
    chapterId: string;
    sections: number;
    quizzes: { id: string; correct: number; total: number }[];
    exam: { correct: number; total: number } | null;
    trainers: number;
  }[];
  results: { module: string; title: string; score: number; max_score: number; duration_sec: number }[];
  achievements: string[];
  groups: { id: number; name: string }[];
};

export async function fetchStudentDetail(ghId: number): Promise<StudentDetail | null> {
  try {
    const r = await api(`/mentor/students/${ghId}`);
    return r.ok ? ((await r.json()) as StudentDetail) : null;
  } catch {
    return null;
  }
}

// --- Группы (потоки/классы) ---
export type MentorGroup = { id: number; name: string; code: string; members: number };

export async function listGroups(): Promise<MentorGroup[]> {
  try {
    const r = await api('/mentor/groups');
    if (!r.ok) return [];
    return ((await r.json()).groups as MentorGroup[]) ?? [];
  } catch {
    return [];
  }
}

export async function createGroup(name: string): Promise<MentorGroup | null> {
  try {
    const r = await api('/mentor/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return r.ok ? ((await r.json()) as MentorGroup) : null;
  } catch {
    return null;
  }
}

export async function deleteGroup(id: number): Promise<boolean> {
  try {
    return (await api(`/mentor/groups/${id}`, { method: 'DELETE' })).ok;
  } catch {
    return false;
  }
}

export async function removeStudent(groupId: number, ghId: number): Promise<boolean> {
  try {
    return (
      await api(`/mentor/groups/${groupId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gh_id: ghId }),
      })
    ).ok;
  } catch {
    return false;
  }
}

/** Модерация: удалить подозрительный результат ученика из рейтинга. */
export async function deleteResult(ghId: number, module: string): Promise<boolean> {
  try {
    return (await api(`/mentor/results/${ghId}/${encodeURIComponent(module)}`, { method: 'DELETE' })).ok;
  } catch {
    return false;
  }
}

// --- Каталог сообщества с модерацией ---
export type CommunitySubmission = { type: string; title: string; chapterId?: string; data: unknown };
export type PendingItem = {
  id: number;
  type: string;
  title: string;
  author: string;
  chapterId?: string;
  data: unknown;
  status: string;
  addedAt: string;
};

/** Одобренные материалы с сервера (ложатся в каталог поверх статичных). */
export async function fetchApprovedCommunity(): Promise<unknown[]> {
  try {
    const r = await api('/community');
    if (!r.ok) return [];
    return ((await r.json()).items as unknown[]) ?? [];
  } catch {
    return [];
  }
}

/** Ученик присылает материал на модерацию. */
export async function submitCommunity(item: CommunitySubmission): Promise<{ ok: boolean; error?: string }> {
  if (!getToken()) return { ok: false, error: 'нужен вход' };
  try {
    const r = await api('/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (r.ok) return { ok: true };
    const d = await r.json().catch(() => ({}));
    return { ok: false, error: (d as { error?: string }).error || 'не отправилось' };
  } catch {
    return { ok: false, error: 'сеть недоступна' };
  }
}

export async function fetchPendingCommunity(status = 'pending'): Promise<PendingItem[]> {
  try {
    const r = await api(`/mentor/community?status=${status}`);
    if (!r.ok) return [];
    return ((await r.json()).items as PendingItem[]) ?? [];
  } catch {
    return [];
  }
}

export async function reviewCommunity(id: number, action: 'approve' | 'reject'): Promise<boolean> {
  try {
    return (
      await api(`/mentor/community/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    ).ok;
  } catch {
    return false;
  }
}

// --- Со-наставники ---
export type MentorEntry = { login: string; root: boolean; addedBy?: string };

export async function listMentors(): Promise<MentorEntry[]> {
  try {
    const r = await api('/mentor/mentors');
    if (!r.ok) return [];
    return ((await r.json()).mentors as MentorEntry[]) ?? [];
  } catch {
    return [];
  }
}

export async function addMentor(login: string): Promise<boolean> {
  try {
    return (
      await api('/mentor/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login }),
      })
    ).ok;
  } catch {
    return false;
  }
}

export async function removeMentor(login: string): Promise<boolean> {
  try {
    return (await api(`/mentor/mentors/${encodeURIComponent(login)}`, { method: 'DELETE' })).ok;
  } catch {
    return false;
  }
}

/** Ученик присоединяется к группе по коду. Возвращает имя группы или null. */
export async function joinGroup(code: string): Promise<{ id: number; name: string } | null> {
  if (!getToken()) return null;
  try {
    const r = await api('/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!r.ok) return null;
    return (await r.json()).group ?? null;
  } catch {
    return null;
  }
}

export async function fetchMyPlaces(): Promise<MyPlaces | null> {
  if (!getToken()) return null;
  try {
    const r = await api('/leaderboard/me');
    return r.ok ? ((await r.json()) as MyPlaces) : null;
  } catch {
    return null;
  }
}

// --- подписка на изменения состояния кабинета (для кнопки в шапке и страницы) ---
const bus = typeof EventTarget !== 'undefined' ? new EventTarget() : null;
function notify() {
  bus?.dispatchEvent(new Event('change'));
}
export function subscribe(cb: () => void): () => void {
  if (!bus) return () => {};
  bus.addEventListener('change', cb);
  return () => bus.removeEventListener('change', cb);
}

// Автосинхронизация: после любого изменения прогресса, но не чаще раза в 5 секунд,
// отправляем состояние на сервер. Так закрытая вкладка не теряет последние действия.
let timer: ReturnType<typeof setTimeout> | null = null;
export function startAutoSync(): void {
  if (typeof window === 'undefined') return;
  store.subscribe(() => {
    if (!isLoggedIn() || timer) return;
    timer = setTimeout(() => {
      timer = null;
      void sync();
    }, 5000);
  });
  // На выходе со страницы — последняя попытка отправить (best-effort).
  window.addEventListener('pagehide', () => {
    if (isLoggedIn()) void sync();
  });
}
