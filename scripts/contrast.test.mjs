// Контраст палитры проверяется числом, а не глазом.
//
// Значения тест читает прямо из custom.css, а не хранит у себя: он обязан
// падать, когда поменяли палитру, а не когда забыли поменять тест.
//
// Проверяются ОБЕ поверхности — фон страницы и карточка. Подписи чаще всего
// стоят внутри карточки, и если сверять только с фоном, худший случай
// проходит мимо проверки: так у нас служебный серый и оказался на 3.46:1.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/css/custom.css', import.meta.url), 'utf8');

/** Тело блока по его селектору, со счётом вложенных скобок. */
function block(selector) {
  const i = css.indexOf(selector);
  assert.ok(i >= 0, `в custom.css нет блока ${selector}`);
  const open = css.indexOf('{', i);
  let depth = 0;
  for (let k = open; k < css.length; k += 1) {
    if (css[k] === '{') depth += 1;
    if (css[k] === '}') {
      depth -= 1;
      if (!depth) return css.slice(open, k);
    }
  }
  assert.fail(`блок ${selector} не закрыт`);
}

function token(scope, name) {
  const m = block(scope).match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  assert.ok(m, `в ${scope} не задан ${name}`);
  return m[1].trim();
}

const lin = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

function luminance(hex) {
  const h = hex.replace('#', '');
  assert.match(h, /^[0-9a-fA-F]{6}$/, `ожидался шестизначный hex, пришло: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5; // мелкий текст
const DARK = "[data-theme='dark']";

// ——— тёмная тема ———

const darkGrounds = () => [
  ['фон страницы', token(DARK, '--ifm-background-color')],
  ['карточка', token(DARK, '--ifm-background-surface-color')],
  // Третья настоящая подложка: заливкой -200 сделаны титлбары, гаттеры и
  // дорожки внутри тренажёров. Без неё худший случай проходит мимо проверки.
  ['заливка -200', token(DARK, '--ifm-color-emphasis-200')],
];

for (const role of [
  '--ifm-color-emphasis-900',
  '--ifm-color-emphasis-700',
  '--ifm-color-emphasis-600',
]) {
  test(`тёмная: ${role} читается на обеих поверхностях`, () => {
    const fg = token(DARK, role);
    for (const [where, bg] of darkGrounds()) {
      const r = ratio(fg, bg);
      assert.ok(r >= AA, `${role} ${fg} на ${where} ${bg}: ${r.toFixed(2)}:1, нужно ${AA}`);
    }
  });
}

test('тёмная: медь «твоё» читается на обеих поверхностях', () => {
  const fg = token(DARK, '--pgk-you');
  for (const [where, bg] of darkGrounds()) {
    const r = ratio(fg, bg);
    assert.ok(r >= AA, `--pgk-you ${fg} на ${where} ${bg}: ${r.toFixed(2)}:1`);
  }
});

test('тёмная: цвета треков различимы на фоне', () => {
  const bg = token(DARK, '--ifm-background-color');
  for (const t of ['foundation', 'mobile', 'blockchain', 'advanced']) {
    const fg = token(DARK, `--pgk-track-${t}`);
    const r = ratio(fg, bg);
    assert.ok(r >= AA, `--pgk-track-${t} ${fg}: ${r.toFixed(2)}:1`);
  }
});

// ——— светлая тема ———

test('светлая: шкала, медь и треки читаются на белом', () => {
  const white = '#ffffff';
  const roles = [
    '--ifm-color-emphasis-900',
    '--ifm-color-emphasis-700',
    '--ifm-color-emphasis-600',
    '--pgk-you',
    '--pgk-track-foundation',
    '--pgk-track-mobile',
    '--pgk-track-blockchain',
    '--pgk-track-advanced',
  ];
  for (const role of roles) {
    const fg = token(':root', role);
    const r = ratio(fg, white);
    assert.ok(r >= AA, `${role} ${fg} на белом: ${r.toFixed(2)}:1`);
  }
});

// ——— полнота набора ———

test('серая шкала задана целиком в обеих темах', () => {
  for (const scope of [':root', DARK]) {
    for (const n of [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]) {
      token(scope, `--ifm-color-emphasis-${n}`);
    }
  }
});

test('медь и цвета треков заданы в обеих темах', () => {
  for (const scope of [':root', DARK]) {
    token(scope, '--pgk-you');
    for (const t of ['foundation', 'mobile', 'blockchain', 'advanced']) {
      token(scope, `--pgk-track-${t}`);
    }
  }
});

test('радиус мелочи задан и меньше карточного', () => {
  const small = parseFloat(token(':root', '--ifm-global-radius'));
  const card = parseFloat(token(':root', '--ifm-card-border-radius'));
  assert.ok(small < card, `радиус мелочи ${small} должен быть меньше карточного ${card}`);
});

test('мёртвых токенов арта в файле не осталось', () => {
  // --pgk-art-accent и --pgk-art-ink имели ноль использований во всём src
  // и создавали ложное впечатление, что арт обложек управляется токенами.
  assert.ok(!css.includes('--pgk-art-accent'), 'в custom.css остался --pgk-art-accent');
  assert.ok(!css.includes('--pgk-art-ink'), 'в custom.css остался --pgk-art-ink');
});


// ——— структура: не хуже, чем было ———
//
// Здесь закреплён урок, который чуть не уехал на прод. В тёмной теме Infima
// разворачивает шкалу (emphasis-N = gray-(1000−N)), поэтому её -300 это
// #606770 — СВЕТЛЕЕ подложки, и на нём держатся 100 рамок в trainers.css,
// границы таблиц, цитат и оглавления. Своя «красивая» шкала с тёмным низом
// собирается, проходит типизацию и все 907 компонентных тестов — и гасит
// каркас интерфейса, потому что ни один из них не смотрит на цвет.
//
// Числа ниже — что давала Infima к своему фону #1b1b1d. Новая шкала обязана
// быть НЕ ХУЖЕ: тон меняем, видимость не трогаем.

const INFIMA_DARK_BASELINE = {
  '--ifm-color-emphasis-200': 1.90,
  '--ifm-color-emphasis-300': 3.01,
  '--ifm-color-emphasis-400': 5.62,
  '--ifm-color-emphasis-500': 9.70,
};

test('структурные ступени тёмной темы не хуже дефолта Infima', () => {
  const ground = token(DARK, '--ifm-background-color');
  for (const [role, was] of Object.entries(INFIMA_DARK_BASELINE)) {
    const now = ratio(token(DARK, role), ground);
    assert.ok(
      now >= was - 0.05,
      `${role}: у Infima было ${was}:1 к фону, стало ${now.toFixed(2)}:1 — рамки и штрихи станут хуже видны`,
    );
  }
});

test('мёртвых токенов в палитре нет', () => {
  // Тот же критерий, по которому удалили --pgk-art-*: объявлен и не используется.
  assert.ok(!css.includes('--pgk-you-soft'), 'остался --pgk-you-soft, у него ноль использований');
});
