import { LEVEL_TITLES, MAX_LEVEL, levelForXp, xpForLevel } from './levels';

test('level 1 starts at 0 XP with no progress required', () => {
  const info = levelForXp(0);
  expect(info.level).toBe(1);
  expect(info.title).toBe(LEVEL_TITLES[0]);
  expect(info.xpIntoLevel).toBe(0);
  expect(info.maxLevel).toBe(false);
});

test('thresholds are strictly increasing and level bumps exactly at each threshold', () => {
  for (let level = 2; level <= MAX_LEVEL; level += 1) {
    expect(xpForLevel(level)).toBeGreaterThan(xpForLevel(level - 1));
    const threshold = xpForLevel(level);
    expect(levelForXp(threshold - 1).level).toBe(level - 1);
    expect(levelForXp(threshold).level).toBe(level);
  }
});

test('progress climbs from 0 to just under 1 within a level bracket', () => {
  const start = xpForLevel(3);
  const end = xpForLevel(4);
  expect(levelForXp(start).progress).toBe(0);
  const mid = levelForXp(Math.floor((start + end) / 2));
  expect(mid.progress).toBeGreaterThan(0);
  expect(mid.progress).toBeLessThan(1);
});

test('xpToNext reaches 0 exactly at the next threshold', () => {
  const threshold = xpForLevel(5);
  expect(levelForXp(threshold - 1).xpToNext).toBeGreaterThan(0);
  expect(levelForXp(threshold).xpToNext).toBe(xpForLevel(6) - threshold);
});

test('caps at MAX_LEVEL / Чемпион — no level beyond the last title', () => {
  const info = levelForXp(xpForLevel(MAX_LEVEL) + 1_000_000);
  expect(info.level).toBe(MAX_LEVEL);
  expect(info.title).toBe('Чемпион');
  expect(info.maxLevel).toBe(true);
  expect(info.progress).toBe(1);
  expect(info.xpToNext).toBe(0);
});
