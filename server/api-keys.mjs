// API-ключи для внешних сервисов. Чистая логика без базы — чтобы её можно
// было проверить тестами, а не только вживую.
//
// Почему отдельно от сессий: сессионный токен подписан и НЕ отзывается —
// verify() принимает его 180 дней, серверного хранилища сессий нет. Для
// ключа отзыв обязан работать мгновенно, поэтому ключ ищется в базе по хешу
// на каждом запросе. Хранить сам ключ нельзя: утечка базы = утечка всех
// ключей, а хеш SHA-256 от 32 случайных байт подобрать невозможно.

import crypto from 'node:crypto';
import { SCOPES, SCOPE_LIST } from './api-routes.mjs';

export const KEY_PREFIX = 'pgk_';

/** Новый ключ: показывается ОДИН раз, в базу уходит только хеш. */
export function newKey() {
  const secret = KEY_PREFIX + crypto.randomBytes(32).toString('base64url');
  return { secret, hash: hashKey(secret) };
}

export function hashKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest('hex');
}

export function looksLikeKey(token) {
  return typeof token === 'string' && token.startsWith(KEY_PREFIX);
}

/** Показываем в списке ключей: «pgk_…Xy7Q» — узнать свой, но не восстановить. */
export function keyHint(secret) {
  return `${KEY_PREFIX}…${String(secret).slice(-4)}`;
}

/** Отсев неизвестных имён прав: в базу попадают только известные. */
export function cleanScopes(list) {
  const want = Array.isArray(list) ? list : String(list || '').split(',');
  return [...new Set(want.map((s) => String(s).trim()).filter((s) => SCOPE_LIST.includes(s)))];
}

/**
 * Права, которые даёт роль владельца ПРЯМО СЕЙЧАС. Ключ не может больше
 * своего хозяина: снимут роль автора — content:write перестанет действовать
 * в ту же секунду, без перевыпуска и без похода в таблицу ключей.
 */
export function scopesAllowedFor({ mentor = false, author = false, moderator = false } = {}) {
  return SCOPE_LIST.filter((s) => {
    const нужна = SCOPES[s].нужнаРоль;
    if (!нужна) return true;
    if (нужна === 'author') return author;
    if (нужна === 'mentor') return mentor || moderator;
    return false;
  });
}

/** Эффективные права = выданные ∩ разрешённые ролью сейчас. */
export function effectiveScopes(stored, roles) {
  const allowed = new Set(scopesAllowedFor(roles));
  return cleanScopes(stored).filter((s) => allowed.has(s));
}

/** Живой ли ключ: не отозван и не просрочен. */
export function keyUsable(row, now) {
  if (!row) return false;
  if (row.revoked_at) return false;
  if (row.expires_at && row.expires_at <= now) return false;
  return true;
}

/**
 * Ограничение частоты в памяти процесса. База синхронная и однопоточная:
 * тысяча запросов в минуту от одного агента укладывает сервер целиком, а
 * ограничения частоты в проекте не было ни на одной ручке.
 */
export function makeLimiter({ perMinute = 60 } = {}) {
  const minute = new Map(); // keyId -> { at, n }
  const hour = new Map(); // `${keyId}:${pattern}` -> { at, n }
  return {
    /** @returns {null | { retryAfter: number, reason: string }} */
    check(keyId, route, now) {
      const m = Math.floor(now / 60000);
      const cur = minute.get(keyId);
      if (!cur || cur.at !== m) minute.set(keyId, { at: m, n: 1 });
      else if (cur.n >= perMinute) return { retryAfter: 60 - Math.floor((now % 60000) / 1000), reason: `не больше ${perMinute} запросов в минуту` };
      else cur.n += 1;

      if (route?.limit) {
        const h = Math.floor(now / 3600000);
        const k = `${keyId}:${route.pattern}`;
        const c = hour.get(k);
        if (!c || c.at !== h) hour.set(k, { at: h, n: 1 });
        else if (c.n >= route.limit)
          return { retryAfter: 3600 - Math.floor((now % 3600000) / 1000), reason: `${route.pattern}: не больше ${route.limit} запросов в час` };
        else c.n += 1;
      }
      return null;
    },
  };
}
