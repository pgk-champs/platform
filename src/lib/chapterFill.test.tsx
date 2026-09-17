import { store } from './store';
import { fillOf, isFull, nextChapter, fullCount } from './chapterFill';
import knowledgeMap from '../data/knowledge-map.json';

type Totals = { sections: number; quizzes: number; trainers: number };
const totalsOf = (id: string) =>
  (knowledgeMap as { id: string; totals: Totals }[]).find((e) => e.id === id)!.totals;

/** Отмечает n секций, m ИДЕАЛЬНО пройденных проверок и k тренажёров главы. */
function feed(id: string, sections: number, quizzes: number, trainers = 0) {
  for (let i = 0; i < sections; i += 1) store.setSectionRead(id, 's' + i);
  for (let i = 0; i < quizzes; i += 1) store.markQuizDone(id, 'q' + i, { correct: 2, total: 2 });
  for (let i = 0; i < trainers; i += 1) store.markTrainerDone(id, 'tr' + i, {});
}

/** Знаменатель сосуда: секции + проверки + тренажёры (с 17.09.2026). */
const denomOf = (id: string) => {
  const t = totalsOf(id);
  return t.sections + t.quizzes + t.trainers;
};

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
  expect(fillOf('typing')).toBeCloseTo(t.sections / denomOf('typing'), 5);
  expect(isFull('typing')).toBe(false);
});

test('всё прочитано, проверки идеальны и тренажёры пройдены — сосуд полон', () => {
  const t = totalsOf('typing');
  feed('typing', t.sections, t.quizzes, t.trainers);
  expect(fillOf('typing')).toBe(1);
  expect(isFull('typing')).toBe(true);
});

test('тренажёры не пройдены — до крышки не хватает ровно их доли', () => {
  const t = totalsOf('typing');
  expect(t.trainers).toBeGreaterThan(0);
  feed('typing', t.sections, t.quizzes);
  expect(isFull('typing')).toBe(false);
  expect(fillOf('typing')).toBeCloseTo((t.sections + t.quizzes) / denomOf('typing'), 5);
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
  feed('typing', a.sections, a.quizzes, a.trainers);
  feed('it-english', b.sections, b.quizzes, b.trainers);
  expect(nextChapter(['typing', 'it-english'])).toBeNull();
  expect(fullCount(['typing', 'it-english'])).toBe(2);
});

test('глава с тренажёрами не наполняется до крышки, пока они не пройдены', () => {
  // kotlin-vars — настоящая глава с тренажёрами: totals.trainers > 0.
  const t = totalsOf('kotlin-vars');
  expect(t.trainers).toBeGreaterThan(0);

  // Все секции и все проверки — но ни одного тренажёра.
  feed('kotlin-vars', t.sections, t.quizzes);

  expect(isFull('kotlin-vars')).toBe(false);
  expect(fillOf('kotlin-vars')).toBeCloseTo(
    (t.sections + t.quizzes) / (t.sections + t.quizzes + t.trainers),
    5,
  );
});

test('пройденные тренажёры доводят главу до крышки', () => {
  const t = totalsOf('kotlin-vars');
  feed('kotlin-vars', t.sections, t.quizzes, t.trainers);
  expect(isFull('kotlin-vars')).toBe(true);
});
