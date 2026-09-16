# Сообщество — план реализации

> **Для исполнителя:** задачи идут по порядку, каждая заканчивается коммитом.
> Спецификация: `specs/2026-09-16-soobshchestvo.md`.

**Цель:** один путь приёма материалов с автоматической проверкой ссылки, роль модератора
со своей очередью, витрина, где видно, что за материал, и подвал главы, который наконец
показывает одобренное.

**Устройство:** проверка ссылки — отдельный модуль сервера без HTTP-обвязки, поэтому
проверяется `node --test`. Витрина и подвал читают одну ручку `GET /community`.
Кураторские видео правит отдельная ручка с захардкоженным путём.

**Стек:** Node + better-sqlite3 (сервер), Docusaurus 3.10.2 + TypeScript (сайт),
vitest для компонентов, `node --test` для сервера.

## Общие ограничения

- **План и спека лежат в `specs/`, не в `docs/`** — `docs/` это сам сайт, kmap требует
  фронтматтер от каждого файла внутри и уронит сборку.
- **Коммит не упоминает Claude, AI и соавторство.** Сообщение по-русски, от лица Олега.
- **Перед каждым коммитом:** `git diff HEAD | grep -nEi "(-----BEGIN|api[_-]?key|secret|passw|ssh-rsa|AKIA|xox[baprs]-)"`.
- **Перед пушем — пять гейтов:** `npm run kmap`, `npm test`, `npm run typecheck`,
  `npx vitest run`, `npm run build`. Пуш в `main` = публикация на прод.
- **`npm test` гоняет `scripts/*.test.mjs` и `server/*.test.mjs`** — серверные тесты в гейте.
- **Тесты компонентов только `src/**/*.test.tsx`** — `.test.ts` не подхватится.
- **`SAFE_DOC_PATH` не трогать.** Тест `server/content-path.test.mjs` остаётся как есть.
- **`onBrokenLinks: 'throw'`** — снятая страница обязана уйти вместе со всеми ссылками на неё.
- **Обложки:** `aspect-ratio: 16/9`, осмысленный `alt`, `loading="lazy"`.
- **Глифы типов — SVG, не эмодзи.** Зазор между кликабельными ≥ 8px, высота чипа 36px.

## Отступление от спецификации

**Колонка `target_kind` НЕ добавляется.** В спеке она была, но при планировании выяснилось,
что она полностью выводится из `chapter_id`: `NULL` — материал общий, непусто — привязан к
документу. Третьего состояния нет и быть не может. Колонка была бы вторым источником правды
о том же самом, а это ровно та ошибка, которую мы чиним в этом же проекте.

В интерфейсе выбор остаётся тройным: «глава», «страница», «общее» — главы и страницы просто
идут двумя группами одного списка.

---

### Задача 1: проверка ссылки

Делается первой: без неё первая же очередь модератора наполнится мёртвыми ссылками.

**Файлы:**
- Создать: `server/linkcheck.mjs`
- Создать: `server/linkcheck.test.mjs`

**Интерфейсы:**
- Отдаёт наружу: `youTubeId(url: string): string | null`,
  `checkLink(url: string, fetchImpl?): Promise<{ok: boolean, reason?: string, title?: string, channel?: string}>`.

- [ ] **Шаг 1: написать падающий тест**

Создать `server/linkcheck.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { youTubeId, checkLink } from './linkcheck.mjs';

test('id ролика достаётся из всех трёх видов ссылок', () => {
  assert.equal(youTubeId('https://www.youtube.com/watch?v=TGVoOBmvTJs'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://youtu.be/TGVoOBmvTJs'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://www.youtube.com/embed/TGVoOBmvTJs?start=10'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://example.com/watch?v=short'), null);
});

test('живой ролик: берём название и канал из ответа', async () => {
  const fake = async () => ({ ok: true, json: async () => ({ title: 'Про git', author_name: 'Канал' }) });
  const r = await checkLink('https://youtu.be/TGVoOBmvTJs', fake);
  assert.deepEqual(r, { ok: true, title: 'Про git', channel: 'Канал' });
});

test('удалённый ролик не проходит', async () => {
  const fake = async () => ({ ok: false, status: 404 });
  const r = await checkLink('https://youtu.be/TGVoOBmvTJs', fake);
  assert.equal(r.ok, false);
  assert.match(r.reason, /удал|приват/i);
});

test('обычная живая ссылка проходит без названия', async () => {
  const fake = async () => ({ ok: true, status: 200 });
  const r = await checkLink('https://git-scm.com/book/ru', fake);
  assert.equal(r.ok, true);
  assert.equal(r.title, undefined);
});

test('страница отвечает ошибкой — отказ', async () => {
  const fake = async () => ({ ok: false, status: 404 });
  const r = await checkLink('https://example.com/нет', fake);
  assert.equal(r.ok, false);
  assert.match(r.reason, /не отвеча|404/i);
});

test('сеть упала — отказ, а не исключение наружу', async () => {
  const fake = async () => { throw new Error('ECONNRESET'); };
  const r = await checkLink('https://example.com', fake);
  assert.equal(r.ok, false);
  assert.ok(r.reason);
});

test('не https — отказ до всякой сети', async () => {
  const boom = async () => { throw new Error('сюда ходить не должны'); };
  const r = await checkLink('http://example.com', boom);
  assert.equal(r.ok, false);
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `node --test server/linkcheck.test.mjs`
Ожидаем: FAIL, `Cannot find module './linkcheck.mjs'`.

- [ ] **Шаг 3: написать модуль**

Создать `server/linkcheck.mjs`:

```js
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
```

- [ ] **Шаг 4: убедиться, что тест проходит**

Команда: `node --test server/linkcheck.test.mjs`
Ожидаем: PASS, 7 тестов.

- [ ] **Шаг 5: подключить к приёму**

В `server/index.mjs` добавить импорт вверху:

```js
import { checkLink } from './linkcheck.mjs';
```

и в обработчике `POST /community`, сразу после проверки `data` на https-строку
(перед `insertCommunity.run`), вставить:

```js
      // Мёртвая ссылка не доходит до очереди: отказ виден отправителю сразу.
      let checkedTitle = title;
      if (type !== 'preset') {
        const check = await checkLink(data);
        if (!check.ok) return json(res, 400, { error: check.reason });
        if (check.title && !body.title) checkedTitle = String(check.title).slice(0, 200);
      }
```

и заменить в вызове `insertCommunity.run` поле `title` на `checkedTitle`.

- [ ] **Шаг 6: прогнать серверные тесты**

Команда: `npm test`
Ожидаем: 28 тестов (было 21, добавилось 7), fail 0.

- [ ] **Шаг 7: коммит**

```bash
git add server/linkcheck.mjs server/linkcheck.test.mjs server/index.mjs
git commit -m "Ссылка проверяется при отправке материала

Мёртвое больше не попадает в очередь: YouTube спрашивается через oEmbed,
остальное — обычным запросом с таймаутом пять секунд. Человек видит отказ сразу,
а модератору не надо ходить по ссылкам. У ролика заодно берётся настоящее
название, если отправитель его не вписал.

Проверка вынесена отдельным модулем и принимает fetch параметром — поэтому
проверяется тестами без сети."
```

---

### Задача 2: материал можно привязать к странице и оставить общим

**Файлы:**
- Изменить: `src/components/SubmitCommunity.tsx`
- Создать: `src/components/SubmitCommunity.test.tsx`

**Интерфейсы:**
- Использует: `submitCommunity({type, title, chapterId?, data})` из `src/lib/account.ts` — без изменений.
- Пустой `chapterId` означает «общий материал». Колонка в базе не нужна: `chapter_id NULL`
  это и есть «общее».

- [ ] **Шаг 1: написать падающий тест**

Создать `src/components/SubmitCommunity.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { store } from '../lib/store';
import { TARGET_GROUPS } from './SubmitCommunity';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('адрес предлагается тремя вариантами: общее, главы, страницы', () => {
  const labels = TARGET_GROUPS.map((g) => g.label);
  expect(labels).toEqual(['Общее', 'Главы', 'Страницы']);
});

test('в «Общем» ровно один вариант с пустым значением', () => {
  const общее = TARGET_GROUPS[0];
  expect(общее.options).toHaveLength(1);
  expect(общее.options[0].value).toBe('');
});

test('главы и страницы не пересекаются и не пусты', () => {
  const chapters = TARGET_GROUPS[1].options.map((o) => o.value);
  const pages = TARGET_GROUPS[2].options.map((o) => o.value);
  expect(chapters.length).toBeGreaterThan(100);
  expect(pages.length).toBeGreaterThan(0);
  expect(chapters.filter((c) => pages.includes(c))).toEqual([]);
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/components/SubmitCommunity.test.tsx`
Ожидаем: FAIL, `TARGET_GROUPS` не экспортируется.

- [ ] **Шаг 3: собрать список адресов**

В `src/components/SubmitCommunity.tsx` заменить строки с `CHAPTERS` на:

```tsx
import knowledgeMap from '../data/knowledge-map.json';
import pages from '../data/pages.json';

type Doc = { id: string; title: string };

/** Куда можно привязать материал. «Общее» — пустое значение: в базе это NULL. */
export const TARGET_GROUPS: { label: string; options: { value: string; label: string }[] }[] = [
  { label: 'Общее', options: [{ value: '', label: 'Не привязан к теме' }] },
  {
    label: 'Главы',
    options: (knowledgeMap as Doc[]).map((e) => ({ value: e.id, label: e.title })),
  },
  {
    label: 'Страницы',
    options: (pages as Doc[]).map((e) => ({ value: e.id, label: e.title })),
  },
];
```

- [ ] **Шаг 4: показать их в форме**

Заменить выпадающий список глав на сгруппированный:

```tsx
        <label className="sc-label">
          К чему относится
          <select value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
            {TARGET_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.options.map((o) => (
                  <option key={o.value || 'none'} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
```

- [ ] **Шаг 5: прогнать тесты**

Команда: `npx vitest run src/components/SubmitCommunity.test.tsx && npm run typecheck`
Ожидаем: PASS, 3 теста; typecheck молчит.

- [ ] **Шаг 6: коммит**

```bash
git add src/components/SubmitCommunity.tsx src/components/SubmitCommunity.test.tsx
git commit -m "Материал можно привязать к странице или оставить общим

Раньше адрес был только один — глава. Теперь список сгруппирован: общее, главы,
страницы. Отдельная колонка в базе для этого не нужна: chapter_id NULL и есть
«общее», а третьего состояния не существует."
```

---

### Задача 3: роль модератора

**Файлы:**
- Изменить: `server/index.mjs` (таблица, `isModerator`, ручки `/moderate/*`, панель)
- Создать: `server/moderators.test.mjs`
- Изменить: `src/lib/account.ts` (клиентские вызовы)
- Изменить: `src/pages/mentor.tsx` (панель выдачи роли)
- Создать: `src/pages/moderate.tsx`

**Интерфейсы:**
- Отдаёт: `GET /moderate/queue` → `{items: PendingItem[]}`; `POST /moderate/:id` с
  `{action: 'approve'|'reject'}`; `GET|POST /moderate/people`, `DELETE /moderate/people/:login`.
- Клиент: `listModerators()`, `addModerator(login)`, `removeModerator(login)`,
  `fetchModerationQueue()`, `decideMaterial(id, action)` в `src/lib/account.ts`.

- [ ] **Шаг 1: написать падающий тест**

Создать `server/moderators.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// Роль модератора повторяет роль автора: та же таблица из трёх колонок и та же
// выдача наставником. Тест стережёт, что доступ к очереди НЕ шире наставника
// с модератором — иначе очередь стала бы публичной.
const src = fs.readFileSync(new URL('./index.mjs', import.meta.url), 'utf8');

test('таблица модераторов заведена', () => {
  assert.match(src, /CREATE TABLE IF NOT EXISTS moderators/);
});

test('очередь закрыта проверкой роли', () => {
  const block = src.slice(src.indexOf("path === '/moderate/queue'"));
  assert.match(block.slice(0, 400), /moderatorGuard\(\)/);
});

test('выдавать роль может только наставник', () => {
  const block = src.slice(src.indexOf("path === '/moderate/people'"));
  assert.match(block.slice(0, 400), /mentorGuardTop\(\)/);
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `node --test server/moderators.test.mjs`
Ожидаем: FAIL на первом же утверждении — таблицы нет.

- [ ] **Шаг 3: таблица и проверка роли**

В `server/index.mjs` рядом с таблицей `authors` добавить:

```js
// Модератор проверяет материалы сообщества. Отдельно от наставника: проверять
// ссылки и вести группу — разные занятия, и второе отдавать не обязательно.
db.exec(`CREATE TABLE IF NOT EXISTS moderators (
  login TEXT PRIMARY KEY, added_by TEXT, added_at INTEGER
)`);
const moderatorRow = db.prepare('SELECT login FROM moderators WHERE login = ?');
const allModeratorRows = db.prepare('SELECT login, added_by, added_at FROM moderators ORDER BY added_at');
const addModeratorRow = db.prepare('INSERT OR IGNORE INTO moderators (login, added_by, added_at) VALUES (?, ?, ?)');
const removeModeratorRow = db.prepare('DELETE FROM moderators WHERE login = ?');
// Наставник модерирует и без роли: роль нужна, чтобы отдать проверку студенту.
const isModerator = (u) => !!u && (isMentor(u) || !!moderatorRow.get(String(u.login).toLowerCase()));
```

- [ ] **Шаг 4: ручки**

Рядом с `/content/authors` добавить:

```js
    const moderatorGuard = () => {
      const s = bearer(req);
      if (!s) return { err: [401, 'unauthorized'] };
      const u = getUser.get(s.id);
      if (!isModerator(u)) return { err: [403, 'нужна роль модератора'] };
      return { u };
    };

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

    if (path === '/moderate/people' && req.method === 'GET') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      return json(res, 200, { moderators: allModeratorRows.all().map((r) => ({ login: r.login, addedBy: r.added_by })) });
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
      if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) return json(res, 400, { error: 'нужен GitHub-логин' });
      addModeratorRow.run(login, gm.u.login, Date.now());
      return json(res, 200, { ok: true });
    }

    const modDel = path.match(/^\/moderate\/people\/([A-Za-z\d-]+)$/);
    if (modDel && req.method === 'DELETE') {
      const gm = mentorGuardTop();
      if (gm.err) return json(res, gm.err[0], { error: gm.err[1] });
      removeModeratorRow.run(modDel[1].toLowerCase());
      return json(res, 200, { ok: true });
    }
```

**Внимание:** блок `/moderate/people` должен идти **до** `/moderate/:id`, иначе regexp
`^\/moderate\/(\d+)$` не поймает `people`, но порядок всё равно важен для читаемости.

- [ ] **Шаг 5: клиентские вызовы**

В `src/lib/account.ts` добавить рядом с `listAuthors`:

```ts
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
```

- [ ] **Шаг 6: панель выдачи роли**

В `src/pages/mentor.tsx` добавить компонент и вставить `<ModeratorsPanel canRemove={isRoot} />`
сразу после `<AuthorsPanel canRemove={isRoot} />`:

```tsx
// Модератор проверяет присланные материалы. Право отдельное от наставничества:
// вести группу и просматривать чужие ссылки — разные занятия.
function ModeratorsPanel({ canRemove }: { canRemove: boolean }) {
  const [people, setPeople] = useState<ModeratorEntry[] | null>(null);
  const [login, setLoginValue] = useState('');
  const reload = () => listModerators().then(setPeople);
  useEffect(() => {
    reload();
  }, []);
  if (!people) return null;
  return (
    <section className="mn-section">
      <h2 className="mn-h">Модераторы материалов</h2>
      <p className="ac-muted">
        Модератор видит очередь на <Link to="/moderate">странице проверки</Link> и решает,
        принять материал или отклонить. Наставник может это и без роли.
      </p>
      <div className="mn-mentors">
        {people.map((m) => (
          <span key={m.login} className="mn-mentor-chip">
            @{m.login}
            {canRemove && (
              <button
                type="button"
                className="mn-mentor-del"
                title="Снять роль модератора"
                onClick={async () => {
                  if (window.confirm(`Снять @${m.login} с модераторов?`)) {
                    await removeModerator(m.login);
                    reload();
                  }
                }}
              >
                ✕
              </button>
            )}
          </span>
        ))}
        {!people.length && <span className="ac-muted">пока никого</span>}
      </div>
      <form
        className="mn-mentor-add"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!login.trim()) return;
          await addModerator(login.trim());
          setLoginValue('');
          reload();
        }}
      >
        <input
          value={login}
          onChange={(e) => setLoginValue(e.target.value)}
          placeholder="github-логин"
          aria-label="GitHub-логин модератора"
          className="ac-join-input mn-mentor-input"
        />
        <button type="submit" className="button button--secondary" disabled={!login.trim()}>
          Дать роль модератора
        </button>
      </form>
    </section>
  );
}
```

- [ ] **Шаг 7: вынести очередь в свой файл**

**Очередь уже написана.** В `src/pages/mentor.tsx` есть компонент `ModerationQueue` —
писать его заново не нужно, нужно вынести, чтобы им пользовались обе страницы.

Перенести `ModerationQueue` целиком (строки 471–522, от комментария до закрывающей скобки)
в новый файл `src/components/ModerationQueue.tsx`, добавив сверху:

```tsx
import React, { useEffect, useState } from 'react';
import { fetchModerationQueue, decideMaterial, type PendingItem } from '../lib/account';
import './trainers.css';

export default function ModerationQueue() {
```

и заменив внутри `fetchPendingCommunity('pending')` на `fetchModerationQueue()`, а
`reviewCommunity(id, action)` на `decideMaterial(id, action)` — ручки `/moderate/*` пускают
и наставника, и модератора, так что одна и та же очередь годится обеим страницам.

В `src/pages/mentor.tsx` удалить перенесённый компонент и импортировать его:
`import ModerationQueue from '../components/ModerationQueue';`

- [ ] **Шаг 8: страница модератора**

Создать `src/pages/moderate.tsx`:

```tsx
import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ModerationQueue from '../components/ModerationQueue';
import { isLoggedIn, login } from '../lib/account';
import '../components/trainers.css';

function Inner() {
  if (!isLoggedIn())
    return (
      <div className="ac-card">
        <p>Чтобы проверять материалы, войдите через GitHub.</p>
        <button className="button button--primary" onClick={() => login()}>Войти</button>
      </div>
    );
  // Очередь сама отдаёт пустоту и при отсутствии роли, и при пустой очереди:
  // разница для человека тут несущественная, а лишнего запроса не делаем.
  return <ModerationQueue />;
}

export default function ModeratePage(): React.ReactElement {
  return (
    <Layout title="Проверка материалов" description="Очередь материалов от студентов">
      <main className="container margin-vert--lg">
        <h1>Проверка материалов</h1>
        <BrowserOnly fallback={<p className="ac-muted">Загружаю…</p>}>{() => <Inner />}</BrowserOnly>
      </main>
    </Layout>
  );
}
```

- [ ] **Шаг 9: прогнать**

Команда: `npm test && npm run typecheck && npx vitest run`
Ожидаем: 31 тест `npm test` (28 + 3), typecheck молчит, vitest зелёный.

- [ ] **Шаг 10: коммит**

```bash
git add server/index.mjs server/moderators.test.mjs src/lib/account.ts src/pages/mentor.tsx src/pages/moderate.tsx src/components/ModerationQueue.tsx
git commit -m "Роль модератора и своя очередь

Повторяет роль автора: таблица из трёх колонок, выдаёт наставник у себя в
разделе. Наставник модерирует и без роли — она нужна, чтобы отдать проверку
студенту, не делая его наставником.

Тест стережёт, что очередь закрыта проверкой роли, а выдавать роль может только
наставник: ошибка здесь сделала бы очередь публичной."
```

---

### Задача 4: витрина

**Файлы:**
- Изменить: `src/components/CommunityCatalog.tsx`
- Изменить: `src/components/CommunityCatalog.test.tsx`
- Изменить: `src/components/trainers.css` (стили витрины)

**Интерфейсы:**
- Использует: `fetchApprovedCommunity()` из `src/lib/account.ts`; `youTubeId` — своя копия
  на клиенте (серверный модуль в бандл не тащим).
- Отдаёт: `groupItems(items: CommunityItem[]): {key: string; label: string; items: CommunityItem[]}[]`.

- [ ] **Шаг 1: написать падающий тест**

В `src/components/CommunityCatalog.test.tsx` добавить:

```tsx
import { groupItems, thumbUrl } from './CommunityCatalog';

const item = (type: string, i: number, data = 'https://example.com/' + i) => ({
  id: 'x' + i, type, title: 'Материал ' + i, author: 'kto', data, addedAt: '2026-09-16',
}) as never;

test('группы идут в постоянном порядке и несут свои записи', () => {
  const groups = groupItems([item('source', 1), item('video', 2), item('repo', 3)]);
  expect(groups.map((g) => g.key)).toEqual(['video', 'read', 'repo', 'preset']);
  expect(groups[0].items).toHaveLength(1);
  expect(groups[1].items).toHaveLength(1);
});

test('статьи и инструменты попадают в одну группу', () => {
  const groups = groupItems([item('source', 1), item('link', 2)]);
  const read = groups.find((g) => g.key === 'read')!;
  expect(read.items).toHaveLength(2);
});

test('пустая группа остаётся в списке — её место объясняется текстом', () => {
  const groups = groupItems([item('video', 1)]);
  expect(groups.find((g) => g.key === 'repo')!.items).toEqual([]);
});

test('обложка строится только для ссылок YouTube', () => {
  expect(thumbUrl({ data: 'https://youtu.be/TGVoOBmvTJs' } as never))
    .toBe('https://i.ytimg.com/vi/TGVoOBmvTJs/mqdefault.jpg');
  expect(thumbUrl({ data: 'https://example.com/video' } as never)).toBeNull();
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/components/CommunityCatalog.test.tsx`
Ожидаем: FAIL — `groupItems` и `thumbUrl` не экспортируются.

- [ ] **Шаг 3: группировка и обложки**

В `src/components/CommunityCatalog.tsx` добавить:

```tsx
// Порядок групп постоянный: человек привыкает, где что лежит, и пустая группа
// не исчезает, а объясняет, что в ней появится.
const GROUPS = [
  { key: 'video', label: 'Видео', types: ['video'] },
  { key: 'read', label: 'Статьи и инструменты', types: ['source', 'link'] },
  { key: 'repo', label: 'Репозитории', types: ['repo'] },
  { key: 'preset', label: 'Пресеты тренажёров', types: ['preset'] },
] as const;

export const EMPTY_HINT: Record<string, string> = {
  video: 'Здесь появятся разборы по темам глав.',
  read: 'Здесь появятся статьи, шпаргалки и полезные инструменты.',
  repo: 'Здесь появятся проекты студентов — например, приложение за конкурсный день.',
  preset: 'Здесь появятся наборы заданий, собранные в конструкторе зала.',
};

export function groupItems(items: CommunityItem[]) {
  return GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    items: items.filter((i) => (g.types as readonly string[]).includes(i.type)),
  }));
}

const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#]|$)/;

/** Кадр ролика для карточки. Не YouTube — обложки нет, и карточка её не рисует. */
export function thumbUrl(item: CommunityItem): string | null {
  const url = typeof item.data === 'string' ? item.data : '';
  const m = YT.exec(url);
  return m ? `https://i.ytimg.com/vi/${m[1]}/mqdefault.jpg` : null;
}
```

- [ ] **Шаг 4: переименовать подписи типов**

В том же файле заменить `TYPE_LABELS`: «Источник» и «Ссылка» ничего не различали.

```tsx
export const TYPE_LABELS: Record<CommunityItem['type'], string> = {
  preset: 'Пресет тренажёра',
  repo: 'Репозиторий',
  link: 'Инструмент',
  video: 'Видео',
  source: 'Статья',
};
```

Значения в базе не меняются — это подписи, а не данные; миграция ради ярлыка не нужна.

- [ ] **Шаг 5: разметка групп**

Заменить плоский список карточек и выпадающий фильтр по типу на:

```tsx
const GLYPH: Record<string, React.ReactElement> = {
  source: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l5 5v13H6z" /><path d="M15 3v5h5" /><path d="M9 12h7M9 16h7" /></svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a4 4 0 0 0 5.7.4l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.3 1.3" /><path d="M14 11a4 4 0 0 0-5.7-.4l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.3-1.3" /></svg>
  ),
  repo: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v4H6.5A2.5 2.5 0 0 1 4 19.5z" /></svg>
  ),
};

const hostOf = (u: string) => (u.split('//', 1)[1] || '').split('/', 1)[0].replace('www.', '');

/* чипы по типу: видно варианты и количества без клика */
<div className="cc-chips" role="group" aria-label="Тип материала">
  {[{ key: ALL, label: 'Всё', n: items.length },
    ...groupItems(items).map((g) => ({ key: g.key, label: g.label, n: g.items.length }))].map((c) => (
    <button
      key={c.key}
      type="button"
      className={type === c.key ? 'cc-chip on' : 'cc-chip'}
      aria-pressed={type === c.key}
      onClick={() => setType(c.key)}
    >
      {c.label}<span className="cc-n">{c.n}</span>
    </button>
  ))}
</div>

{groupItems(filtered)
  .filter((g) => type === ALL || g.key === type)
  .map((g) => (
    <section className="cc-group" key={g.key}>
      <div className="cc-ghead">
        <h2>{g.label}</h2>
        <span className="cc-n">{g.items.length}</span>
      </div>

      {g.items.length === 0 ? (
        <p className="cc-empty">{EMPTY_HINT[g.key]}</p>
      ) : g.key === 'video' ? (
        <div className="cc-vgrid">
          {g.items.map((item) => {
            const thumb = thumbUrl(item);
            return (
              <a className="cc-vcard" key={item.id} href={String(item.data)} target="_blank" rel="noopener noreferrer">
                <span className="cc-shot">
                  {thumb && (
                    <img src={thumb} alt={`Кадр из видео «${item.title}»`} loading="lazy" width={320} height={180} />
                  )}
                </span>
                <span className="cc-vtitle">{item.title}</span>
                <span className="cc-vmeta">
                  <span>{item.author}</span>
                  {item.chapterId && <span className="cc-tag">{chapterTitle(item.chapterId)}</span>}
                </span>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="cc-rows">
          {g.items.map((item) => (
            <a className="cc-row" key={item.id} href={String(item.data)} target="_blank" rel="noopener noreferrer">
              <span className="cc-glyph">{GLYPH[item.type] ?? GLYPH.link}</span>
              <span className="cc-rmain">
                <span className="cc-rtitle">{item.title}</span>
                <span className="cc-rsub">{TYPE_LABELS[item.type]} · {hostOf(String(item.data))} · {item.author}</span>
              </span>
              {item.chapterId && <span className="cc-tag">{chapterTitle(item.chapterId)}</span>}
            </a>
          ))}
        </div>
      )}
    </section>
  ))}
```

Фильтры по главе и автору оставить выпадающими: значений там десятки, чипами не поместятся.
Пресеты рисуются как сейчас — своей карточкой с кнопкой запуска; их ветку не трогать.

- [ ] **Шаг 6: стили**

Дописать в конец `src/components/trainers.css`:

```css
/* Витрина сообщества: видео кадром, ссылки строкой. Разные вещи выглядят
   по-разному — иначе непонятно, что за материал. */

.cc-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem; }

.cc-chip {
  display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 14px;
  border: 1px solid var(--ifm-color-emphasis-300); border-radius: 999px;
  background: var(--ifm-background-surface-color); color: var(--ifm-color-emphasis-700);
  font: 600 0.86rem var(--ifm-font-family-base); cursor: pointer;
}
.cc-chip.on { background: var(--ifm-color-primary); border-color: var(--ifm-color-primary); color: var(--ifm-button-color); }
.cc-n { font-family: var(--ifm-font-family-monospace); font-size: 0.78rem; font-variant-numeric: tabular-nums; opacity: 0.75; }

.cc-group { margin-bottom: 2rem; }
.cc-ghead { display: flex; align-items: baseline; gap: 10px; margin-bottom: 0.75rem; }
.cc-ghead h2 { margin: 0; font-size: 1.15rem; }

.cc-vgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 16px; }
.cc-vcard { display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: inherit; }
/* Место под кадр занято заранее: иначе сетка прыгает, когда картинки долетают */
.cc-shot {
  position: relative; display: block; aspect-ratio: 16 / 9; border-radius: 10px;
  overflow: hidden; background: var(--ifm-color-emphasis-200);
}
.cc-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cc-vcard:hover .cc-shot { outline: 2px solid var(--ifm-color-primary); outline-offset: 2px; }
.cc-vtitle {
  font-family: var(--ifm-heading-font-family); font-weight: 600; font-size: 0.92rem; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cc-vmeta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 0.76rem; color: var(--ifm-color-emphasis-600); }

.cc-rows { display: flex; flex-direction: column; }
.cc-row {
  display: flex; align-items: center; gap: 12px; padding: 11px 2px; min-height: 48px;
  border-bottom: 1px solid var(--ifm-color-emphasis-200); text-decoration: none; color: inherit;
}
.cc-row:last-child { border-bottom: 0; }
.cc-row:hover .cc-rtitle { color: var(--ifm-color-primary); }
.cc-glyph {
  flex: none; width: 32px; height: 32px; border-radius: 8px;
  background: var(--ifm-color-emphasis-200); display: grid; place-items: center;
}
.cc-glyph svg {
  width: 17px; height: 17px; fill: none; stroke: var(--ifm-color-emphasis-700);
  stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round;
}
.cc-rmain { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.cc-rtitle { font-weight: 600; font-size: 0.93rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cc-rsub { font-size: 0.78rem; color: var(--ifm-color-emphasis-600); }

.cc-tag {
  font-size: 0.74rem; padding: 2px 9px; border-radius: 999px;
  background: var(--ifm-color-emphasis-200); color: var(--ifm-color-emphasis-700); white-space: nowrap;
}

.cc-empty {
  border: 1px dashed var(--ifm-color-emphasis-300); border-radius: 12px; padding: 20px;
  text-align: center; color: var(--ifm-color-emphasis-600); font-size: 0.92rem; margin: 0;
}
```

- [ ] **Шаг 7: прогнать**

Команда: `npx vitest run src/components/CommunityCatalog.test.tsx && npm run build`
Ожидаем: PASS; сборка SUCCESS.

- [ ] **Шаг 8: коммит**

```bash
git add src/components/CommunityCatalog.tsx src/components/CommunityCatalog.test.tsx src/components/trainers.css
git commit -m "Витрина сообщества: видно, что за материал

Было 35 одинаковых карточек одним списком и три выпадающих фильтра. Стало:
видео — карточкой с кадром, потому что кадр и есть содержание ролика; статьи и
инструменты — плотным списком, потому что это ссылки, а не медиа; пустая группа
объясняет, что в ней появится, вместо белого поля.

Фильтр по типу стал чипами с числами: видно варианты и количества без клика.
Место под обложку зарезервировано, иначе сетка из двух десятков кадров прыгает
при загрузке."
```

---

### Задача 5: подвал главы показывает одобренное

**Файлы:**
- Изменить: `src/components/ChapterSources.tsx`
- Изменить: `src/components/ChapterSources.test.tsx`

**Интерфейсы:**
- Использует: `fetchApprovedCommunity()` вместо `fetch(COMMUNITY_JSON_URL)`.
- Отдаёт: `pickSources(raw: unknown, docId: string): CommunityItem[]` — сигнатура та же,
  меняется только источник данных.

- [ ] **Шаг 1: поправить тест под новый источник**

В `src/components/ChapterSources.test.tsx` заменить подготовку данных: вместо мока
`fetch` по URL — мок `fetchApprovedCommunity`. Добавить тест:

```tsx
test('материал, привязанный к странице, тоже попадает в её подвал', () => {
  const raw = [
    { id: '1', type: 'source', title: 'Шпаргалка', author: 'kto', chapterId: 'kak-dobavit-stranicu', data: 'https://a.ru' },
    { id: '2', type: 'source', title: 'Чужое', author: 'kto', chapterId: 'typing', data: 'https://b.ru' },
  ];
  expect(pickSources(raw, 'kak-dobavit-stranicu').map((i) => i.title)).toEqual(['Шпаргалка']);
});

test('общий материал в подвал не попадает — ему место в каталоге', () => {
  const raw = [{ id: '1', type: 'source', title: 'Общее', author: 'kto', data: 'https://a.ru' }];
  expect(pickSources(raw, 'typing')).toEqual([]);
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/components/ChapterSources.test.tsx`
Ожидаем: FAIL — компонент всё ещё ходит в статический файл.

- [ ] **Шаг 3: сменить источник**

В `src/components/ChapterSources.tsx` заменить импорт и загрузку:

```tsx
import { fetchApprovedCommunity } from '../lib/account';

// Материалы берутся с сервера, а не из статического файла в отдельном
// репозитории. Раньше одобренный материал попадал в каталог, но у главы не
// появлялся никогда — это и был молчаливый разрыв.
  useEffect(() => {
    let alive = true;
    fetchApprovedCommunity()
      .then((raw) => alive && setItems(pickSources(raw, chapterId)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [chapterId]);
```

Заголовок блока поменять на «Принесли студенты», добавить под каждым материалом автора.

- [ ] **Шаг 4: прогнать**

Команда: `npx vitest run src/components/ChapterSources.test.tsx && npm run typecheck`
Ожидаем: PASS; typecheck молчит.

- [ ] **Шаг 5: коммит**

```bash
git add src/components/ChapterSources.tsx src/components/ChapterSources.test.tsx
git commit -m "Подвал главы показывает одобренные материалы

Он читал только статический файл из отдельного репозитория, поэтому одобренный
материал попадал в каталог, но у главы не появлялся никогда. Сейчас это не
проявлялось ровно потому, что одобрять было нечего.

Заодно блок назван «Принесли студенты» и показывает автора: рядом стоит блок
кураторских видео, и перепутать их нельзя."
```

---

### Задача 6: кураторские видео без правки JSON

**Файлы:**
- Изменить: `server/index.mjs` (ручка `PUT /content/videos`)
- Создать: `server/videos-path.test.mjs`
- Создать: `src/pages/videos.tsx`
- Изменить: `src/lib/account.ts`

**Интерфейсы:**
- Отдаёт: `PUT /content/videos` с телом `{chapterId, videos: [{videoId, title, channel}]}`.
- Клиент: `saveChapterVideos(chapterId, videos)` в `src/lib/account.ts`.

- [ ] **Шаг 1: написать падающий тест**

Создать `server/videos-path.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// Путь к файлу видео НЕ приходит из запроса: он захардкожен. Если однажды его
// начнут брать из тела, тем же запросом можно будет переписать любой файл
// репозитория — поэтому здесь стоит страж.
const src = fs.readFileSync(new URL('./index.mjs', import.meta.url), 'utf8');
const block = src.slice(src.indexOf("path === '/content/videos'"), src.indexOf("path === '/content/videos'") + 2500);

test('путь захардкожен и в теле не принимается', () => {
  assert.match(block, /VIDEOS_PATH/);
  assert.doesNotMatch(block, /body\.path/);
});

test('videoId проверяется по строгой форме', () => {
  assert.match(src, /\[A-Za-z0-9_-\]\{11\}/);
});

test('количество роликов ограничено четырьмя-пятью', () => {
  assert.match(block, /length < 4 \|\| .*length > 5/);
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `node --test server/videos-path.test.mjs`
Ожидаем: FAIL — ручки нет.

- [ ] **Шаг 3: написать ручку**

В `server/index.mjs` рядом с `/content/file` добавить:

```js
    // Кураторские видео главы. Путь ЗАХАРДКОЖЕН и в теле запроса не принимается:
    // иначе этой же ручкой можно было бы переписать любой файл репозитория.
    // SAFE_DOC_PATH тут ни при чём и не расширяется.
    const VIDEOS_PATH = 'src/data/chapter-videos.json';
    const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

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
      // Название и канал берутся из ответа oEmbed той же проверки: заполнять их
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
      if (!put.ok) return json(res, 502, { error: 'GitHub не разрешил запись', detail: put.data?.message });
      return json(res, 200, { ok: true });
    }
```

- [ ] **Шаг 4: клиентский вызов**

В `src/lib/account.ts`:

```ts
export type ChapterVideo = { videoId: string; title: string; channel: string };

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
```

- [ ] **Шаг 5: страница**

Создать `src/pages/videos.tsx`:

```tsx
import React, { useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import knowledgeMap from '../data/knowledge-map.json';
import allVideos from '../data/chapter-videos.json';
import { isLoggedIn, login, saveChapterVideos, type ChapterVideo } from '../lib/account';
import '../components/trainers.css';

type Doc = { id: string; title: string };
const CHAPTERS = knowledgeMap as Doc[];
const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#]|$)/;

function Editor() {
  const [chapterId, setChapterId] = useState(CHAPTERS[0]?.id ?? '');
  const [list, setList] = useState<ChapterVideo[]>(
    () => ((allVideos as Record<string, ChapterVideo[]>)[CHAPTERS[0]?.id] ?? []).slice(),
  );
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const pick = (id: string) => {
    setChapterId(id);
    setList(((allVideos as Record<string, ChapterVideo[]>)[id] ?? []).slice());
    setNote(null);
  };

  const add = () => {
    const m = YT.exec(url.trim());
    if (!m) return setNote({ kind: 'err', text: 'это не ссылка на ролик YouTube' });
    if (list.some((v) => v.videoId === m[1])) return setNote({ kind: 'err', text: 'этот ролик уже есть' });
    setList([...list, { videoId: m[1], title: '', channel: '' }]);
    setUrl('');
    setNote(null);
  };

  // Ровно то же, что требует гейт сборки: меньше четырёх или больше пяти он не пропустит.
  const countOk = list.length >= 4 && list.length <= 5;

  const save = async () => {
    setBusy(true);
    setNote(null);
    const r = await saveChapterVideos(chapterId, list);
    setBusy(false);
    setNote(r.ok
      ? { kind: 'ok', text: 'сохранено — сайт пересоберётся через несколько минут' }
      : { kind: 'err', text: r.error });
  };

  if (!isLoggedIn())
    return (
      <div className="ac-card">
        <p>Чтобы править видео глав, войдите через GitHub.</p>
        <button className="button button--primary" onClick={() => login()}>Войти</button>
      </div>
    );

  return (
    <div className="ed-main">
      <label className="ed-label">
        Глава
        <select value={chapterId} onChange={(e) => pick(e.target.value)}>
          {CHAPTERS.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </label>

      <ul className="cc-rows">
        {list.map((v) => (
          <li className="cc-row" key={v.videoId}>
            <span className="cc-rmain">
              <span className="cc-rtitle">{v.title || v.videoId}</span>
              <span className="cc-rsub">{v.channel || 'канал не заполнен'}</span>
            </span>
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => setList(list.filter((x) => x.videoId !== v.videoId))}
            >
              Убрать
            </button>
          </li>
        ))}
      </ul>

      <div className="ed-tools">
        <input
          className="ed-filter"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Ссылка на ролик YouTube"
          aria-label="Ссылка на ролик"
        />
        <button type="button" className="button button--secondary" onClick={add}>Добавить</button>
      </div>

      {note && <p className={note.kind === 'ok' ? 'ed-ok' : 'ed-err'}>{note.text}</p>}
      {!countOk && <p className="ed-problems">Роликов должно быть от четырёх до пяти, сейчас {list.length}</p>}

      <button className="button button--primary" disabled={busy || !countOk} onClick={() => void save()}>
        {busy ? 'Сохраняю…' : 'Сохранить'}
      </button>
    </div>
  );
}

export default function VideosPage(): React.ReactElement {
  return (
    <Layout title="Видео глав" description="Кураторские видео к главам учебника">
      <main className="container margin-vert--lg">
        <h1>Видео глав</h1>
        <p className="ac-muted">
          Ролики, которые студент видит в подвале главы. Каждый проверяется перед записью:
          удалённый или приватный сохранить нельзя.
        </p>
        <BrowserOnly fallback={<p className="ac-muted">Загружаю…</p>}>{() => <Editor />}</BrowserOnly>
      </main>
    </Layout>
  );
}
```

**Внимание:** название и канал оставлены пустыми намеренно — сервер подставит их сам из
ответа oEmbed при проверке. Если решите заполнять на клиенте, придётся ходить в YouTube из
браузера, а это лишний внешний запрос на каждую добавленную ссылку.

- [ ] **Шаг 6: прогнать**

Команда: `npm test && npm run typecheck`
Ожидаем: 34 теста (31 + 3), typecheck молчит.

- [ ] **Шаг 7: коммит**

```bash
git add server/index.mjs server/videos-path.test.mjs src/lib/account.ts src/pages/videos.tsx
git commit -m "Кураторские видео правятся на сайте, а не в JSON руками

Отдельная ручка с захардкоженным путём: файл один, в теле запроса он не
принимается. SAFE_DOC_PATH не расширялся, защита правки страниц не тронута —
у новой ручки свой страж на то, что путь извне не приходит.

Каждый ролик проверяется через oEmbed перед записью, количество 4–5 — то же,
что требует гейт сборки."
```

---

### Задача 7: уборка

Идёт последней: до переезда данных статический файл ещё нужен витрине.

**Файлы:**
- Изменить: `src/components/CommunityCatalog.tsx` (убрать `COMMUNITY_JSON_URL`, `SUBMIT_URL`)
- Изменить: `src/pages/community.tsx` (убрать тизер гайда)
- Изменить: `docs/foundation/00-github-start.mdx` (убрать ссылку на гайд)
- Удалить: `src/pages/community-guide.tsx`
- Создать: `~/Documents/claude/pgk-migrate-community.py` (вне репозитория)

- [ ] **Шаг 1: перевезти данные**

Скрипт кладётся на сервер рядом с базой и запускается один раз. В репозиторий платформы
он не едет.

```python
#!/usr/bin/env python3
"""Переезд статического каталога в базу. Дубли кураторских роликов отбрасываются."""
import json, re, sqlite3, time, urllib.request

DB = '/opt/edu-alspio/data/account.db'
SRC = 'https://raw.githubusercontent.com/pgk-champs/community/main/community.json'
VIDEOS = 'https://raw.githubusercontent.com/pgk-champs/platform/main/src/data/chapter-videos.json'
YT = re.compile(r'(?:v=|youtu\.be/|embed/)([A-Za-z0-9_-]{11})')

items = json.load(urllib.request.urlopen(SRC))
items = items if isinstance(items, list) else items.get('items', [])
curated = {v['videoId'] for lst in json.load(urllib.request.urlopen(VIDEOS)).values() for v in lst}

db = sqlite3.connect(DB)
added = skipped = 0
for i in items:
    data = i['data'] if isinstance(i['data'], str) else json.dumps(i['data'], ensure_ascii=False)
    m = YT.search(data) if isinstance(i['data'], str) else None
    if m and m.group(1) in curated:
        skipped += 1
        continue
    db.execute(
        "INSERT INTO community (type, chapter_id, title, data, author_gh_id, author_login,"
        " status, created_at) VALUES (?,?,?,?,?,?,'approved',?)",
        (i['type'], i.get('chapterId'), i['title'], json.dumps(i['data'], ensure_ascii=False),
         0, i.get('author', 'pgk-champs'), int(time.time() * 1000)))
    added += 1
db.commit()
print(f'перевезено {added}, пропущено дублей {skipped}')
```

Ожидаем: `перевезено 24, пропущено дублей 10`.

- [ ] **Шаг 2: убрать статический источник**

В `src/components/CommunityCatalog.tsx` удалить `COMMUNITY_JSON_URL`, `SUBMIT_URL` и
`fetch(COMMUNITY_JSON_URL)`; оставить только `fetchApprovedCommunity()`.

- [ ] **Шаг 3: снять гайд и ссылки на него**

```bash
git rm src/pages/community-guide.tsx
```

В `src/pages/community.tsx` удалить абзац `.cg-teaser` целиком.
В `docs/foundation/00-github-start.mdx` (строка 472) убрать предложение со ссылкой
`/community-guide`, оставив остальной пункт.

- [ ] **Шаг 4: проверить, что битых ссылок не осталось**

```bash
grep -rn "community-guide\|COMMUNITY_JSON_URL\|SUBMIT_URL" src docs || echo "ссылок не осталось"
npm run build
```

Ожидаем: «ссылок не осталось»; сборка SUCCESS. Если сборка падает с `onBrokenLinks` —
значит ссылка где-то ещё, искать по тексту ошибки.

- [ ] **Шаг 5: коммит**

```bash
git add -A
git commit -m "Один путь приёма: статический каталог и гайд к нему убраны

Материалы переехали в базу, поэтому отдельный репозиторий с community.json и
бот по issue больше не нужны. Вместе с ними ушёл гайд «Как добавить своё» —
это была инструкция к форме, которой за всё время никто не воспользовался.

Ссылки на гайд сняты в двух местах: на странице сообщества и в главе про GitHub.
Не снять их значило уронить сборку — onBrokenLinks у нас throw."
```

---

### Задача 8: гейты, проверка руками, публикация

- [ ] **Шаг 1: пять гейтов**

```bash
npm run kmap && npm test && npm run typecheck && npx vitest run && npm run build
```

Ожидаем: kmap пишет два файла, `npm test` 34 теста, typecheck молчит, vitest зелёный,
build SUCCESS.

- [ ] **Шаг 2: проверка в браузере**

Поднять `preview_start {name:"edu-build"}` и пройти по списку — **гейты этого не ловят:**

- `/community`: группы, чипы с числами, кадры роликов, пустая группа с подсказкой;
- ширина 375 и 1280: сетка кадров в одну колонку, страница не едет вбок;
- светлая и тёмная тема;
- подвал главы: два блока, кураторские и студенческие, видно автора.

**Ловушка среды:** ленивые картинки в скрытой панели **не грузятся никогда** — кадры не
рисуются, пересечения с областью видимости не происходит. Проверять обложки через
`new Image()` или показав панель.

- [ ] **Шаг 3: греп и пуш**

```bash
git diff origin/main | grep -nEi "(-----BEGIN|api[_-]?key|secret|passw|ssh-rsa|AKIA|xox[baprs]-)"
git push origin main
```

- [ ] **Шаг 4: после деплоя — выдать себе роль и проверить живьём**

Открыть `/mentor` → «Модераторы материалов» → добавить свой логин. Отправить тестовый
материал с `/community`, увидеть его в `/moderate`, принять, убедиться, что он появился
в каталоге и в подвале своей главы.

Отправить заведомо мёртвую ссылку и убедиться, что она не создаёт запись вовсе.

- [ ] **Шаг 5: обновить CLAUDE.md**

Дописать в §4 новые файлы, в §7 — что каталог живёт только на сервере и статического
`community.json` больше нет, в §11 — ловушку с ленивыми картинками.
