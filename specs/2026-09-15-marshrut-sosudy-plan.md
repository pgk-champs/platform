# Маршрут на сосудах — план реализации

> **Для исполнителя:** задачи идут по порядку, каждая заканчивается коммитом.
> Шаги отмечаются чекбоксами. Спецификация: `specs/2026-09-15-marshrut-sosudy.md`.

**Цель:** заменить список глав на Маршруте окном сосудов, которые наполняются по мере
прохождения, и убрать всё, что не отвечает на вопрос «где я и что дальше».

**Устройство:** вся арифметика живёт в `src/lib/chapterFill.ts` — чистой функции без
React. Компоненты (`VesselStrip`, `ContinueCard`) только рисуют. Оформление сосуда
задаётся переменными на `[data-skin]`, разметка одна на все скины.

**Стек:** Docusaurus 3.10.2, TypeScript, vitest + @testing-library/react, CSS-переменные.

## Общие ограничения

- **Файл плана и спеки лежат в `specs/`, не в `docs/`.** `docs/` — это сам сайт;
  `scripts/knowledge-map.mjs` требует фронтматтер от каждого `.md`/`.mdx` внутри и
  уронит сборку на постороннем файле.
- **Коммит не упоминает Claude, AI и соавторство.** Сообщение по-русски, от лица Олега.
- **Перед каждым коммитом:** `git diff HEAD | grep -nEi "(-----BEGIN|api[_-]?key|secret|passw|ssh-rsa|AKIA|xox[baprs]-)"`.
- **Перед пушем — все пять гейтов:** `npm run kmap`, `npm test`, `npm run typecheck`,
  `npx vitest run`, `npm run build`. Пуш в `main` = публикация на прод.
- **Тесты vitest берутся только из `src/**/*.test.tsx`.** Файл `.test.ts` не будет
  найден — расширение обязательно `.tsx`.
- **Чистая логика не живёт в компонентах страниц:** vitest не разрешает `@theme/*` и
  `@docusaurus/*`.
- **Цветом одним смысл не передаётся.** Готовность сосуда видна формой: жидкость
  достаёт до крышки.
- **Движение:** пузырьки только у текущей главы, всё замирает при `prefers-reduced-motion`.

---

### Задача 1: `chapterFill` — арифметика наполнения

**Файлы:**
- Создать: `src/lib/chapterFill.ts`
- Создать: `src/lib/chapterFill.test.tsx`

**Интерфейсы:**
- Использует: `store.getProgress()` → `{ sections: Record<string, string[]>, quizzes: Record<string, Record<string, {correct:number,total:number,ts:number}>>, trainers: … }`; `src/data/knowledge-map.json` с полем `totals: {sections, quizzes, trainers}`.
- Отдаёт наружу: `fillOf(chapterId: string): number` (0..1), `isFull(chapterId: string): boolean`, `nextChapter(ids: string[]): string | null`, `fullCount(ids: string[]): number`.

- [ ] **Шаг 1: написать падающий тест**

Создать `src/lib/chapterFill.test.tsx`:

```tsx
import { store } from './store';
import { fillOf, isFull, nextChapter, fullCount } from './chapterFill';
import knowledgeMap from '../data/knowledge-map.json';

type Totals = { sections: number; quizzes: number; trainers: number };
const totalsOf = (id: string) =>
  (knowledgeMap as { id: string; totals: Totals }[]).find((e) => e.id === id)!.totals;

/** Отмечает в store n секций и m ИДЕАЛЬНО пройденных проверок главы. */
function feed(id: string, sections: number, quizzes: number) {
  for (let i = 0; i < sections; i += 1) store.setSectionRead(id, 's' + i);
  for (let i = 0; i < quizzes; i += 1) store.markQuizDone(id, 'q' + i, { correct: 2, total: 2 });
}

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('нетронутая глава пуста', () => {
  expect(fillOf('typing')).toBe(0);
  expect(isFull('typing')).toBe(false);
});

test('половина секций без проверок — половина от своей доли', () => {
  const t = totalsOf('typing');
  feed('typing', t.sections, 0);
  expect(fillOf('typing')).toBeCloseTo(t.sections / (t.sections + t.quizzes), 5);
});

test('всё прочитано и все проверки идеальны — сосуд полон', () => {
  const t = totalsOf('typing');
  feed('typing', t.sections, t.quizzes);
  expect(fillOf('typing')).toBe(1);
  expect(isFull('typing')).toBe(true);
});

test('проверка с ошибкой не засчитывается', () => {
  store.markQuizDone('typing', 'q0', { correct: 1, total: 2 });
  expect(fillOf('typing')).toBe(0);
});

test('главы нет в карте знаний — ноль, а не падение', () => {
  expect(fillOf('такой-главы-нет')).toBe(0);
});

test('дальше — начатая, а не следующая по порядку', () => {
  feed('typing', 3, 0);
  expect(nextChapter(['it-english', 'typing', 'terminal'])).toBe('typing');
});

test('начатых нет — первая нетронутая по порядку списка', () => {
  expect(nextChapter(['it-english', 'typing'])).toBe('it-english');
});

test('все полны — дальше некуда', () => {
  const a = totalsOf('typing');
  const b = totalsOf('it-english');
  feed('typing', a.sections, a.quizzes);
  feed('it-english', b.sections, b.quizzes);
  expect(nextChapter(['typing', 'it-english'])).toBeNull();
  expect(fullCount(['typing', 'it-english'])).toBe(2);
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/lib/chapterFill.test.tsx`
Ожидаем: FAIL, `Failed to resolve import "./chapterFill"`.

- [ ] **Шаг 3: написать реализацию**

Создать `src/lib/chapterFill.ts`:

```ts
import knowledgeMap from '../data/knowledge-map.json';
import { store } from './store';

// Наполнение главы считается по делам, а не по отметкам: ручной галочки «пройдено»
// на платформе больше нет. Тренажёры в знаменатель НЕ входят — trainerId
// необязателен, и глава без тренажёров иначе не наполнилась бы никогда.

type Totals = { sections: number; quizzes: number; trainers: number };

const TOTALS: Record<string, Totals> = Object.fromEntries(
  (knowledgeMap as { id: string; totals: Totals }[]).map((e) => [e.id, e.totals]),
);

/** Доля пройденного в главе, 0..1. Неизвестная глава — 0, без падения. */
export function fillOf(chapterId: string): number {
  const t = TOTALS[chapterId];
  if (!t) return 0;
  const denom = t.sections + t.quizzes;
  if (denom === 0) return 0;

  const progress = store.getProgress();
  const sections = progress.sections[chapterId]?.length ?? 0;
  // Проверка засчитывается только целиком верной — так же, как это понимало
  // прежнее «пройдена». Иначе сосуд наполнялся бы провалами.
  const quizzes = Object.values(progress.quizzes[chapterId] ?? {}).filter(
    (q) => q.correct === q.total,
  ).length;

  return Math.min(1, (sections + quizzes) / denom);
}

export function isFull(chapterId: string): boolean {
  return fillOf(chapterId) >= 1;
}

/** Что читать дальше: начатая и незаконченная, иначе первая нетронутая, иначе null. */
export function nextChapter(ids: string[]): string | null {
  const fills = ids.map((id) => [id, fillOf(id)] as const);
  const started = fills.find(([, f]) => f > 0 && f < 1);
  if (started) return started[0];
  const fresh = fills.find(([, f]) => f === 0);
  return fresh ? fresh[0] : null;
}

/** Сколько глав из списка наполнено до крышки. */
export function fullCount(ids: string[]): number {
  return ids.filter(isFull).length;
}
```

- [ ] **Шаг 4: убедиться, что тест проходит**

Команда: `npx vitest run src/lib/chapterFill.test.tsx`
Ожидаем: PASS, 8 тестов.

- [ ] **Шаг 5: коммит**

```bash
git add src/lib/chapterFill.ts src/lib/chapterFill.test.tsx
git commit -m "Наполнение главы считается по делам

Новая чистая функция: доля пройденного = (прочитанные секции + идеально
пройденные проверки) / (всего секций + всего проверок). Проверка с ошибкой не
засчитывается — иначе сосуд наполнялся бы провалами. Тренажёры в знаменатель не
входят: они необязательны, и глава без них не наполнилась бы никогда."
```

---

### Задача 2: перевести тренажёр слов и сертификат на `chapterFill`

Делается ДО удаления галочки: иначе между задачами тренажёр слов останется пустым,
и ни один гейт этого не заметит.

**Файлы:**
- Изменить: `src/components/WordsTrainer.tsx` (импорт и `buildPool`)
- Изменить: `src/components/WordsTrainer.test.tsx`
- Изменить: `src/components/RouteList.tsx` (аргументы `Certificate`)

**Интерфейсы:**
- Использует: `isFull`, `fullCount` из задачи 1.
- Отдаёт: `buildPool()` с прежней сигнатурой `(): Word[]` — вызывающие не меняются.

- [ ] **Шаг 1: переписать тест тренажёра слов**

В `src/components/WordsTrainer.test.tsx` заменить тест, который писал в `pgk-progress`:

```tsx
import { store } from '../lib/store';
import knowledgeMap from '../data/knowledge-map.json';

type Totals = { sections: number; quizzes: number; trainers: number };

/** Наполняет главу до крышки: все секции и все проверки без ошибок. */
function fillChapter(id: string) {
  const t = (knowledgeMap as { id: string; totals: Totals }[]).find((e) => e.id === id)!.totals;
  for (let i = 0; i < t.sections; i += 1) store.setSectionRead(id, 's' + i);
  for (let i = 0; i < t.quizzes; i += 1) store.markQuizDone(id, 'q' + i, { correct: 1, total: 1 });
}

test('buildPool берёт словарь глав, наполненных до крышки', () => {
  fillChapter('typing');
  const pool = buildPool();
  expect(pool.length).toBeGreaterThan(0);
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/components/WordsTrainer.test.tsx`
Ожидаем: FAIL — пул пуст, потому что `buildPool` пока смотрит на галочку.

- [ ] **Шаг 3: переписать `buildPool`**

В `src/components/WordsTrainer.tsx` убрать импорт из `RouteList` и заменить начало
`buildPool`:

```tsx
// было: import { loadProgress, statusOf, type Entry } from './RouteList';
import { isFull } from '../lib/chapterFill';

export function buildPool(): Word[] {
  // Словарь берётся из глав, наполненных до крышки. Раньше это была ручная
  // галочка; теперь та же величина считается по делам.
  const passed = new Set(
    (knowledgeMap as { id: string }[]).map((e) => e.id).filter(isFull),
  );
  // …дальше без изменений
```

- [ ] **Шаг 4: перевести сертификат**

В `src/components/RouteList.tsx` заменить аргументы `Certificate`:

```tsx
import { fullCount } from '../lib/chapterFill';

// …в разметке
<Certificate
  track={track}
  total={chapters.length}
  passed={fullCount(chapters.map((c) => c.id))}
/>
```

**Помнить:** в задаче 5 список `chapters` из `RouteList` уходит, и `Certificate`
переезжает в `route.tsx`, где этот список остаётся. Здесь правка временная и нужна
только чтобы не оставлять галочку в расчёте между задачами.

- [ ] **Шаг 5: прогнать тесты**

Команда: `npx vitest run src/components/WordsTrainer.test.tsx src/components/RouteList.test.tsx`
Ожидаем: PASS.

- [ ] **Шаг 6: коммит**

```bash
git add src/components/WordsTrainer.tsx src/components/WordsTrainer.test.tsx src/components/RouteList.tsx
git commit -m "Тренажёр слов и сертификат считают по делам, а не по галочке

Словарь собирался из глав, отмеченных вручную, и импортировал loadProgress со
statusOf прямо из RouteList — компонент лез в компонент. Теперь обе величины
берутся из chapterFill. Сделано до удаления галочки: иначе словарь бы опустел, и
ни один гейт этого не поймал бы."
```

---

### Задача 3: сосуд и скины

**Файлы:**
- Создать: `src/components/vessels.css`
- Создать: `src/components/VesselStrip.tsx`
- Создать: `src/components/VesselStrip.test.tsx`

**Интерфейсы:**
- Использует: `fillOf` из задачи 1.
- Отдаёт: `export default function VesselStrip({ chapters, currentId }: { chapters: {id: string; title: string; path: string}[]; currentId: string | null })`.

- [ ] **Шаг 1: написать падающий тест**

Создать `src/components/VesselStrip.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import VesselStrip from './VesselStrip';

const chapters = Array.from({ length: 12 }, (_, i) => ({
  id: 'ch' + i,
  title: 'Глава ' + i,
  path: 'mobile/ch' + i + '.mdx',
}));

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('в окне ровно пять сосудов', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  expect(screen.getAllByTestId('vessel')).toHaveLength(5);
});

test('окно встаёт вокруг текущей главы', () => {
  render(<VesselStrip chapters={chapters} currentId="ch6" />);
  const caps = screen.getAllByTestId('cap').map((n) => n.textContent);
  expect(caps).toEqual(['Глава 4', 'Глава 5', 'Глава 6', 'Глава 7', 'Глава 8']);
});

test('у начала окно не уезжает в минус', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  const caps = screen.getAllByTestId('cap').map((n) => n.textContent);
  expect(caps[0]).toBe('Глава 0');
});

test('листание вперёд сдвигает окно и упирается в конец', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  const next = screen.getByLabelText('Следующие главы');
  fireEvent.click(next);
  expect(screen.getAllByTestId('cap')[0].textContent).toBe('Глава 5');
  fireEvent.click(next);
  fireEvent.click(next);
  expect(screen.getAllByTestId('cap')[4].textContent).toBe('Глава 11');
  expect(next).toBeDisabled();
});

test('рамка видоискателя занимает долю окна от всего трека', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  const view = screen.getByTestId('view');
  expect(view.style.width).toBe((5 / 12) * 100 + '%');
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/components/VesselStrip.test.tsx`
Ожидаем: FAIL, `Failed to resolve import "./VesselStrip"`.

- [ ] **Шаг 3: написать стили**

Создать `src/components/vessels.css`. Ниже — весь файл, ничего додумывать не нужно:

```css
.vessel { position:relative; height:78px; border-radius:var(--v-radius,6px);
  background:var(--v-body); box-shadow:inset 0 0 0 1px var(--v-edge); overflow:hidden; }
.vessel .lid { position:absolute; left:0; right:0; top:0; height:var(--lid-h,11px);
  background:var(--v-lid); box-shadow:inset 0 -1px 0 var(--v-edge); }
.vessel .lid::after { content:''; position:absolute; left:50%; top:50%;
  transform:translate(-50%,-50%); width:var(--tab-w,0); height:var(--tab-h,0);
  border-radius:999px; border:1.5px solid var(--v-tab,transparent); }
.vessel .vat { position:absolute; left:0; right:0; top:var(--lid-h,11px); bottom:0; overflow:hidden; }
.vessel .liquid { position:absolute; left:0; right:0; bottom:0; height:0;
  background:var(--v-liquid); transition:height .55s cubic-bezier(.22,.61,.36,1); }
.vessel .foam { position:absolute; left:0; right:0; top:0; height:var(--foam-h,0);
  background:var(--v-foam,transparent); border-radius:var(--foam-r,0); }
/* Пузырьки — только у текущей главы: пять кипящих разом это слишком много движения */
.vessel.here .liquid::after { content:''; position:absolute; inset:0; opacity:.55;
  background-image:
    radial-gradient(circle, var(--v-bubble,transparent) 1.4px, transparent 1.8px),
    radial-gradient(circle, var(--v-bubble,transparent) 1px, transparent 1.4px);
  background-size:15px 23px, 21px 31px; animation:vessel-rise 3.4s linear infinite; }
@keyframes vessel-rise { to { background-position:0 -23px, 0 -31px; } }
/* Полнота видна формой, а не только цветом: жидкость достаёт до крышки */
.vessel.full .lid { filter:brightness(1.18); }
@media (prefers-reduced-motion: reduce) {
  .vessel .liquid { transition:none; }
  .vessel.here .liquid::after { animation:none; }
}
[data-skin="classic"] { --v-body:var(--ifm-color-emphasis-200); --v-edge:var(--ifm-color-emphasis-300);
  --v-liquid:var(--ifm-color-primary); --v-lid:var(--ifm-color-emphasis-500);
  --v-ink:#fff; --v-bubble:rgba(255,255,255,.75); --foam-h:0; --lid-h:9px; --v-radius:6px; }
[data-skin="cola"] { --v-body:linear-gradient(180deg,#e7e7ec,#c9c9d2); --v-edge:rgba(0,0,0,.25);
  --v-liquid:linear-gradient(180deg,#5a2d14,#2b1206); --v-lid:linear-gradient(180deg,#d8d8de,#a9a9b4);
  --v-ink:#fff; --v-bubble:rgba(255,255,255,.6); --tab-w:13px; --tab-h:7px;
  --v-tab:rgba(0,0,0,.45); --foam-h:0; --lid-h:12px; --v-radius:3px; }
[data-skin="energy"] { --v-body:linear-gradient(180deg,#232334,#14141f); --v-edge:rgba(182,255,46,.4);
  --v-liquid:linear-gradient(180deg,#d4ff4f,#7ad900); --v-lid:linear-gradient(180deg,#b6ff2e,#6fae00);
  --v-ink:#14210a; --v-bubble:rgba(255,255,255,.85); --tab-w:12px; --tab-h:6px;
  --v-tab:rgba(0,0,0,.5); --foam-h:0; --lid-h:13px; --v-radius:3px; }
/* На узком экране подпись помещается только у текущей главы */
@media (max-width: 560px) {
  .vs-slot .vs-cap { display:none; }
  .vs-slot.here .vs-cap { display:-webkit-box; }
}
```

И правила окна — префикс `vs-` обязателен, иначе столкнутся с `trainers.css`:

```css
.vs { display:flex; flex-direction:column; gap:14px; }
.vs-win { display:flex; align-items:stretch; gap:8px; }
.vs-arrow { flex:none; width:32px; border:1px solid var(--ifm-color-emphasis-300);
  border-radius:8px; background:var(--ifm-background-surface-color);
  color:var(--ifm-color-emphasis-700); font-size:1.1rem; cursor:pointer; }
.vs-arrow:disabled { opacity:.35; cursor:default; }
.vs-arrow:hover:not(:disabled) { border-color:var(--ifm-color-primary); color:var(--ifm-color-primary); }
.vs-slots { flex:1; display:flex; gap:7px; min-width:0; }
.vs-slot { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.vs-slot .vessel { display:block; }
.vs-cap { font-size:.72rem; color:var(--ifm-color-emphasis-600); text-align:center;
  line-height:1.25; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2;
  -webkit-box-orient:vertical; }
.vs-slot.here .vs-cap { color:var(--ifm-font-color-base); font-weight:600; }
.vs-pc { position:absolute; inset:auto 0 5px 0; text-align:center;
  font:600 .72rem var(--ifm-font-family-monospace); color:var(--v-ink);
  font-variant-numeric:tabular-nums; text-shadow:0 1px 2px rgba(0,0,0,.35); }
.vs-minirow { display:flex; align-items:center; gap:10px; }
.vs-edge { font-size:.74rem; color:var(--ifm-color-emphasis-600); flex:none; }
.vs-mini { position:relative; flex:1; display:flex; gap:1.5px; height:12px; min-width:0;
  cursor:grab; touch-action:none; }
.vs-mini:active { cursor:grabbing; }
.vs-mini i { flex:1; min-width:2px; background:var(--ifm-color-emphasis-300); border-radius:2px; }
.vs-mini i.part, .vs-mini i.full { background:var(--v-liquid); }
.vs-mini i.part { opacity:.5; }
.vs-view { position:absolute; top:-5px; bottom:-5px; border:2px solid var(--ifm-font-color-base);
  border-radius:5px; background:color-mix(in srgb, var(--ifm-font-color-base) 8%, transparent);
  pointer-events:none; transition:left .3s cubic-bezier(.22,.61,.36,1), width .3s cubic-bezier(.22,.61,.36,1); }
@media (prefers-reduced-motion: reduce) { .vs-view { transition:none; } }
```

- [ ] **Шаг 4: написать компонент**

Создать `src/components/VesselStrip.tsx`:

```tsx
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { fillOf } from '../lib/chapterFill';
import './vessels.css';

const WINDOW = 5;

export type StripChapter = { id: string; title: string; path: string };

export default function VesselStrip({
  chapters,
  currentId,
}: {
  chapters: StripChapter[];
  currentId: string | null;
}): React.ReactElement | null {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const total = chapters.length;
  const win = Math.min(WINDOW, total);
  const currentIndex = Math.max(0, chapters.findIndex((c) => c.id === currentId));
  const clamp = (s: number) => Math.max(0, Math.min(Math.round(s), total - win));
  const [start, setStart] = useState(() => clamp(currentIndex - Math.floor(win / 2)));
  const [pinned, setPinned] = useState(false);

  // Пока окно не двигали руками, оно следует за текущей главой.
  useEffect(() => {
    if (!pinned) setStart(clamp(currentIndex - Math.floor(win / 2)));
  }, [currentIndex, win, pinned]);

  if (total === 0) return null;

  const shown = chapters.slice(start, start + win);
  const href = (c: StripChapter) => `/docs/${c.path.replace(/\.mdx?$/, '')}`;

  const moveTo = (s: number) => {
    setPinned(true);
    setStart(clamp(s));
  };

  return (
    <div className="vs">
      <div className="vs-win">
        <button
          className="vs-arrow"
          type="button"
          aria-label="Предыдущие главы"
          disabled={start === 0}
          onClick={() => moveTo(start - win)}
        >
          ‹
        </button>
        <div className="vs-slots">
          {shown.map((c) => {
            const pct = Math.round(fillOf(c.id) * 100);
            const cls = ['vs-slot', c.id === currentId ? 'here' : ''].join(' ').trim();
            const vcls = [
              'vessel',
              pct === 100 ? 'full' : '',
              c.id === currentId && pct > 0 && pct < 100 ? 'here' : '',
            ].join(' ').trim();
            return (
              <div className={cls} key={c.id}>
                <Link className={vcls} to={href(c)} title={c.title} data-testid="vessel">
                  <span className="lid" />
                  <span className="vat">
                    <i className="liquid" style={{ height: pct + '%' }}>
                      <i className="foam" />
                    </i>
                  </span>
                  <span className="vs-pc">{pct > 0 && pct < 100 ? pct + '%' : ''}</span>
                </Link>
                <span className="vs-cap" data-testid="cap">{c.title}</span>
              </div>
            );
          })}
        </div>
        <button
          className="vs-arrow"
          type="button"
          aria-label="Следующие главы"
          disabled={start + win >= total}
          onClick={() => moveTo(start + win)}
        >
          ›
        </button>
      </div>

      <div className="vs-minirow">
        <span className="vs-edge">начало</span>
        <div className="vs-mini" aria-hidden="true">
          {chapters.map((c) => {
            const f = fillOf(c.id);
            return <i key={c.id} className={f >= 1 ? 'full' : f > 0 ? 'part' : ''} />;
          })}
          <div
            className="vs-view"
            data-testid="view"
            style={{ left: (start / total) * 100 + '%', width: (win / total) * 100 + '%' }}
          />
        </div>
        <span className="vs-edge">конец</span>
      </div>
    </div>
  );
}
```

Перетаскивание рамки добавляется в задаче 5, когда компонент уже стоит на странице:
в тестах jsdom не даёт настоящих pointer-событий, и проверять его придётся руками.

- [ ] **Шаг 5: прогнать тесты**

Команда: `npx vitest run src/components/VesselStrip.test.tsx`
Ожидаем: PASS, 5 тестов.

- [ ] **Шаг 6: коммит**

```bash
git add src/components/VesselStrip.tsx src/components/VesselStrip.test.tsx src/components/vessels.css
git commit -m "Сосуды: окно из пяти глав и полоса всего трека

Глава рисуется сосудом с крышкой и наполняется по мере прохождения. Показываются
не все главы, а пять ближайших: на телефоне 29 делений давали по девять пикселей
на главу, уровень было не разглядеть. Под окном весь трек тонкой строкой с
рамкой — иначе окно близоруко и непонятно, сколько осталось.

Оформление задаётся переменными на data-skin: разметка одна, тем три."
```

---

### Задача 4: карточка «Продолжить»

**Файлы:**
- Создать: `src/components/ContinueCard.tsx`
- Создать: `src/components/ContinueCard.test.tsx`

**Интерфейсы:**
- Использует: `fillOf` из задачи 1.
- Отдаёт: `export default function ContinueCard({ chapter }: { chapter: { id: string; title: string; path: string } | null })`.

- [ ] **Шаг 1: написать падающий тест**

```tsx
import { render, screen } from '@testing-library/react';
import { store } from '../lib/store';
import ContinueCard from './ContinueCard';
import knowledgeMap from '../data/knowledge-map.json';

type Totals = { sections: number; quizzes: number; trainers: number };
const ch = { id: 'typing', title: 'Печать и клавиатура', path: 'foundation/typing.mdx' };

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('показывает главу, процент и ссылку', () => {
  const t = (knowledgeMap as { id: string; totals: Totals }[]).find((e) => e.id === 'typing')!.totals;
  for (let i = 0; i < t.sections; i += 1) store.setSectionRead('typing', 's' + i);
  render(<ContinueCard chapter={ch} />);
  const pct = Math.round((t.sections / (t.sections + t.quizzes)) * 100);
  expect(screen.getByText('Печать и клавиатура')).toBeTruthy();
  expect(screen.getByText(pct + '%')).toBeTruthy();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/docs/foundation/typing');
});

test('трек пройден — вместо главы так и написано', () => {
  render(<ContinueCard chapter={null} />);
  expect(screen.getByText('Трек пройден')).toBeTruthy();
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/components/ContinueCard.test.tsx`
Ожидаем: FAIL, `Failed to resolve import "./ContinueCard"`.

- [ ] **Шаг 3: написать компонент**

```tsx
import React, { useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { fillOf } from '../lib/chapterFill';
import './vessels.css';

export default function ContinueCard({
  chapter,
}: {
  chapter: { id: string; title: string; path: string } | null;
}): React.ReactElement {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  if (!chapter) {
    return (
      <section className="vs-now">
        <span className="vs-now-k">Готово</span>
        <span className="vs-now-t">Трек пройден</span>
      </section>
    );
  }

  const pct = Math.round(fillOf(chapter.id) * 100);
  return (
    <section className="vs-now">
      <span className="vs-now-k">Продолжить</span>
      <span className="vs-now-t">{chapter.title}</span>
      <div className="vs-now-line">
        <span className="vs-now-track">
          <i className="vs-now-fill" style={{ width: pct + '%' }} />
        </span>
        <span className="vs-now-pc">{pct}%</span>
      </div>
      <Link className="button button--primary" to={`/docs/${chapter.path.replace(/\.mdx?$/, '')}`}>
        Читать дальше
      </Link>
    </section>
  );
}
```

Дописать в `vessels.css`:

```css
.vs-now { border:1px solid var(--ifm-color-primary); border-radius:14px; padding:16px;
  background:color-mix(in srgb, var(--ifm-color-primary) 10%, transparent);
  display:flex; flex-direction:column; gap:11px; margin-bottom:18px; }
.vs-now-k { font-size:.74rem; letter-spacing:.1em; text-transform:uppercase;
  color:var(--ifm-color-primary); font-weight:700; }
.vs-now-t { font-family:var(--ifm-heading-font-family); font-weight:700; font-size:1.18rem; }
.vs-now-line { display:flex; align-items:center; gap:11px; }
.vs-now-track { flex:1; height:8px; border-radius:999px;
  background:var(--ifm-background-surface-color); overflow:hidden;
  box-shadow:inset 0 0 0 1px var(--ifm-color-emphasis-300); }
.vs-now-fill { display:block; height:100%; border-radius:999px; background:var(--v-liquid);
  transition:width .5s cubic-bezier(.22,.61,.36,1); }
.vs-now-pc { font:600 .82rem var(--ifm-font-family-monospace); font-variant-numeric:tabular-nums;
  color:var(--ifm-color-emphasis-700); flex:none; }
.vs-now .button { align-self:flex-start; }
@media (prefers-reduced-motion: reduce) { .vs-now-fill { transition:none; } }
```

- [ ] **Шаг 4: прогнать тесты**

Команда: `npx vitest run src/components/ContinueCard.test.tsx`
Ожидаем: PASS, 2 теста.

- [ ] **Шаг 5: коммит**

```bash
git add src/components/ContinueCard.tsx src/components/ContinueCard.test.tsx src/components/vessels.css
git commit -m "Карточка «Продолжить» со своей полосой

Первое, что видно на Маршруте: какую главу читать и насколько она пройдена."
```

---

### Задача 5: пересобрать страницу Маршрута

**Файлы:**
- Изменить: `src/pages/route.tsx`
- Изменить: `src/components/RouteList.tsx` (убрать основной список, матрицу, галочки)
- Изменить: `src/components/RouteList.test.tsx`
- Изменить: `src/components/VesselStrip.tsx` (перетаскивание рамки)

**Интерфейсы:**
- Использует: `VesselStrip`, `ContinueCard`, `nextChapter`, `fullCount`.
- `RouteList` продолжает отдавать `type Entry` — его импортируют `route.tsx` и тесты.

- [ ] **Шаг 1: собрать страницу**

`src/pages/route.tsx`:

```tsx
import React, { useState, useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { TrackBanner } from '../components/ChapterCover';
import RouteList, { type Entry } from '../components/RouteList';
import VesselStrip from '../components/VesselStrip';
import ContinueCard from '../components/ContinueCard';
import DailyChallenge from '../components/DailyChallenge';
import { store } from '../lib/store';
import { nextChapter } from '../lib/chapterFill';
import map from '../data/knowledge-map.json';
import pages from '../data/pages.json';
import tracks from '../data/tracks.json';

type TrackDef = { dir: string; label: string; position: number };

export default function Route(): React.ReactElement {
  const [track, setTrack] = useState<'мобилка' | 'блокчейн'>('мобилка');
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const all = map as Entry[];
  const main = all.filter(
    (e) => (e.audience === 'все' || e.audience === track) && e.level !== 'углубление',
  );
  const nextId = nextChapter(main.map((e) => e.id));
  const current = main.find((e) => e.id === nextId) ?? null;

  const banners = [...(tracks as TrackDef[])].sort((a, b) => a.position - b.position);

  return (
    <Layout title="Маршрут" description="Где я и что читать дальше">
      <main className="container margin-vert--lg">
        <h1>Маршрут</h1>
        <div className="track-banners">
          {banners.map((t) => (
            <Link key={t.dir} to={`/docs/${t.dir}`}>
              <TrackBanner track={t.dir} mini />
            </Link>
          ))}
        </div>

        <div className="rl-track-switch">
          <button
            className={`button button--${track === 'мобилка' ? 'primary' : 'secondary'}`}
            onClick={() => setTrack('мобилка')}
          >
            Мобилка
          </button>
          <button
            className={`button button--${track === 'блокчейн' ? 'primary' : 'secondary'}`}
            onClick={() => setTrack('блокчейн')}
          >
            Блокчейн
          </button>
        </div>

        <ContinueCard chapter={current} />
        <VesselStrip chapters={main} currentId={nextId} />

        <DailyChallenge />
        <RouteList map={all} pages={pages as Entry[]} track={track} />
      </main>
    </Layout>
  );
}
```

**Внимание:** `TrackBanner` принимает `track` как строковый литерал. Если его тип
объявлен союзом `'foundation' | 'mobile' | 'blockchain'`, расширить союз до
`string` в `ChapterCover.tsx` — иначе `tsc` упадёт на `advanced`.

- [ ] **Шаг 2: выпотрошить `RouteList`**

Из `src/components/RouteList.tsx` удалить целиком:
`PROGRESS_KEY`, `loadProgress`, `saveProgress`, `statusOf`, `STATUS_LABEL`, `LEVELS`,
основной список `chapters`, блок замка `onLockedClick`, таблицу `<h2>Матрица</h2>`.

Оставить: фильтр по треку, секцию «Отдельные темы», секцию «Страницы». Экспорт
`type Entry` сохранить.

**`Certificate` переезжает в `route.tsx`** — он считает по основному списку глав,
а тот из `RouteList` уходит. В `route.tsx` добавить под `VesselStrip`:

```tsx
import Certificate from '../components/Certificate';
import { fullCount, nextChapter } from '../lib/chapterFill';

// …в разметке, после <VesselStrip …/>
<Certificate track={track} total={main.length} passed={fullCount(main.map((e) => e.id))} />
```

- [ ] **Шаг 3: почистить тесты `RouteList`**

Удалить тесты `progress checkbox persists` и все, что писали в `pgk-progress`.
Оставшиеся тесты проверяют фильтр по треку, ссылки и блок «Страницы».

- [ ] **Шаг 4: добавить перетаскивание рамки**

В `VesselStrip.tsx` добавить обработчики на `.vs-mini`:

```tsx
  const miniRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const startFromEvent = (clientX: number) => {
    const r = miniRef.current?.getBoundingClientRect();
    if (!r) return start;
    return clamp((clientX - r.left) / r.width * total - win / 2);
  };
```

и на самом `<div className="vs-mini">`:

```tsx
        ref={miniRef}
        role="slider"
        tabIndex={0}
        aria-label="Положение окна на треке"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={start + 1}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          moveTo(startFromEvent(e.clientX));
        }}
        onPointerMove={(e) => dragging && moveTo(startFromEvent(e.clientX))}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          moveTo(start + (e.key === 'ArrowRight' ? 1 : -1));
        }}
```

Убрать с него `aria-hidden="true"` — элемент стал управляемым.

- [ ] **Шаг 5: прогнать всё**

Команда: `npx vitest run && npm run typecheck`
Ожидаем: PASS, ошибок типов нет.

- [ ] **Шаг 6: коммит**

```bash
git add src/pages/route.tsx src/components/RouteList.tsx src/components/RouteList.test.tsx src/components/VesselStrip.tsx
git commit -m "Маршрут отвечает «где я и что дальше»

Страница начинается с того, что читать сейчас, дальше пять ближайших глав
сосудами и весь трек полосой. Убраны: список из 65 строк, повторявший меню
Учебника; матрица, где на 65 строк приходилась одна галочка в каждой, а у
блокчейна столбец «челлендж» пуст целиком; ручная отметка «пройдено» — прогресс
считается по делам.

Баннеры треков строятся из tracks.json: раньше их было прибито три, и «Отдельные
темы» в них не попадали."
```

---

### Задача 6: снять «Расписание тренировок» и «Учебник»

**Файлы:**
- Изменить: `src/pages/route.tsx` (убрать `TrainingSchedule`)
- Изменить: `docusaurus.config.ts` (убрать список «Учебник»)

Компонент `TrainingSchedule.tsx` из репозитория **не удалять** — только снять со
страницы. Вернуть дешевле, чем написать заново.

- [ ] **Шаг 1: убрать расписание со страницы**

В `src/pages/route.tsx` удалить импорт `TrainingSchedule` и его вызов.
(В версии из задачи 5 он уже не добавлен — проверить, что его действительно нет.)

- [ ] **Шаг 2: убрать «Учебник» из шапки**

В `docusaurus.config.ts` удалить весь блок:

```ts
        {
          type: 'dropdown',
          label: 'Учебник',
          position: 'left',
          items: TRACKS.map((t) => ({
            to: trackLink(t),
            label: t.nav ? `${t.label} — ${t.nav}` : t.label,
          })),
        },
```

`TRACKS` и `trackLink` НЕ удалять — их использует подвал.

- [ ] **Шаг 3: проверить, что треки не потерялись**

Команда: `npm run build`, затем

```bash
node -e "
const h=require('fs').readFileSync('build/route/index.html','utf8');
for (const d of ['foundation','mobile','blockchain','advanced'])
  console.log(d, h.includes('/docs/'+d) ? 'есть' : 'ПОТЕРЯН');
"
```

Ожидаем: все четыре — «есть».

- [ ] **Шаг 4: коммит**

```bash
git add src/pages/route.tsx docusaurus.config.ts
git commit -m "Из шапки убран «Учебник», с Маршрута — расписание тренировок

«Учебник» вёл к тем же главам, что Маршрут и левое меню. Остаётся Маршрут: у него
есть работа. Треки при этом доезжаем баннером с Маршрута, карточкой на главной и
ссылкой в подвале — проверено на собранных страницах.

Расписание снято со страницы, но оставлено в репозитории: к прогрессу оно
отношения не имеет, а вернуть дешевле, чем написать заново."
```

---

### Задача 7: выбор скина в кабинете

**Файлы:**
- Изменить: `src/lib/store.ts` (добавить `prefs.setSkin` / `prefs.getSkin`)
- Изменить: `src/pages/account.tsx` (переключатель)
- Изменить: `src/theme/Root.tsx` (проставить `data-skin` на корень)
- Создать: `src/lib/skin.test.tsx`

**Интерфейсы:**
- Отдаёт: `store.prefs.getSkin(): 'classic' | 'cola' | 'energy'`, `store.prefs.setSkin(v): void`.

- [ ] **Шаг 1: написать падающий тест**

```tsx
import { store } from './store';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('по умолчанию скин classic', () => {
  expect(store.prefs.getSkin()).toBe('classic');
});

test('выбор запоминается', () => {
  store.prefs.setSkin('cola');
  expect(store.prefs.getSkin()).toBe('cola');
});

test('мусор в хранилище не ломает страницу', () => {
  localStorage.setItem('pgk-skin', '"чепуха"');
  expect(store.prefs.getSkin()).toBe('classic');
});
```

- [ ] **Шаг 2: убедиться, что тест падает**

Команда: `npx vitest run src/lib/skin.test.tsx`
Ожидаем: FAIL, `store.prefs.getSkin is not a function`.

- [ ] **Шаг 3: добавить в store**

```ts
const SKINS = ['classic', 'cola', 'energy'] as const;
export type Skin = (typeof SKINS)[number];

function getSkin(): Skin {
  try {
    const raw = localStorage.getItem('pgk-skin');
    return (SKINS as readonly string[]).includes(raw ?? '') ? (raw as Skin) : 'classic';
  } catch {
    return 'classic';
  }
}

function setSkin(v: Skin): void {
  try { localStorage.setItem('pgk-skin', v); } catch { /* приватный режим */ }
  notify();
}
```

Добавить `setSkin, getSkin` в объект `prefs` экспорта `store`.
**Внимание:** значение пишется голой строкой, без `JSON.stringify` — тест с мусором
кладёт `'"чепуха"'` и проверяет, что такое значение отбрасывается.

- [ ] **Шаг 4: проставить скин на корень**

В `src/theme/Root.tsx` добавить:

```tsx
  useEffect(() => {
    document.documentElement.dataset.skin = store.prefs.getSkin();
    return store.subscribe(() => {
      document.documentElement.dataset.skin = store.prefs.getSkin();
    });
  }, []);
```

- [ ] **Шаг 5: переключатель в кабинете**

В `src/pages/account.tsx` добавить компонент:

```tsx
const SKIN_LABELS: [Skin, string][] = [
  ['classic', 'Без темы'],
  ['cola', 'Кола'],
  ['energy', 'Энергетик'],
];

function SkinPicker() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const active = store.prefs.getSkin();
  return (
    <section className="ac-card">
      <h2>Оформление полосы</h2>
      <div className="ac-skins">
        {SKIN_LABELS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className="ac-skin"
            data-skin={value}
            aria-pressed={active === value}
            onClick={() => store.prefs.setSkin(value)}
          >
            <i className="ac-skin-chip" />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
```

и в `vessels.css`:

```css
.ac-skins { display:flex; flex-wrap:wrap; gap:9px; }
.ac-skin { display:flex; align-items:center; gap:8px; padding:7px 13px 7px 8px;
  border:1px solid var(--ifm-color-emphasis-300); border-radius:999px;
  background:var(--ifm-background-surface-color); color:var(--ifm-color-emphasis-700);
  font-weight:600; font-size:.85rem; cursor:pointer; }
.ac-skin[aria-pressed="true"] { border-color:var(--ifm-color-primary); color:var(--ifm-font-color-base); }
.ac-skin-chip { width:15px; height:20px; border-radius:3px; flex:none; position:relative;
  overflow:hidden; background:var(--v-body); box-shadow:inset 0 0 0 1px var(--v-edge); }
.ac-skin-chip::before { content:''; position:absolute; left:0; right:0; bottom:0;
  height:62%; background:var(--v-liquid); }
.ac-skin-chip::after { content:''; position:absolute; left:0; right:0; top:0;
  height:4px; background:var(--v-lid); }
```

`data-skin` на самой кнопке обязателен: без него все три образца показали бы
текущую тему, а не свою.

- [ ] **Шаг 6: прогнать тесты**

Команда: `npx vitest run src/lib/skin.test.tsx && npm run typecheck`
Ожидаем: PASS.

- [ ] **Шаг 7: коммит**

```bash
git add src/lib/store.ts src/lib/skin.test.tsx src/pages/account.tsx src/theme/Root.tsx
git commit -m "Оформление сосудов выбирается в кабинете

Три темы: без темы, кола, энергетик. Скин — это набор переменных на data-skin,
разметка одна на все, так что новая тема стоит девяти строк CSS."
```

---

### Задача 8: гейты, проверка руками, публикация

- [ ] **Шаг 1: все пять гейтов**

```bash
npm run kmap && npm test && npm run typecheck && npx vitest run && npm run build
```

Ожидаем: kmap пишет два файла, `npm test` — 21 тест, typecheck молчит, vitest весь
зелёный, build — SUCCESS.

- [ ] **Шаг 2: проверка в браузере**

Поднять `preview_start {name:"edu-build"}` (статика поверх `build/` на 8795) и пройти
по списку. **Ни один гейт этого не ловит:**

- ширина 1280 и 375: страница не едет вбок, сосуд не уже 30 пикселей;
- все три скина переключаются и меняют вид сосудов;
- рамка перетаскивается до обоих краёв, стрелки упираются и гаснут;
- каждый из четырёх треков открывается баннером с Маршрута;
- светлая и тёмная тема.

**Помнить про ловушки среды:** скрытая панель браузера не проигрывает CSS-переходы,
и `getComputedStyle` навсегда отдаёт стартовое значение — проверять, отключив
`transition`. Локальный статический сервер отдаёт файлы без `charset`, из-за чего
кириллица читается как латиница и замеры ширины врут.

- [ ] **Шаг 3: греп на секреты и пуш**

```bash
git diff origin/main | grep -nEi "(-----BEGIN|api[_-]?key|secret|passw|ssh-rsa|AKIA|xox[baprs]-)"
git push origin main
```

- [ ] **Шаг 4: дождаться деплоя и проверить прод**

```bash
gh run list --limit 1 --json headSha,status,conclusion
curl -sL -o /dev/null -w '%{http_code}\n' https://edu.alspio.com/route/
```

- [ ] **Шаг 5: обновить CLAUDE.md**

Дописать в §4 карту новых файлов, в §7 — что ручной отметки прогресса больше нет,
и в §11 две ловушки среды из шага 2.

```bash
git add CLAUDE.md && git commit -m "Инструкция: Маршрут на сосудах, ловушки браузерной панели"
git push origin main
```
