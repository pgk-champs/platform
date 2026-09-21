// Проверка ссылки на отправке. Мёртвое не должно попадать в очередь модератора:
// человек узнаёт об отказе сразу, а модератору не приходится ходить по ссылкам.
//
// fetchImpl параметром — чтобы модуль проверялся тестами без сети.

const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#]|$)/;

/** id ролика из ссылки YouTube; для всего остального — null. */
export function youTubeId(url) {
  const m = YT.exec(String(url));
  return m ? m[1] : null;
}

const TIMEOUT_MS = 5000;
const MAX_HOPS = 3;

// Адреса, куда серверу ходить нельзя. Проверка ссылки идёт ОТ ИМЕНИ хоста, а
// не браузера студента: без этого фильтра форма «поделиться материалом» —
// готовый зонд во внутреннюю сеть (и в облачную метаданную 169.254.169.254).
// Проверяем и то, что вернул DNS: имя в интернете может указывать на 127.0.0.1.
const PRIVATE_V4 =
  /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;

function isPrivateAddress(addr) {
  const a = String(addr || '').toLowerCase();
  if (!a) return true;
  if (PRIVATE_V4.test(a)) return true;
  if (a === '::1' || a === '::' || a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe80')) return true;
  // ::ffff:127.0.0.1 и прочие v4-в-v6
  const v4 = /::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(a);
  return v4 ? PRIVATE_V4.test(v4[1]) : false;
}

/** Куда ведёт имя. Разрешать нужно ИМЕННО перед запросом, иначе фильтр обманут. */
async function publicHost(href, lookupImpl) {
  let u;
  try {
    u = new URL(href);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:') return false;
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) return false;
  if (/^[\d.]+$/.test(host) || host.includes(':')) return !isPrivateAddress(host);
  try {
    const all = await lookupImpl(host, { all: true });
    return all.length > 0 && all.every((r) => !isPrivateAddress(r.address));
  } catch {
    return false;
  }
}

/**
 * Живая ли ссылка. У YouTube спрашиваем oEmbed — он же отдаёт настоящее
 * название и канал, если автор поленился их вписать.
 */
export async function checkLink(url, fetchImpl = fetch, lookupImpl) {
  const href = String(url || '');
  if (!/^https:\/\//.test(href)) return { ok: false, reason: 'нужна https-ссылка' };

  const lookup = lookupImpl ?? (await import('node:dns')).promises.lookup;

  const vid = youTubeId(href);
  let target = vid
    ? `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${vid}`
    : href;

  try {
    // Редиректы разматываем САМИ: 'follow' проверил бы только первый адрес, а
    // увести во внутреннюю сеть можно вторым.
    let r;
    for (let hop = 0; ; hop += 1) {
      if (!(await publicHost(target, lookup))) return { ok: false, reason: 'такой адрес проверить нельзя' };
      r = await fetchImpl(target, {
        redirect: 'manual',
        signal: AbortSignal.timeout ? AbortSignal.timeout(TIMEOUT_MS) : undefined,
      });
      const next = r.status >= 300 && r.status < 400 ? r.headers?.get?.('location') : null;
      if (!next) break;
      if (hop >= MAX_HOPS) return { ok: false, reason: 'слишком много переадресаций' };
      target = new URL(next, target).toString();
    }
    if (!r.ok) {
      return vid
        ? { ok: false, reason: 'ролик удалён или приватный' }
        : { ok: false, reason: `страница не отвечает (${r.status})` };
    }
    if (!vid) return { ok: true };
    const data = await r.json();
    return { ok: true, title: data.title, channel: data.author_name };
  } catch {
    return { ok: false, reason: 'ссылка не открылась за пять секунд' };
  }
}
