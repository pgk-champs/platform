import { plural } from './plural';

const glava = (n: number) => plural(n, 'глава', 'главы', 'глав');

test('единственное — только на 1, но не на 11', () => {
  expect(glava(1)).toBe('глава');
  expect(glava(21)).toBe('глава');
  expect(glava(101)).toBe('глава');
  expect(glava(11)).toBe('глав');
  expect(glava(111)).toBe('глав');
});

test('2-4 — своя форма, но не 12-14', () => {
  for (const n of [2, 3, 4, 22, 133, 1002]) expect(glava(n)).toBe('главы');
  for (const n of [12, 13, 14, 112]) expect(glava(n)).toBe('глав');
});

test('всё остальное — множественное', () => {
  for (const n of [0, 5, 9, 25, 100, 137, 228]) expect(glava(n)).toBe('глав');
});
