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
type Profile = { id: number; login: string; name: string; avatar: string };

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

/** Доступен ли сервер кабинета. Пока edu.alspio.com не поднят, отвечает false,
 *  и страница показывает «скоро», а не сломанную кнопку входа. */
export async function apiAvailable(): Promise<boolean> {
  try {
    const r = await fetch(`${apiBase()}/health`, { signal: AbortSignal.timeout?.(4000) });
    return r.ok;
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
