import { store } from './store';
import { ACHIEVEMENTS } from './achievements';
import { badgeState, badgeLabel } from './gameBadge';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('у новичка это приглашение, а не похвала', () => {
  const s = badgeState();
  expect(s.unlocked).toBe(0);
  expect(s.total).toBe(ACHIEVEMENTS.length);
  expect(s.total).toBeGreaterThan(40);
  expect(s.streak).toBe(0);
});

test('считает выданные достижения', () => {
  store.achievements.unlock('первый-квиз');
  store.achievements.unlock('квиз-на-100');
  expect(badgeState().unlocked).toBe(2);
});

test('подпись не поминает серию, пока её нет', () => {
  expect(badgeLabel({ unlocked: 3, total: 43, streak: 0 })).toBe('достижений 3 из 43');
  expect(badgeLabel({ unlocked: 3, total: 43, streak: 5 })).toBe('Серия 5, достижений 3 из 43');
});

test('уровень в индикатор не попадает', () => {
  // Осознанное решение: максимум берётся на четырёх главах из 137, и
  // показывать это число постоянно значило бы врать. Тест стережёт от
  // «давайте всё-таки добавим уровень».
  expect(Object.keys(badgeState()).sort()).toEqual(['streak', 'total', 'unlocked']);
});
