import { store } from './store';
import { TARGET_GROUPS } from './targets';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('адрес предлагается тремя вариантами: общее, главы, страницы', () => {
  expect(TARGET_GROUPS.map((g) => g.label)).toEqual(['Общее', 'Главы', 'Страницы']);
});

test('в «Общем» ровно один вариант с пустым значением', () => {
  expect(TARGET_GROUPS[0].options).toHaveLength(1);
  expect(TARGET_GROUPS[0].options[0].value).toBe('');
});

test('главы и страницы не пересекаются и не пусты', () => {
  const chapters = TARGET_GROUPS[1].options.map((o) => o.value);
  const pages = TARGET_GROUPS[2].options.map((o) => o.value);
  expect(chapters.length).toBeGreaterThan(100);
  expect(pages.length).toBeGreaterThan(0);
  expect(chapters.filter((c) => pages.includes(c))).toEqual([]);
});
