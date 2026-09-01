import { store } from './store';
import { ACHIEVEMENTS, evaluate } from './achievements';

beforeEach(() => {
  store.__resetForTests();
});

test('registry has exactly the 8 starter achievements with unique ids', () => {
  expect(ACHIEVEMENTS).toHaveLength(8);
  expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(8);
});

test('evaluate unlocks nothing on empty store', () => {
  expect(evaluate()).toEqual([]);
  expect(store.achievements.list()).toEqual([]);
});

test('reading a section unlocks "первая-прочитанная-глава"', () => {
  store.setSectionRead('typing', 'intro');
  const unlocked = evaluate();
  expect(unlocked.map((a) => a.id)).toContain('первая-прочитанная-глава');
  expect(store.achievements.isUnlocked('первая-прочитанная-глава')).toBe(true);
});

test('same achievement is not unlocked twice across evaluate calls', () => {
  store.setSectionRead('typing', 'intro');
  evaluate();
  const second = evaluate();
  expect(second.map((a) => a.id)).not.toContain('первая-прочитанная-глава');
});

test('finishing a quiz unlocks "первый-квиз", perfect score also unlocks "квиз-на-100"', () => {
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('первый-квиз');
  expect(unlocked).toContain('квиз-на-100');
});

test('an imperfect quiz unlocks "первый-квиз" but not "квиз-на-100"', () => {
  store.markQuizDone('typing', 'q1', { correct: 1, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('первый-квиз');
  expect(unlocked).not.toContain('квиз-на-100');
});

test('3 perfect quizzes in a row unlock "серия-3-квизов"', () => {
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'q2', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'q3', { correct: 2, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('серия-3-квизов');
});

test('a broken streak (one imperfect quiz) does not unlock "серия-3-квизов"', () => {
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'q2', { correct: 1, total: 2 });
  store.markQuizDone('typing', 'q3', { correct: 2, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).not.toContain('серия-3-квизов');
});

test('finishing a trainer unlocks "первый-тренажёр"', () => {
  store.markTrainerDone('typing', 'code-typing', { wpm: 40 });
  expect(evaluate().map((a) => a.id)).toContain('первый-тренажёр');
});

test('5 favorites unlock "5-в-избранном"', () => {
  for (let i = 0; i < 5; i += 1) {
    store.favorites.add({ id: `f${i}`, type: 'trainer', chapterId: 'typing', title: `Item ${i}` });
  }
  expect(evaluate().map((a) => a.id)).toContain('5-в-избранном');
});

test('reading sections in 3 chapters unlocks "3-главы"', () => {
  store.setSectionRead('typing', 'intro');
  store.setSectionRead('git-first-commit', 'intro');
  store.setSectionRead('linux-terminal', 'intro');
  expect(evaluate().map((a) => a.id)).toContain('3-главы');
});

test('100 xp unlocks "100-xp"', () => {
  store.addXp(100, 'test');
  expect(evaluate().map((a) => a.id)).toContain('100-xp');
});
