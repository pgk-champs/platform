import { store } from './store';
import { fillOf, isFull, nextChapter, fullCount } from './chapterFill';
import knowledgeMap from '../data/knowledge-map.json';

type Totals = { sections: number; quizzes: number; trainers: number };
const totalsOf = (id: string) =>
  (knowledgeMap as { id: string; totals: Totals }[]).find((e) => e.id === id)!.totals;

/** Отмечает в store n секций и m ИДЕАЛЬНО пройденных проверок главы. */
function feed(id: string, sections: number, quizzes: number) {
  for (let i = 0; i < sections; i += 1) store.setSectionRead(id, 's' + i);
  for (let i = 0; i < quizzes; i += 1) store.markQuizDone(id, 'q' + i, { correct: 2, total: 2 });
}

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('нетронутая глава пуста', () => {
  expect(fillOf('typing')).toBe(0);
  expect(isFull('typing')).toBe(false);
});

test('все секции без проверок — своя доля, но не полнота', () => {
  const t = totalsOf('typing');
  feed('typing', t.sections, 0);
  expect(fillOf('typing')).toBeCloseTo(t.sections / (t.sections + t.quizzes), 5);
  expect(isFull('typing')).toBe(false);
});

test('всё прочитано и все проверки идеальны — сосуд полон', () => {
  const t = totalsOf('typing');
  feed('typing', t.sections, t.quizzes);
  expect(fillOf('typing')).toBe(1);
  expect(isFull('typing')).toBe(true);
});

test('проверка с ошибкой не засчитывается', () => {
  store.markQuizDone('typing', 'q0', { correct: 1, total: 2 });
  expect(fillOf('typing')).toBe(0);
});

test('главы нет в карте знаний — ноль, а не падение', () => {
  expect(fillOf('такой-главы-нет')).toBe(0);
});

test('дальше — начатая, а не следующая по порядку', () => {
  feed('typing', 3, 0);
  expect(nextChapter(['it-english', 'typing', 'linux-terminal'])).toBe('typing');
});

test('начатых нет — первая нетронутая по порядку списка', () => {
  expect(nextChapter(['it-english', 'typing'])).toBe('it-english');
});

test('все полны — дальше некуда', () => {
  const a = totalsOf('typing');
  const b = totalsOf('it-english');
  feed('typing', a.sections, a.quizzes);
  feed('it-english', b.sections, b.quizzes);
  expect(nextChapter(['typing', 'it-english'])).toBeNull();
  expect(fullCount(['typing', 'it-english'])).toBe(2);
});
