import { vi } from 'vitest';
import { store } from './store';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, evaluate } from './achievements';
import knowledgeMap from '../data/knowledge-map.json';

beforeEach(() => {
  store.__resetForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

test('registry has 40 achievements with unique ids, valid categories and rarities', () => {
  expect(ACHIEVEMENTS).toHaveLength(40);
  expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(40);
  const rarities = new Set(['обычное', 'редкое', 'эпическое']);
  for (const a of ACHIEVEMENTS) {
    expect(ACHIEVEMENT_CATEGORIES).toContain(a.category);
    expect(rarities.has(a.rarity)).toBe(true);
  }
  // в каждой категории есть хотя бы одно достижение
  for (const cat of ACHIEVEMENT_CATEGORIES) {
    expect(ACHIEVEMENTS.some((a) => a.category === cat)).toBe(true);
  }
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

// --- волна 5: achievements-v2 ---

test('conflict git sim unlocks "конфликт-побеждён", all three sims unlock "мастер-веток"', () => {
  store.markTrainerDone('git-branches', 'trainer-gitsim-conflict', { goal: 'conflict', scenario: 'x' });
  let unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('конфликт-побеждён');
  expect(unlocked).not.toContain('мастер-веток');

  store.markTrainerDone('git-branches', 'trainer-gitsim-merge', { goal: 'merge', scenario: 'x' });
  store.markTrainerDone('git-branches', 'trainer-gitsim-ff-vs-merge', { goal: 'ff', scenario: 'x' });
  unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('мастер-веток');
});

test('typing speed thresholds: 100 cpm unlocks only "80-зн-мин", 155 cpm unlocks all speed tiers', () => {
  store.markTrainerDone('typing', 'trainer-code-typing', { cpm: 100, accuracy: 95 });
  let unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('80-зн-мин');
  expect(unlocked).not.toContain('120-зн-мин');
  expect(unlocked).not.toContain('скорость-чемпионата');

  store.markTrainerDone('typing', 'trainer-code-typing', { cpm: 155, accuracy: 100 });
  unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('120-зн-мин');
  expect(unlocked).toContain('скорость-чемпионата');
  expect(unlocked).toContain('ни-одной-опечатки');
});

test('PoW difficulty 2 does not unlock "pow-сложность-3", difficulty 3 does', () => {
  store.markTrainerDone('what-is-blockchain', 'trainer-pow-miner', { nonce: 7, difficulty: 2, attempts: 10 });
  expect(evaluate().map((a) => a.id)).not.toContain('pow-сложность-3');

  store.markTrainerDone('what-is-blockchain', 'trainer-pow-miner', { nonce: 9, difficulty: 3, attempts: 99 });
  expect(evaluate().map((a) => a.id)).toContain('pow-сложность-3');
});

test('daily streaks: 3 consecutive days unlock "3-дня-подряд", a gap blocks "7-дней-подряд"', () => {
  for (const day of ['2026-01-01', '2026-01-02', '2026-01-03']) {
    store.completeDaily(day, { correct: 3, total: 3 });
  }
  let unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('вызов-дня');
  expect(unlocked).toContain('3-дня-подряд');
  expect(unlocked).not.toContain('7-дней-подряд');

  // 4 дня с разрывом — серия из 7 не набирается
  for (const day of ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']) {
    store.completeDaily(day, { correct: 3, total: 3 });
  }
  expect(evaluate().map((a) => a.id)).not.toContain('7-дней-подряд');

  // добиваем разрыв — 1..8 января подряд
  store.completeDaily('2026-01-04', { correct: 3, total: 3 });
  expect(evaluate().map((a) => a.id)).toContain('7-дней-подряд');
});

test('night activity (01:30) unlocks "полночь", afternoon activity does not', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 15, 14, 0));
  store.markTrainerDone('typing', 'trainer-day', { solved: true });
  expect(evaluate().map((a) => a.id)).not.toContain('полночь');

  vi.setSystemTime(new Date(2026, 0, 16, 1, 30));
  store.markTrainerDone('typing', 'trainer-night', { solved: true });
  expect(evaluate().map((a) => a.id)).toContain('полночь');
});

test('"весь-фундамент" needs a started section in every foundation chapter', () => {
  const foundationIds = (knowledgeMap as { id: string; path: string }[])
    .filter((e) => e.path.startsWith('foundation/'))
    .map((e) => e.id);
  expect(foundationIds.length).toBeGreaterThan(0);

  for (const id of foundationIds.slice(0, -1)) store.setSectionRead(id, 'intro');
  expect(evaluate().map((a) => a.id)).not.toContain('весь-фундамент');

  store.setSectionRead(foundationIds[foundationIds.length - 1], 'intro');
  expect(evaluate().map((a) => a.id)).toContain('весь-фундамент');
});

test('exam at 90%+ unlocks "экзамен-на-отлично", 80% does not', () => {
  store.markExamDone('typing', { correct: 8, total: 10 });
  expect(evaluate().map((a) => a.id)).not.toContain('экзамен-на-отлично');

  store.markExamDone('typing', { correct: 9, total: 10 });
  expect(evaluate().map((a) => a.id)).toContain('экзамен-на-отлично');
});

test('50 graded words unlock "50-слов", sim run records "место-в-лидерборде"', () => {
  for (let i = 0; i < 50; i += 1) store.words.grade(`word-${i}`, true);
  store.sim.addRun('mobile', { score: 6, maxScore: 10 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('50-слов');
  expect(unlocked).toContain('первое-слово');
  expect(unlocked).toContain('место-в-лидерборде');
  expect(unlocked).toContain('половина-критериев');
  expect(unlocked).not.toContain('результат-чемпиона');
});
