// Достижение «Археолог» просит открыть N исторических врезок. Врезки лежат в
// главах, и до студента доходят не все: он видит фундамент плюс СВОЙ трек.
// При пороге 5 студенту блокчейна доставалось ровно пять врезок из восьми —
// то есть промахнуться мимо достижения было нельзя ни разу, тогда как
// студенту мобилки хватало пяти из семи.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const врезкиПоТрекам = () => {
  const счёт = {};
  const обойти = (dir, трек) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) обойти(p, трек ?? e.name);
      else if (/\.mdx?$/.test(e.name)) {
        const n = (fs.readFileSync(p, 'utf8').match(/<HistoryNote\b/g) || []).length;
        if (n) счёт[трек] = (счёт[трек] ?? 0) + n;
      }
    }
  };
  обойти('docs', null);
  return счёт;
};

test('у каждого трека есть запас врезок сверх порога «Археолога»', () => {
  const порог = Number(
    /historyOpened\.length >= (\d+)/.exec(fs.readFileSync('src/lib/achievements.ts', 'utf8'))?.[1],
  );
  assert.ok(Number.isFinite(порог), 'порог «Археолога» не нашёлся в achievements.ts');

  const счёт = врезкиПоТрекам();
  const фундамент = счёт.foundation ?? 0;
  const треки = Object.entries(счёт).filter(([t]) => t !== 'foundation');
  assert.ok(треки.length > 0, 'врезки есть только в фундаменте');

  for (const [трек, n] of треки) {
    const доступно = фундамент + n;
    assert.ok(
      доступно > порог,
      `${трек}: доступно ${доступно} врезок при пороге ${порог} — запаса нет, надо либо дописать врезки, либо снизить порог`,
    );
  }
});

test('в описании «Археолога» стоит то же число, что и в проверке', () => {
  const src = fs.readFileSync('src/lib/achievements.ts', 'utf8');
  const порог = /historyOpened\.length >= (\d+)/.exec(src)[1];
  const подпись = /desc: 'Открыт[оы] (\d+) историческ/.exec(src)?.[1];
  assert.equal(подпись, порог, 'подпись достижения разошлась с проверкой');
});
