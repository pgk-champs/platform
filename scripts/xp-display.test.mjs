import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Страж честности чисел XP. store.addXp домножает на множитель серии (до ×1.5)
// и возвращает фактически начисленное. Компонент, печатающий базовую
// константу, расходится с тостом: за одно действие карточка писала «+20 XP», а
// тост «+30 XP». Показывать надо возврат addXp, а не константу.

const dir = 'src/components';
const files = fs
  .readdirSync(dir)
  .filter((n) => n.endsWith('.tsx') && !n.endsWith('.test.tsx'))
  .map((n) => path.join(dir, n));

test('компоненты печатают начисленное, а не константу XP', () => {
  const bad = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    // имена XP-констант, объявленных в самом файле
    const consts = [...src.matchAll(/^const ([A-Z_]*XP[A-Z_]*) = \d+;/gm)].map((m) => m[1]);
    if (consts.length === 0) continue;
    for (const c of consts) {
      // печать константы рядом со словом XP: `+${CONST} XP` или +{CONST} XP
      const shown = new RegExp(`\\+\\$?\\{${c}\\}?\\s*XP`).test(src);
      // допустимо только как запасной вариант рядом с фактическим: {xpGot || CONST}
      const fallback = new RegExp(`\\{\\s*xpGot\\s*\\|\\|\\s*${c}\\s*\\}`).test(src);
      if (shown && !fallback) bad.push(`${path.basename(f)}: печатает ${c}`);
    }
  }
  assert.deepEqual(bad, [], `числа XP разойдутся с тостом:\n${bad.join('\n')}`);
});
