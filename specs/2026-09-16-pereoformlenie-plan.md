# Переоформление — план реализации

> **Для исполнителя:** задачи идут по порядку, каждая заканчивается коммитом.
> Спецификация: `specs/2026-09-16-pereoformlenie.md`.
> Готовый кусок токенов: `specs/assets/2026-09-16-custom-tokens.patch.css`.

**Цель:** платформа перестаёт выглядеть шаблоном документации за счёт
заполнения тех токенов, которые сегодня берут дефолт Infima, и переверстки
четырёх своих страниц и шапки главы. Ни сервер, ни модель прогресса, ни сборка
не трогаются.

**Устройство:** в слое стилей 2099 обращений `var(--*)` против 54 хардкод-цветов
— он перекрашивается значениями. Слой иллюстраций (`figures/`, 242 файла,
1447 hex) живёт своей жизнью и в эту работу не входит. Рычаг — `--ifm-*` (1841 обращение) и `--pgk-*`
(225), третьего набора имён не заводим. Серая шкала `--ifm-color-emphasis-*`
(523 обращения) и `--ifm-global-radius` (205) сегодня не переопределены вовсе:
их заполнение и есть главная правка. Контраст не на глаз — его стережёт тест.

**Стек:** Docusaurus 3.10.2 + TypeScript, vitest для компонентов,
`node --test` для скриптов и сервера.

## Общие ограничения

- **План и спека лежат в `specs/`, не в `docs/`** — `docs/` это сам сайт,
  `kmap` требует фронтматтер от каждого файла внутри и уронит сборку.
- **Коммит не упоминает Claude, AI и соавторство.** Сообщение по-русски.
- **Перед каждым коммитом:**
  `git diff HEAD | grep -nEi "(-----BEGIN|api[_-]?key|secret|passw|ssh-rsa|AKIA|xox[baprs]-)"`
- **Перед пушем — пять гейтов:** `npm run kmap`, `npm test`, `npm run typecheck`,
  `npx vitest run`, `npm run build`. Пуш в `main` = публикация на прод.
- **`npm test` гоняет `scripts/*.test.mjs` и `server/*.test.mjs`.** Новый тест
  контраста кладётся в `scripts/`, иначе он не попадёт в гейт.
- **Тесты компонентов только `src/**/*.test.tsx`** — `.test.ts` не подхватится.
- **`onBrokenLinks: 'throw'`** — любая новая ссылка обязана вести на
  существующий адрес, иначе сборка падает для всех.
- **Новых имён токенов не заводим там, где есть свои.** `--pgk-text-success` и
  `--pgk-text-danger` — это уже готовая пара «сошлось / не сошлось».
- **`--ifm-color-primary` и его семь оттенков не трогаем** — подобраны по
  контрасту, причина расписана в шапке `custom.css`.
- **Каждая пара «текст на фоне» проходит 4.5:1 на ОБЕИХ поверхностях** — и на
  фоне страницы, и на карточке. Проверять худший случай, а не средний.
- **Обе темы равноправны.** Светлая не приложение к тёмной.
- **Телефон 375px:** горизонтальной прокрутки нет ни на одной поверхности.

---

### Задача 1: Тест контраста — страж, который ставится ДО палитры

Без него любая следующая правка цвета проверяется глазами, а глаз ошибается.
Тест читает значения прямо из `custom.css`, поэтому стережёт и будущие правки.

**Файлы:**
- Создать: `scripts/contrast.test.mjs`
- Прочитать: `src/css/custom.css`

**Интерфейсы:**
- Отдаёт: ничего в код. Гейт в `npm test`.

- [ ] **Шаг 1: Написать падающий тест**

```js
// scripts/contrast.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/css/custom.css', import.meta.url), 'utf8');

// Значения берём из файла, а не дублируем: тест обязан падать, когда
// поменяли палитру, а не когда забыли поменять тест.
function block(selector) {
  const i = css.indexOf(selector);
  assert.ok(i >= 0, `в custom.css нет блока ${selector}`);
  const open = css.indexOf('{', i);
  let depth = 0, end = open;
  for (let k = open; k < css.length; k += 1) {
    if (css[k] === '{') depth += 1;
    if (css[k] === '}') { depth -= 1; if (!depth) { end = k; break; } }
  }
  return css.slice(open, end);
}
function token(scope, name) {
  const m = block(scope).match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  assert.ok(m, `в ${scope} не задан ${name}`);
  return m[1].trim();
}

const lin = (c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
function luminance(hex) {
  const h = hex.replace('#', '');
  assert.match(h, /^[0-9a-fA-F]{6}$/, `не hex: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Тёмная тема: фон страницы и поверхность карточки.
const DARK = [':root', "[data-theme='dark']"];
for (const [scope, bgName, surfName] of [
  [DARK[1], '--ifm-background-color', '--ifm-background-surface-color'],
]) {
  for (const role of ['--ifm-color-emphasis-900', '--ifm-color-emphasis-700', '--ifm-color-emphasis-600']) {
    test(`тёмная: ${role} читается на фоне и на карточке`, () => {
      const fg = token(scope, role);
      for (const bg of [token(scope, bgName), token(scope, surfName)]) {
        const r = ratio(fg, bg);
        assert.ok(r >= 4.5, `${role} ${fg} на ${bg} даёт ${r.toFixed(2)}:1, нужно 4.5`);
      }
    });
  }
  test('тёмная: медь «твоё» читается на обеих поверхностях', () => {
    const fg = token(scope, '--pgk-you');
    for (const bg of [token(scope, bgName), token(scope, surfName)]) {
      assert.ok(ratio(fg, bg) >= 4.5, `--pgk-you ${fg} на ${bg}: ${ratio(fg, bg).toFixed(2)}:1`);
    }
  });
  test('тёмная: цвета треков различимы на фоне', () => {
    for (const t of ['mobile', 'blockchain', 'foundation', 'advanced']) {
      const fg = token(scope, `--pgk-track-${t}`);
      const r = ratio(fg, token(scope, bgName));
      assert.ok(r >= 4.5, `--pgk-track-${t} ${fg}: ${r.toFixed(2)}:1`);
    }
  });
}

// Светлая тема: фон белый.
test('светлая: шкала и медь читаются на белом', () => {
  const white = '#ffffff';
  for (const role of ['--ifm-color-emphasis-900', '--ifm-color-emphasis-700', '--ifm-color-emphasis-600', '--pgk-you']) {
    const fg = token(':root', role);
    const r = ratio(fg, white);
    assert.ok(r >= 4.5, `${role} ${fg} на белом: ${r.toFixed(2)}:1`);
  }
});

test('серая шкала задана в обеих темах целиком', () => {
  for (const scope of DARK) {
    for (const n of [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]) {
      token(scope, `--ifm-color-emphasis-${n}`);
    }
  }
});

test('--ifm-global-radius задан и меньше карточного', () => {
  const g = parseFloat(token(':root', '--ifm-global-radius'));
  const c = parseFloat(token(':root', '--ifm-card-border-radius'));
  assert.ok(g < c, `радиус мелочи ${g} должен быть меньше карточного ${c}`);
});
```

- [ ] **Шаг 2: Прогнать и убедиться, что падает**

Запустить: `node --test scripts/contrast.test.mjs`
Ожидается: FAIL, `в :root не задан --ifm-color-emphasis-900` — токенов ещё нет.

- [ ] **Шаг 3: Коммит падающего стража отдельно НЕ делаем**

Переходим к задаче 2 и коммитим тест вместе с палитрой: красный тест в `main`
уронит деплой для всех.

---

### Задача 2: Серая шкала, радиус и шесть новых токенов

**Файлы:**
- Изменить: `src/css/custom.css` (секция «1. Цвет», блоки `:root` и `[data-theme='dark']`)
- Источник: `specs/assets/2026-09-16-custom-tokens.patch.css`

**Интерфейсы:**
- Отдаёт: `--ifm-color-emphasis-0…1000` в обеих темах, `--ifm-global-radius`,
  `--pgk-you`, `--pgk-you-soft`, `--pgk-track-{foundation,mobile,blockchain,advanced}`.
  Ими пользуются задачи 4–9.

- [ ] **Шаг 1: Перенести токены в `custom.css`**

Вставить содержимое разделов 1–3 патча в существующие блоки `:root` и
`[data-theme='dark']` секции «1. Цвет». Блоки НЕ дублировать — дописывать в те,
что уже есть. Комментарии из патча перенести: они объясняют, почему значения
именно такие.

Ключевые значения (полностью — в патче):

```css
:root {
  --ifm-color-emphasis-300: #d8dfec;
  --ifm-color-emphasis-600: #666f83;
  --ifm-color-emphasis-700: #525c72;
  --ifm-color-emphasis-900: #11151f;
  --ifm-global-radius: 8px;
  --pgk-you: #b4550f;
  --pgk-track-mobile: #0e7f76;
  --pgk-track-blockchain: #7e3fbf;
}
[data-theme='dark'] {
  --ifm-color-emphasis-300: #232a3c;
  --ifm-color-emphasis-600: #78829a;
  --ifm-color-emphasis-700: #9aa3b8;
  --ifm-color-emphasis-900: #e8ebf2;
  --ifm-background-color: #0b0d13;
  --ifm-background-surface-color: #141826;
  --pgk-you: #ff9a3c;
  --pgk-track-mobile: #4fd1c5;
  --pgk-track-blockchain: #c084fc;
}
```

- [ ] **Шаг 2: Прогнать тест контраста**

Запустить: `node --test scripts/contrast.test.mjs`
Ожидается: PASS, все тесты зелёные.

- [ ] **Шаг 3: Убедиться, что ничего не развалилось**

Запустить: `npx vitest run && npm run build`
Ожидается: тесты зелёные, сборка проходит.

- [ ] **Шаг 4: Посмотреть глазами обе темы**

Запустить: `npm start`, открыть `/`, `/route`, `/docs/mobile/state-events`,
переключить тему в навбаре. Проверить: рамки видны, приглушённый текст
читается, скругление мелочи заметно мельче карточного.

- [ ] **Шаг 5: Коммит**

```bash
git add scripts/contrast.test.mjs src/css/custom.css
git commit -m "Своя серая шкала и радиус вместо дефолтов Infima, медь и цвета треков

Шкала emphasis-* и global-radius не были переопределены ни разу, а к ним
465 и 206 обращений — платформа брала нейтраль и скругление из коробки.
Контраст закреплён тестом: каждая роль проверяется на фоне и на карточке."
```

---

### Задача 3: Мелочи, которые стыдно оставлять

Четыре независимые правки, одна проверка. Разбивать на отдельные коммиты
незачем: ни одна не может провалиться отдельно от других.

**Файлы:**
- Изменить: `docusaurus.config.ts:89` (og:image), `:161` (подвал), `headTags` (шрифт)
- Изменить: `src/css/custom.css:108` (`--pgk-font-display`)
- Изменить: `src/components/trainers.css:8166-8167` (селектор `.fig-media`)
- Создать: `static/img/og-edu.png` (1200×630)

- [ ] **Шаг 1: `canvas` в `.fig-media`**

Было (`trainers.css:8166`):

```css
.fig-media svg,
.fig-media img {
```

Стало:

```css
.fig-media svg,
.fig-media canvas,
.fig-media img {
```

Собственных правил у `.fig-media` нет, поэтому неоформленный `<canvas>`
получает не нулевую, а **свою внутреннюю величину 300×150** — то есть схема
встанет маленьким прямоугольником посреди колонки и не потянется по ширине.
`Figure.tsx` уже принимает `children` (тип на строке 266) и рендерит их внутри
`.fig-media` (строка 296), поэтому нового компонента не нужно — нужна ширина.

- [ ] **Шаг 2: Выкинуть Unbounded**

В `src/css/custom.css`:

```css
--pgk-font-display: 'Onest', 'Golos Text', system-ui, sans-serif;
```

В `docusaurus.config.ts`, в `headTags`, из ссылки на Google Fonts убрать
`family=Unbounded:wght@600;700&`. Остальные три семейства не трогать.

- [ ] **Шаг 3: Подвал и og:image**

`docusaurus.config.ts:161`:

```ts
copyright: `© ${new Date().getFullYear()} Поволжский колледж · 137 глав · 228 тренажёров`,
```

`docusaurus.config.ts:89`:

```ts
image: 'img/og-edu.png',
```

Картинку 1200×630 положить в `static/img/og-edu.png`. Стоковый
`docusaurus-social-card.jpg` удалить, чтобы к нему не вернулись.

- [ ] **Шаг 4: Проверить**

Запустить: `npm run build && grep -r "docusaurus-social-card\|Built with Docusaurus" build/ | head`
Ожидается: сборка проходит, `grep` ничего не находит.

- [ ] **Шаг 5: Коммит**

```bash
git add docusaurus.config.ts src/css/custom.css src/components/trainers.css static/img/
git rm static/img/docusaurus-social-card.jpg
git commit -m "Свои картинка в превью, подвал и витринный шрифт; canvas в .fig-media

В og:image был стоковый динозавр Docusaurus, в подвале — «Built with
Docusaurus». Unbounded качался на каждой странице ради шести мест.
canvas в .fig-media нужен, чтобы объёмная схема в главе получила ширину."
```

---

### Задача 4: Карта прогресса вместо строки процентов

**Файлы:**
- Изменить: `src/components/ChapterProgress.tsx`
- Изменить: `src/components/ChapterProgress.test.tsx`
- Изменить: `src/components/trainers.css:1291-1340` (блок `.cp-*`)
- Проверить: `src/components/ChapterTour.tsx` — он монтируется отсюда и
  привязан к разметке виджета

**Интерфейсы:**
- Потребляет: `store`, `levelForXp`, `knowledge-map.json` — всё как сейчас,
  сигнатура `ChapterProgressProps` НЕ меняется.
- Отдаёт: разметку с `.cp-grid`, `.cp-cell`, `.cp-cell--on`, `.cp-row`.

- [ ] **Шаг 1: Переписать тест под новую разметку**

Форма карты продиктована данными: квизов в главе 4–6 (минимум 3), а тренажёр
**ровно один у 100 глав из 137** и отсутствует у 11. Поэтому у ряда три
поведения, и тест обязан покрыть все три — иначе сто глав получат «сетку» из
одной ячейки.

```tsx
test('квизы: ряд делений по числу квизов главы', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={5} totalTrainers={3} />,
  );
  expect(container.querySelectorAll('.cp-row--quizzes .cp-cell').length).toBe(5);
  expect(container.querySelectorAll('.cp-cell--on').length).toBe(0);
});

test('квизы: закрашено ровно столько, сколько сделано', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={5} totalTrainers={3} />,
  );
  act(() => {
    store.markQuizDone('typing', 'q1', { correct: 3, total: 3 });
    store.markQuizDone('typing', 'q2', { correct: 1, total: 3 });
  });
  expect(container.querySelectorAll('.cp-row--quizzes .cp-cell--on').length).toBe(2);
});

test('один тренажёр — не сетка, а состояние (так у 100 глав из 137)', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={4} totalTrainers={1} />,
  );
  expect(container.querySelectorAll('.cp-row--trainers .cp-cell').length).toBe(0);
  expect(container.querySelector('.cp-state')?.textContent).toContain('не пройден');
  act(() => { store.markTrainerDone('typing', 't1', { cpm: 100, accuracy: 90 }); });
  expect(container.querySelector('.cp-state')?.textContent).toContain('пройден');
});

test('нет тренажёров — ряда нет вовсе (так у 11 глав)', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={4} totalTrainers={0} />,
  );
  expect(container.querySelector('.cp-row--trainers')).toBeNull();
});

test('три и больше тренажёров — ряд делений', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={4} totalTrainers={6} />,
  );
  expect(container.querySelectorAll('.cp-row--trainers .cp-cell').length).toBe(6);
});

test('не показывает больше знаменателя при рассинхроне с mdx', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={3} totalTrainers={3} />,
  );
  act(() => {
    store.markQuizDone('typing', 'q1', { correct: 1, total: 1 });
    store.markQuizDone('typing', 'q2', { correct: 1, total: 1 });
    store.markQuizDone('typing', 'q3', { correct: 1, total: 1 });
    store.markQuizDone('typing', 'q4', { correct: 1, total: 1 });
  });
  expect(container.querySelectorAll('.cp-row--quizzes .cp-cell--on').length).toBe(3);
});
```

- [ ] **Шаг 2: Прогнать и убедиться, что падает**

Запустить: `npx vitest run src/components/ChapterProgress.test.tsx`
Ожидается: FAIL, `.cp-row--quizzes .cp-cell` не найдены.

- [ ] **Шаг 3: Переписать разметку виджета**

Расчёт `readSections`, `quizzesDone`, `trainersDone`, `pct`, `lvl` оставить
как есть, включая `Math.min` — он страхует от рассинхрона с mdx. Уровень и его
полосу **сохранить**: это четвёртый пункт нынешней строки, и терять его нельзя.
Меняется только форма показа:

```tsx
function Row({ kind, label, done, total }: {
  kind: 'quizzes' | 'trainers'; label: string; done: number; total: number;
}) {
  if (total === 0) return null;                    // 11 глав без тренажёров
  return (
    <div className={`cp-row cp-row--${kind}`}>
      <span className="cp-row-label">{label}</span>
      {total <= 2 ? (
        // Ровно один тренажёр — у 100 глав из 137. Сетка из одной ячейки
        // читается как поломка, поэтому здесь состояние словом.
        <span className={`cp-state${done >= total ? ' cp-state--on' : ''}`}>
          {done >= total ? 'пройден' : 'не пройден'}
        </span>
      ) : (
        <span className="cp-grid" role="img" aria-label={`${done} из ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`cp-cell${i < done ? ' cp-cell--on' : ''}`} />
          ))}
        </span>
      )}
      <span className="cp-row-num">{done}/{total}</span>
    </div>
  );
}
```

и в самом компоненте вместо строки `.cp-item`:

```tsx
<div className="cp" role="status">
  <div className="cp-row cp-row--read">
    <span className="cp-row-label">Прочитано</span>
    <span className="cp-read-bar" aria-hidden="true">
      <span className="cp-read-fill" style={{ width: `${pct}%` }} />
    </span>
    <span className="cp-row-num">{pct}%</span>
  </div>
  <Row kind="quizzes" label="Квизы" done={quizzesDone} total={totalQuizzes} />
  <Row kind="trainers" label="Тренажёры" done={trainersDone} total={totalTrainers} />
  <div className="cp-level" title={lvl.maxLevel ? 'Максимальный уровень' : `До уровня ${lvl.level + 1}: ${lvl.xpToNext} XP`}>
    Уровень {lvl.level} · {lvl.title}
    <span className="cp-level-bar">
      <span className="cp-level-fill" style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
    </span>
  </div>
</div>
```

Блок `mounted` / `EMPTY_PROGRESS` не трогать: он лечит hydration mismatch, и
причина расписана в комментарии.

- [ ] **Шаг 4: Стили делений**

В `trainers.css`, рядом с существующим блоком `.cp-*`:

```css
.cp-grid { display: flex; gap: 3px; flex: 1; }
.cp-cell {
  flex: 1 1 0; min-width: 6px; height: 8px;
  border-radius: 2px;
  background: var(--ifm-color-emphasis-300);
  transition: background var(--pgk-dur-fast) var(--pgk-ease);
}
.cp-cell--on { background: var(--pgk-you); }
.cp-state {
  flex: 1; font-size: .82rem; color: var(--ifm-color-emphasis-600);
}
.cp-state--on { color: var(--pgk-you); }
.cp-row { display: flex; align-items: center; gap: 10px; }
.cp-row-label { font-size: .82rem; color: var(--ifm-color-emphasis-700); min-width: 8ch; }
.cp-row-num {
  font-family: var(--ifm-font-family-monospace);
  font-variant-numeric: tabular-nums;
  font-size: .82rem; color: var(--ifm-color-emphasis-600); min-width: 4ch; text-align: right;
}
```

Медь здесь — не украшение: это тот самый разбор ролей из спеки, закрашенное
деление обязано отличаться от структурного индиго.

- [ ] **Шаг 5: Прогнать тесты**

Запустить: `npx vitest run src/components/ChapterProgress.test.tsx src/components/ChapterTour.test.tsx`
Ожидается: PASS обоих. Если `ChapterTour` упал — он ищет старые селекторы,
поправить его шаги тура в этом же коммите.

- [ ] **Шаг 6: Коммит**

```bash
git add src/components/ChapterProgress.tsx src/components/ChapterProgress.test.tsx \
        src/components/ChapterTour.tsx src/components/trainers.css
git commit -m "Прогресс главы делениями вместо строки процентов

Строка «Прочитано 0% · Квизы 0/6 · Тренажёры 0/6» не давала увидеть, сколько
осталось. Деления показывают это сразу; закрашенное — медью, потому что это
твой прогресс, а не структура. Модель прогресса не менялась, chapterFill
остаётся единственным местом счёта."
```

---

### Задача 5: Обложка главы

**Файлы:**
- Изменить: `src/components/ChapterCover.tsx`
- Изменить: `src/components/ChapterCover.test.tsx`

- [ ] **Шаг 1: Дописать тест на чип трека**

```tsx
test('показывает чип трека его цветом', () => {
  const { container } = render(<ChapterCover chapterId="state-events" />);
  const chip = container.querySelector('.cc-chip');
  expect(chip).toBeTruthy();
  expect(chip?.className).toContain('cc-chip--mobile');
});
```

- [ ] **Шаг 2: Прогнать, убедиться что падает**

Запустить: `npx vitest run src/components/ChapterCover.test.tsx`
Ожидается: FAIL, `.cc-chip` не найден.

- [ ] **Шаг 3: Добавить чип и перестроить обложку**

Трек, номер и заголовок уже берутся из карты знаний — руками их не
перечислять. Сам арт обложки **не трогаем**: он рисуется своими константами
`ACCENT`/`DARK` = `var(--ifm-color-primary-lightest/darkest)`, а индиго мы не
меняем, так что 137 обложек остаются как есть. Добавляется только чип с
классом по треку:

```tsx
<span className={`cc-chip cc-chip--${track}`}>{TRACK_LABEL[track]}</span>
```

```css
.cc-chip {
  font-family: var(--ifm-font-family-monospace);
  font-size: .68rem; letter-spacing: .1em; text-transform: uppercase;
  padding: 4px 8px; border-radius: var(--ifm-global-radius);
  border: 1px solid currentColor;
}
.cc-chip--mobile { color: var(--pgk-track-mobile); }
.cc-chip--blockchain { color: var(--pgk-track-blockchain); }
.cc-chip--foundation { color: var(--pgk-track-foundation); }
.cc-chip--advanced { color: var(--pgk-track-advanced); }
```

**Внимание:** у `ChapterCover` свои константы `ACCENT/DARK/INK/SOFT/MONO` и
**нет `FADE`** — он только в `figures/kit.tsx`. Тест ширины заголовка уже
дважды падал с «FADE is not defined». Новых цветов в арт не вводить.

Заодно удалить из `custom.css:53-54` мёртвую пару `--pgk-art-accent` и
`--pgk-art-ink`: у них ноль использований во всём `src`, и они создают ложное
впечатление, что арт обложек управляется токенами.

- [ ] **Шаг 4: Прогнать тесты**

Запустить: `npx vitest run src/components/ChapterCover.test.tsx`
Ожидается: PASS.

- [ ] **Шаг 5: Коммит**

```bash
git add src/components/ChapterCover.tsx src/components/ChapterCover.test.tsx src/components/trainers.css
git commit -m "Чип трека на обложке главы

Трек отличался только подписью; теперь у него свой цвет — в чипе, не заливкой."
```

---

### Задача 6: Главная

**Файлы:**
- Изменить: `src/pages/index.tsx`, `src/components/HomeHero.tsx`
- Изменить: `src/components/HomeHero.test.tsx`
- Изменить: `src/components/trainers.css` (блок `.hh-*`)

- [ ] **Шаг 1: Тест на три числа и на то, что они настоящие**

```tsx
test('показывает настоящие числа платформы', () => {
  render(<HomeHero />);
  expect(screen.getByText('137')).toBeTruthy();
  expect(screen.getByText('228')).toBeTruthy();
});
```

- [ ] **Шаг 2: Прогнать, убедиться что падает или уже проходит**

Запустить: `npx vitest run src/components/HomeHero.test.tsx`

- [ ] **Шаг 3: Перестроить первый экран**

Слева формулировка и два действия, справа место под объёмный разбор (задача 9;
до неё там стоит существующая иллюстрация). Экран **не на всю высоту** —
`min-height` не задавать, следующая секция обязана быть видна.

Числа — строкой с разделителями-волосками, не тремя одинаковыми плитками:

```css
.hh-nums { display: flex; flex-wrap: wrap; gap: 0; }
.hh-num { padding: 0 24px; border-left: 1px solid var(--ifm-color-emphasis-300); }
.hh-num:first-child { padding-left: 0; border-left: 0; }
.hh-num b {
  display: block; font-family: var(--pgk-font-display);
  font-size: 2.6rem; font-variant-numeric: tabular-nums;
}
```

Треки — карточками разного веса: Мобилка и Блокчейн крупные (46 и 72 главы),
Фундамент и Отдельные темы узкие. Цвет трека — в чипе и тонкой полосе сверху,
заливкой не использовать.

- [ ] **Шаг 4: Проверить телефон**

Запустить: `npm start`, открыть `/` в окне 375px.
Ожидается: горизонтальной прокрутки нет, числа переносятся, треки в колонку.

- [ ] **Шаг 5: Коммит**

```bash
git add src/pages/index.tsx src/components/HomeHero.tsx src/components/HomeHero.test.tsx src/components/trainers.css
git commit -m "Главная: числа строкой, треки разного веса по объёму"
```

---

### Задача 7: Маршрут

**Файлы:**
- Изменить: `src/pages/route.tsx`, `src/components/VesselStrip.tsx`
- Изменить: `src/components/VesselStrip.test.tsx`

- [ ] **Шаг 1: Тест на то, что пустой прогресс не выглядит поломкой**

Сегодня непройденные сосуды читаются как незагрузившиеся картинки. Это и
чиним.

```tsx
test('непройденная глава помечена как непройденная, а не пуста', () => {
  const { container } = render(<VesselStrip track="mobile" />);
  const cells = container.querySelectorAll('.vs-cell');
  expect(cells.length).toBeGreaterThan(0);
  expect(container.querySelectorAll('.vs-cell--todo').length).toBeGreaterThan(0);
});
```

- [ ] **Шаг 2: Прогнать, убедиться что падает**

Запустить: `npx vitest run src/components/VesselStrip.test.tsx`

- [ ] **Шаг 3: Лента трека целиком**

46 глав Мобилки одной непрерывной линией, сгруппированные по блокам.
Пройденные — медью, текущая выделена, будущие — `--ifm-color-emphasis-300`
(видимые, а не пустые), экзамены по блокам — узлы другой формы.

На узком экране лента переносится по блокам, **горизонтальной прокрутки
быть не должно**.

- [ ] **Шаг 4: Прогнать тесты и посмотреть**

Запустить: `npx vitest run src/components/VesselStrip.test.tsx`
Ожидается: PASS. Открыть `/route` на 375px — переносится, не прокручивается.

- [ ] **Шаг 5: Коммит**

```bash
git add src/pages/route.tsx src/components/VesselStrip.tsx src/components/VesselStrip.test.tsx src/components/trainers.css
git commit -m "Маршрут: лента трека по блокам вместо пустых сосудов"
```

---

### Задача 8: Зал и Сообщество

**Файлы:**
- Изменить: `src/pages/gym.tsx`, `src/components/GymCatalog.tsx`
- Изменить: `src/components/CommunityCatalog.tsx`

- [ ] **Шаг 1: Тест: тренажёр открывается в карточке**

```tsx
test('карточка тренажёра раскрывается на месте, без отдельной страницы', () => {
  const { container } = render(<GymCatalog />);
  expect(container.querySelector('.gc-card details')).toBeTruthy();
  expect(container.querySelector('a[href^="/gym/"]')).toBeNull();
});
```

- [ ] **Шаг 2: Прогнать, убедиться что падает**

Запустить: `npx vitest run src/components/GymCatalog.test.tsx`

- [ ] **Шаг 3: Переверстать зал сеткой карточек**

У карточки: название, к какой главе, чем полезен, метка типа. Раскрытие —
на месте. Нативный треугольник `<details>` спрятать, поставить свою метку:

```css
.gc-card summary { list-style: none; cursor: pointer; }
.gc-card summary::-webkit-details-marker { display: none; }
```

Сохранить честную строку, что результаты зала не идут в прогресс глав.

Оставить в вёрстке место под работы сообщества: элемент с `position: relative`
и заданным соотношением сторон. До Мастерской там кураторская схема, вёрстка
потом не меняется.

- [ ] **Шаг 4: Прогнать**

Запустить: `npx vitest run src/components/GymCatalog.test.tsx src/components/CommunityCatalog.test.tsx`
Ожидается: PASS.

- [ ] **Шаг 5: Коммит**

```bash
git add src/pages/gym.tsx src/components/GymCatalog.tsx src/components/CommunityCatalog.tsx src/components/trainers.css
git commit -m "Зал: тренажёр открывается в карточке, а не за треугольником"
```

---

### Задача 9: Объёмный разбор экрана Compose

**Файлы:**
- Создать: `src/components/ComposeLayers.tsx`
- Создать: `src/components/ComposeLayers.test.tsx`
- Изменить: `src/components/HomeHero.tsx` (вставка)
- Изменить: `src/components/trainers.css` (блок `.cl-*`)

**Интерфейсы:**
- Отдаёт: `export default function ComposeLayers(): JSX.Element` — без пропсов.

- [ ] **Шаг 1: Тест на предохранители**

```tsx
test('слои видны и подписаны без всякого движения', () => {
  const { container } = render(<ComposeLayers />);
  const layers = container.querySelectorAll('.cl-layer');
  expect(layers.length).toBe(6);
  expect(screen.getByText('LazyColumn')).toBeTruthy();
});

test('ничего не спрятано за opacity:0 в ожидании прокрутки', () => {
  const { container } = render(<ComposeLayers />);
  container.querySelectorAll('.cl-layer').forEach((el) => {
    expect((el as HTMLElement).style.opacity).not.toBe('0');
  });
});
```

- [ ] **Шаг 2: Прогнать, убедиться что падает**

Запустить: `npx vitest run src/components/ComposeLayers.test.tsx`
Ожидается: FAIL, модуля нет.

- [ ] **Шаг 3: Написать компонент**

Шесть плоскостей по оси Z: `Scaffold · TopAppBar · LazyColumn · Card · Row ·
Text`. Нижняя — собранный экран, верхние — каркасы. Только CSS 3D:
`perspective` на контейнере, `transform-style: preserve-3d`, `translateZ` на
слоях. Ни WebGL, ни библиотек.

Предохранители обязательны:

```css
@media (hover: none) { .cl-deck { animation: cl-sway 14s ease-in-out infinite; } }
@media (prefers-reduced-motion: reduce) {
  .cl-deck { animation: none; }           /* разложено и неподвижно — самый информативный кадр */
}
```

- [ ] **Шаг 4: Вставить в первый экран главной**

В `HomeHero.tsx`, в правую колонку. SSR не трогает CSS 3D, `BrowserOnly` здесь
не нужен — компонент не обращается к `window`.

- [ ] **Шаг 5: Прогнать и посмотреть**

Запустить: `npx vitest run src/components/ComposeLayers.test.tsx && npm run build`
Ожидается: PASS, сборка проходит. Открыть `/` и включить в системе «уменьшить
движение» — слои обязаны остаться разложенными и читаемыми.

- [ ] **Шаг 6: Коммит**

```bash
git add src/components/ComposeLayers.tsx src/components/ComposeLayers.test.tsx \
        src/components/HomeHero.tsx src/components/trainers.css
git commit -m "Первый экран: разбор экрана Compose по слоям

Объём здесь объясняет, а не украшает: вложенность Compose видна только в
перспективе. CSS 3D, без библиотек; при «уменьшить движение» слои стоят."
```

---

### Задача 10: Swizzle обвязки главы

Дорогая и необязательная. До неё переоформление уже выложено и выглядит
законченным — если `DocSidebar` окажется дороже, чем выглядит, остановиться
здесь не стыдно.

**Файлы:**
- Создать: `src/theme/DocItem/Paginator/index.tsx`
- Создать: `src/theme/DocSidebar/Desktop/Content/index.tsx`

- [ ] **Шаг 1: Сначала дешёвое — Paginator**

```bash
npm run swizzle @docusaurus/theme-classic DocItem/Paginator -- --eject --typescript
```

Переверстать переход к соседним главам: заголовок соседа, его номер, чип
трека. Проверить на `/docs/mobile/state-events` — соседи должны быть
«Первый экран Compose» и «Читаем макет».

- [ ] **Шаг 2: Проверить и закоммитить отдельно**

Запустить: `npm run typecheck && npm run build`

```bash
git add src/theme/DocItem/Paginator
git commit -m "Переход к соседним главам в новом виде"
```

- [ ] **Шаг 3: Теперь дорогое — боковая лента**

```bash
npm run swizzle @docusaurus/theme-classic DocSidebar/Desktop/Content -- --eject --typescript
```

Отметки пройденного из `store`, текущая глава медью, узлы экзаменов по блокам
заметной формой. Читать прогресс через `useSyncExternalStore(store.subscribe,
store.getVersion, () => 0)` и повторить приём с `mounted` из
`ChapterProgress`, иначе поймаете hydration mismatch на каждой главе.

- [ ] **Шаг 4: Проверить на сложных главах**

Открыть `/docs/blockchain/sol-libraries` (объёмная схема в тексте) и главу с
`BlockExam` в конце блока: у них самая сложная разметка.

Запустить: `npm run typecheck && npx vitest run && npm run build`

- [ ] **Шаг 5: Коммит**

```bash
git add src/theme/DocSidebar
git commit -m "Боковая лента трека: видно пройденное, текущую главу и экзамены"
```

---

## Самопроверка плана

**Покрытие спеки.** Серая шкала и радиус — задача 2. Шесть новых токенов —
задача 2, разводка ролей — задачи 4, 5, 7. Шрифт, подвал, og:image, `canvas` —
задача 3. Четыре свои страницы — задачи 6, 7, 8. Шапка главы — задачи 4, 5.
Объём — задача 9. Swizzle — задача 10. Место под Мастерскую — задача 8, шаг 3.
Контраст как правило — задача 1.

**Не покрыто намеренно:** кабинет, лидерборд, достижения и страницы наставника
новую палитру получают через токены (задача 2) и отдельной переверстки в этой
спеке не имеют. Слой иллюстраций (`figures/`, 242 файла, 1447 hex) и 137
обложек не трогаются вовсе — они самодостаточны и в эту работу не входят.

**Порядок безопасен:** после любой задачи можно остановиться и выложить.
Задача 1 не коммитится отдельно — красный тест в `main` уронит деплой всем.

---

## Итог на 17.09.2026

**Сделано:** задачи 1–3 (токены, радиус, мелочи), 4 (прогресс делениями),
5 (чип трека на обложке), 6 (главная), 7 (лента Маршрута), 9 (разбор Compose).

**Задача 8 закрыта иначе.** Зал переписан целиком по отдельной спеке
`2026-09-17-zal.md`: он показывает все 46 механик вместо одиннадцати, а не
переверстывает те же одиннадцать. Сообщество осталось без правки — каталог
переписан 16.09 уже на новых токенах, конкретных шагов план для него не давал.

**Задача 10 невыполнима как написана.** `DocItem/Paginator` не отдаётся
swizzle: из 79 компонентов темы его в списке нет вовсе (на диске в
`node_modules` он есть, наружу не выведен). `DocSidebar` отдаётся только на
оборачивание, eject помечен Unsafe. Ejectить неподдерживаемый компонент там,
где падение сборки блокирует публикацию всего сайта, — плохой размен ради
косметики. План сам это допускал: «остановиться здесь не стыдно».

**Чего план не знал, а оно вылезло:**

- `.cc-chip` из задачи 5 занят ДВАЖДЫ — чипами каталога сообщества и
  калькулятором chmod. Чип обложки назван `cov-track`, цвет трека вынесен в
  общие классы `trk-*`.
- Задача 7 предлагала красить пройденное в ленте медью — там цвет скина
  сосудов, отдельный язык, который так ломается. Не тронуто.
- Задача 7 предлагала пометить непройденные сосуды словом «не начата» — прямо
  против решения Олега «описание не нужно». Не сделано.
- Задача 9 описывала шесть плоскостей одной цепочкой. Это неправда про
  Compose: `TopAppBar` и `LazyColumn` — братья. Сделано деревом.
- Общий выключатель движения гасил длительность, но не задержку, а
  `.pgk-reveal` держит `opacity: 0` весь `animation-delay` (до 450 мс на первом
  экране). При «уменьшить движение» человек полсекунды смотрел на пустоту.
  Починено отдельным коммитом.
