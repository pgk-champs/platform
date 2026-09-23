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
export type Profile = {
  id: number;
  login: string;
  name: string;
  avatar: string;
  mentor?: boolean;
  root?: boolean;
  /** Группы, в которых состоит студент. Приходят вместе с профилем: иначе
   *  вступивший по коду видел подтверждение один раз и после перезагрузки
   *  терял всякий след — проверить, в той ли он группе, было негде. */
  groups?: { id: number; name: string }[];
};

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
    /** Id пройденных тренажёров. У зала ('gym') среди них наборы: preset:… */
    trainerIds?: string[];
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

// --- Уведомления наставнику ---
export type MentorNotifications = { pendingMaterials: number; newMembers: number; since: number };

export async function fetchNotifications(): Promise<MentorNotifications | null> {
  try {
    const r = await api('/mentor/notifications');
    return r.ok ? ((await r.json()) as MentorNotifications) : null;
  } catch {
    return null;
  }
}

export async function markNotificationsSeen(): Promise<void> {
  try {
    await api('/mentor/notifications/seen', { method: 'POST' });
  } catch {
    // не критично
  }
}

// --- Группы (потоки/классы) ---
export type MentorGroup = {
  id: number;
  name: string;
  code: string;
  members: number;
  owner?: boolean;
  comentors?: string[];
};

export async function addGroupComentor(groupId: number, login: string): Promise<boolean> {
  try {
    return (
      await api(`/mentor/groups/${groupId}/comentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login }),
      })
    ).ok;
  } catch {
    return false;
  }
}

export async function removeGroupComentor(groupId: number, login: string): Promise<boolean> {
  try {
    return (await api(`/mentor/groups/${groupId}/comentor/${encodeURIComponent(login)}`, { method: 'DELETE' })).ok;
  } catch {
    return false;
  }
}

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

/**
 * Добавляет в группу ВСЕХ зарегистрированных на платформе. Доступно только
 * владельцу платформы (сервер проверяет это отдельно от владения группой) —
 * иначе любой наставник мог бы затащить к себе чужих студентов.
 */
export async function addAllToGroup(id: number): Promise<number | null> {
  try {
    const r = await api(`/mentor/groups/${id}/add-all`, { method: 'POST' });
    if (!r.ok) return null;
    return ((await r.json()).added as number) ?? 0;
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
  /** Короткая подпись набора («карточки: 12») — сервер считает её сам. */
  summary?: string;
  status: string;
  addedAt: string;
};

/** Одобренные материалы с сервера (ложатся в каталог поверх статичных). */
/** Одобренные материалы. `null` — сервер не ответил: это НЕ то же самое, что
 *  пустой каталог, и говорить «стань первым» при упавшем сервере нельзя. */
export async function fetchApprovedCommunity(): Promise<unknown[] | null> {
  try {
    const r = await api('/community');
    if (!r.ok) return null;
    return ((await r.json()).items as unknown[]) ?? [];
  } catch {
    return null;
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

// ─── правка страниц: роль автора и работа с файлами глав ──────────────────

export type ContentMeta = {
  canEdit: boolean;
  configured: boolean;
  repo?: string;
  branch?: string;
  files?: string[];
};

export type ContentFile = { path: string; sha: string; text: string };
export type AuthorEntry = { login: string; root: boolean; addedBy?: string };

/** Может ли текущий пользователь править страницы и какие они есть. */
export async function fetchContentMeta(): Promise<ContentMeta> {
  try {
    const r = await api('/content/meta');
    if (!r.ok) return { canEdit: false, configured: false };
    return (await r.json()) as ContentMeta;
  } catch {
    return { canEdit: false, configured: false };
  }
}

/** Исходник страницы вместе с sha — он нужен, чтобы сохранить поверх. */
export async function fetchContentFile(path: string): Promise<ContentFile | null> {
  const r = await api(`/content/file?path=${encodeURIComponent(path)}`);
  if (!r.ok) return null;
  return (await r.json()) as ContentFile;
}

/** Сохранить страницу одним коммитом. sha пустой — значит создаём новую. */
export async function saveContentFile(input: {
  path: string;
  text: string;
  sha?: string;
  message?: string;
}): Promise<{ ok: true; commit?: string; sha?: string } | { ok: false; error: string }> {
  try {
    const r = await api('/content/file', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const base = data.error || `ошибка ${r.status}`;
      return { ok: false, error: data.detail ? `${base} — ${data.detail}` : base };
    }
    return { ok: true, commit: data.commit, sha: data.sha };
  } catch (e) {
    return { ok: false, error: 'сеть недоступна' };
  }
}

export type ChapterVideo = { videoId: string; title: string; channel: string };

/** Сохранить кураторские видео главы. Название и канал сервер подставит сам. */
export async function saveChapterVideos(
  chapterId: string,
  videos: ChapterVideo[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const r = await api('/content/videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId, videos }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const base = data.error || `ошибка ${r.status}`;
      return { ok: false, error: data.detail ? `${base} — ${data.detail}` : base };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'сервер недоступен' };
  }
}

export type ModeratorEntry = { login: string; addedBy?: string };

export async function listModerators(): Promise<ModeratorEntry[]> {
  const r = await api('/moderate/people');
  if (!r.ok) return [];
  return ((await r.json()).moderators ?? []) as ModeratorEntry[];
}

export async function addModerator(login: string): Promise<boolean> {
  const r = await api('/moderate/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login }),
  });
  return r.ok;
}

export async function removeModerator(login: string): Promise<boolean> {
  return (await api(`/moderate/people/${encodeURIComponent(login)}`, { method: 'DELETE' })).ok;
}

/** Очередь непроверенных материалов. Пускает и наставника, и модератора. */
export async function fetchModerationQueue(): Promise<PendingItem[]> {
  const r = await api('/moderate/queue');
  if (!r.ok) return [];
  return ((await r.json()).items ?? []) as PendingItem[];
}

export async function decideMaterial(id: number, action: 'approve' | 'reject'): Promise<boolean> {
  const r = await api(`/moderate/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return r.ok;
}

export async function listAuthors(): Promise<AuthorEntry[]> {
  const r = await api('/content/authors');
  if (!r.ok) return [];
  return ((await r.json()).authors ?? []) as AuthorEntry[];
}

export async function addAuthor(login: string): Promise<boolean> {
  const r = await api('/content/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login }),
  });
  return r.ok;
}

export async function removeAuthor(login: string): Promise<boolean> {
  const r = await api(`/content/authors/${encodeURIComponent(login)}`, { method: 'DELETE' });
  return r.ok;
}

// --- ключи для внешних сервисов ---
//
// Ключ — не сессия: он ищется в базе по хешу на каждом запросе, поэтому отзыв
// работает мгновенно, а права пересчитываются по живой роли владельца.

export type ApiKeyRow = {
  id: number;
  имя: string;
  подсказка: string;
  права: string[];
  действуют: string[];
  создан: number;
  последнийРаз: number | null;
  истекает: number | null;
  отозван: number | null;
};

export type ApiKeysView = {
  доступныеПрава: { право: string; что: string }[];
  все: { право: string; что: string; нужнаРоль: string | null }[];
  ключи: ApiKeyRow[];
};

export async function listApiKeys(): Promise<ApiKeysView | null> {
  // Сеть тоже может не ответить (нет входа, нет сервера, чужой origin) —
  // тогда окно ключей должно сказать об этом, а не висеть в «Загрузка…».
  try {
    const r = await api('/keys');
    if (!r.ok) return null;
    return (await r.json()) as ApiKeysView;
  } catch {
    return null;
  }
}

export async function createApiKey(
  name: string,
  scopes: string[],
  days: number,
): Promise<{ ok: boolean; ключ?: string; error?: string }> {
  try {
    const r = await api('/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, scopes, days }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: (d as { error?: string }).error || 'не вышло' };
    return { ok: true, ключ: (d as { ключ?: string }).ключ };
  } catch {
    return { ok: false, error: 'сервер недоступен' };
  }
}

export async function revokeApiKey(id: number): Promise<boolean> {
  try {
    return (await api(`/keys/${id}/revoke`, { method: 'POST' })).ok;
  } catch {
    return false;
  }
}

export type ApiLogRow = { ts: number; method: string; path: string; status: number; note: string | null };

export async function apiKeyLog(id: number): Promise<ApiLogRow[]> {
  try {
    const r = await api(`/keys/${id}/log`);
    if (!r.ok) return [];
    return ((await r.json()).записи ?? []) as ApiLogRow[];
  } catch {
    return [];
  }
}

// --- свои материалы в каталоге ---

export type MyMaterial = {
  id: number;
  type: string;
  title: string;
  chapterId?: string;
  status: 'pending' | 'approved' | 'rejected';
  addedAt: string;
};

/**
 * Что я прислал и чем это кончилось. Раньше автор отправлял материал и
 * больше ничего не узнавал: ни «принято», ни «отклонено» не показывалось.
 * Попутно оставляет след в store, чтобы достижения про вклад считались и
 * без сети — их проверки читают снимок, а не сервер.
 */
export async function fetchMyMaterials(): Promise<MyMaterial[]> {
  try {
    const r = await api('/community/mine');
    if (!r.ok) return [];
    const items = ((await r.json()).items ?? []) as MyMaterial[];
    store.noteCommunity([
      ...items.map((i) => `sub:${i.id}`),
      ...items.filter((i) => i.status === 'approved').map((i) => `ok:${i.id}`),
    ]);
    return items;
  } catch {
    return [];
  }
}
