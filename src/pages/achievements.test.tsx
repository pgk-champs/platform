import { LOOKS } from '../lib/looks';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, sortAchievements } from '../lib/achievements';
import { readFileSync } from 'fs';

test('рамка «выдано» не съедается правилом редкости', () => {
  // Правила .ach-card-rare / -epic задают border ШОРТКАТОМ и лежат ниже в
  // файле, поэтому перебивали border-color состояния «выдано»: у 17 редких и
  // 10 эпических из 43 рамка не появлялась никогда. Лечится специфичностью,
  // и это надо стеречь — оба правила легко разъедутся снова.
  const css = readFileSync('src/components/trainers.css', 'utf8');
  const on = /\.ach-card\.ach-card-on\s*\{/.test(css);
  expect(on).toBe(true);
  // и одноклассового варианта, который проигрывал, больше нет
  expect(/^\.ach-card-on\s*\{/m.test(css)).toBe(false);
});

test('карточки идут категориями, внутри — от обычного к эпическому', () => {
  // В объявлении лестница редкости ломалась у «обучения», «языка» и «серий»,
  // и сетка читалась как случайная.
  const порядок = { обычное: 0, редкое: 1, эпическое: 2 } as const;
  const list = sortAchievements(ACHIEVEMENTS);
  expect(list).toHaveLength(ACHIEVEMENTS.length);
  for (let i = 1; i < list.length; i += 1) {
    const прошлая = ACHIEVEMENT_CATEGORIES.indexOf(list[i - 1].category);
    const эта = ACHIEVEMENT_CATEGORIES.indexOf(list[i].category);
    expect(эта).toBeGreaterThanOrEqual(прошлая);
    if (эта === прошлая) {
      expect(порядок[list[i].rarity]).toBeGreaterThanOrEqual(порядок[list[i - 1].rarity]);
    }
  }
});

test('каждый облик обещан на карточке своего достижения', () => {
  // Награда, о которой узнаёшь уже получив, ни к чему не ведёт. Подпись
  // берётся из реестра обликов — разойтись с реальностью ей нечем.
  const byAch = new Map(LOOKS.filter((l) => l.achievement).map((l) => [l.achievement!, l.name]));
  expect(byAch.size).toBeGreaterThanOrEqual(5);
  for (const id of byAch.keys()) {
    expect(ACHIEVEMENTS.some((a) => a.id === id), `нет достижения ${id}`).toBe(true);
  }
});
