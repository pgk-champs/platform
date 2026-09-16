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

/**
 * Живая ли ссылка. У YouTube спрашиваем oEmbed — он же отдаёт настоящее
 * название и канал, если автор поленился их вписать.
 */
export async function checkLink(url, fetchImpl = fetch) {
  const href = String(url || '');
  if (!/^https:\/\//.test(href)) return { ok: false, reason: 'нужна https-ссылка' };

  const vid = youTubeId(href);
  const target = vid
    ? `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${vid}`
    : href;

  try {
    const r = await fetchImpl(target, {
      redirect: 'follow',
      signal: AbortSignal.timeout ? AbortSignal.timeout(TIMEOUT_MS) : undefined,
    });
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
