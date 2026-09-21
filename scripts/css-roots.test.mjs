// Корневые классы компонентов не должны пересекаться.
//
// За один день это выстрелило трижды. Последний раз — плашка игрового слоя
// заняла класс `.gb`, которым уже назывался корень Конструктора тренажёров:
// `white-space: nowrap` из плашки растянул <section> Конструктора на 1886 px,
// и весь /gym поехал вбок. Ни один гейт этого не видел: TypeScript про CSS не
// знает, vitest рендерит компонент в одиночку, сборка проходит.
//
// Ловим два случая:
//   1) один и тот же селектор-класс объявлен в двух разных CSS-файлах;
//   2) один и тот же КОРЕНЬ пространства имён (класс без дефиса: gb, tc, cc)
//      носят два разных компонента. Общие классы с дефисом — наоборот, норма:
//      .ac-card и .keys-kbd переиспользуют десятком страниц намеренно.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Осознанное переиспользование: наследник берёт вид предка целиком.
const РАЗРЕШЕНО = new Set([
  'ce', // BlockExam переиспользует вид ChapterExam
  'chsrc', // ChapterVideos переиспользует вид ChapterSources
  'cc', // CommunityCatalog сидит на корне ChmodCalc (досталось в наследство)
]);

const файлы = [];
(function обойти(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) обойти(p);
    else файлы.push(p);
  }
})('src');

/** Класс → файлы, где он объявлен селектором ровно из одного класса. */
function объявления() {
  const m = new Map();
  for (const f of файлы.filter((f) => f.endsWith('.css'))) {
    for (const [, cls] of fs.readFileSync(f, 'utf8').matchAll(/^\.([a-z][a-z0-9-]*)\s*\{/gm)) {
      if (!m.has(cls)) m.set(cls, new Set());
      m.get(cls).add(path.basename(f));
    }
  }
  return m;
}

test('один класс не объявлен в двух CSS-файлах', () => {
  const дубли = [...объявления()]
    .filter(([cls, s]) => s.size > 1 && !РАЗРЕШЕНО.has(cls))
    .map(([cls, s]) => `.${cls}: ${[...s].join(' и ')}`);
  assert.deepEqual(дубли, [], `один класс правят из двух файлов:\n${дубли.join('\n')}`);
});

const КОРЕНЬ = /^[a-z][a-z0-9]{0,4}$/;

test('корень пространства имён не носят два компонента', () => {
  const корни = объявления();
  const носят = new Map();
  for (const f of файлы.filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/className=(?:"([a-z][\w -]*)"|\{`([a-z][\w -]*))/g)) {
      // Смотреть ТОЛЬКО первый класс мало: `.gb` сидел вторым в
      // "gym-section gb" и страж его не увидел.
      for (const cls of (m[1] ?? m[2]).trim().split(/\s+/)) {
        if (!КОРЕНЬ.test(cls) || !корни.has(cls) || РАЗРЕШЕНО.has(cls)) continue;
        if (!носят.has(cls)) носят.set(cls, new Set());
        носят.get(cls).add(path.basename(f));
      }
    }
  }
  const спор = [...носят]
    .filter(([, s]) => s.size > 1)
    .map(([cls, s]) => `.${cls}: ${[...s].join(' и ')}`);
  assert.deepEqual(спор, [], `корень занят дважды:\n${спор.join('\n')}`);
});
