import { store } from './store';

beforeEach(() => {
  store.__resetForTests();
});

test('setSectionRead marks a section read and is idempotent', () => {
  expect(store.isSectionRead('typing', 'intro')).toBe(false);
  store.setSectionRead('typing', 'intro');
  expect(store.isSectionRead('typing', 'intro')).toBe(true);
  store.setSectionRead('typing', 'intro');
  expect(store.getProgress().sections.typing).toEqual(['intro']);
});

test('markQuizDone records score under chapter/quiz and persists', () => {
  store.markQuizDone('typing', 'q1', { correct: 3, total: 5 });
  const saved = store.getProgress().quizzes.typing.q1;
  expect(saved.correct).toBe(3);
  expect(saved.total).toBe(5);

  const raw = JSON.parse(localStorage.getItem('pgk-store')!);
  expect(raw.quizzes.typing.q1.correct).toBe(3);
});

test('markTrainerDone records result under chapter/trainer', () => {
  store.markTrainerDone('typing', 'code-typing', { wpm: 42 });
  expect(store.getProgress().trainers.typing['code-typing'].result).toEqual({ wpm: 42 });
});

test('favorites add/remove/list roundtrip and dedupe by id', () => {
  store.favorites.add({ id: 'typing:t1', type: 'trainer', chapterId: 'typing', title: 'Тренажёр' });
  store.favorites.add({ id: 'typing:t1', type: 'trainer', chapterId: 'typing', title: 'Тренажёр' });
  expect(store.favorites.list()).toHaveLength(1);
  expect(store.favorites.isFavorite('typing:t1')).toBe(true);

  store.favorites.add({ id: 'typing:q1', type: 'quiz', chapterId: 'typing', title: 'Квиз' });
  expect(store.favorites.list({ type: 'quiz' })).toHaveLength(1);
  expect(store.favorites.list({ chapterId: 'typing' })).toHaveLength(2);

  store.favorites.remove('typing:t1');
  expect(store.favorites.isFavorite('typing:t1')).toBe(false);
  expect(store.favorites.list()).toHaveLength(1);
});

test('dismissHint persists and isHintDismissed reflects it', () => {
  expect(store.isHintDismissed('h1')).toBe(false);
  store.dismissHint('h1');
  expect(store.isHintDismissed('h1')).toBe(true);
});

test('addXp accumulates and getXp reads current total', () => {
  expect(store.getXp()).toBe(0);
  store.addXp(10, 'test');
  store.addXp(5, 'test');
  expect(store.getXp()).toBe(15);
});

test('achievements unlock is idempotent and list reflects unlocked ids', () => {
  expect(store.achievements.unlock('first')).toBe(true);
  expect(store.achievements.unlock('first')).toBe(false);
  expect(store.achievements.list()).toEqual(['first']);
  expect(store.achievements.isUnlocked('first')).toBe(true);
  expect(store.achievements.isUnlocked('other')).toBe(false);
});

test('prefs setOs/getOs persists globally', () => {
  expect(store.prefs.getOs()).toBeUndefined();
  store.prefs.setOs('win');
  expect(store.prefs.getOs()).toBe('win');
});

test('toc setCollapsed/isCollapsed defaults to false', () => {
  expect(store.toc.isCollapsed('typing')).toBe(false);
  store.toc.setCollapsed('typing', true);
  expect(store.toc.isCollapsed('typing')).toBe(true);
});

test('block setCollapsed/isCollapsed defaults to false (expanded) and is keyed independently per id', () => {
  expect(store.block.isCollapsed('typing:t1')).toBe(false);
  store.block.setCollapsed('typing:t1', true);
  expect(store.block.isCollapsed('typing:t1')).toBe(true);
  expect(store.block.isCollapsed('typing:t2')).toBe(false);
});

test('quiz.attempts/stats derive history from markQuizDone, keyed per chapterId+quizId', () => {
  expect(store.quiz.stats('typing', 'q1')).toMatchObject({ best: undefined, count: 0, streak: 0 });

  store.markQuizDone('typing', 'q1', { correct: 1, total: 2 });
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'other', { correct: 2, total: 2 });

  const attempts = store.quiz.attempts('typing', 'q1');
  expect(attempts).toHaveLength(2);

  const stats = store.quiz.stats('typing', 'q1');
  expect(stats.count).toBe(2);
  expect(stats.best).toMatchObject({ correct: 2, total: 2 });
  expect(stats.streak).toBe(1);
});

test('quiz.stats streak resets to 0 when the latest attempt is imperfect', () => {
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'q1', { correct: 1, total: 2 });
  expect(store.quiz.stats('typing', 'q1').streak).toBe(0);
});

test('subscribe notifies on every mutation and unsubscribe stops it', () => {
  let calls = 0;
  const unsubscribe = store.subscribe(() => {
    calls += 1;
  });
  store.addXp(1, 'x');
  store.dismissHint('a');
  expect(calls).toBe(2);
  unsubscribe();
  store.addXp(1, 'x');
  expect(calls).toBe(2);
});

test('getVersion increases on mutation so external-store hooks can react', () => {
  const before = store.getVersion();
  store.addXp(1, 'x');
  expect(store.getVersion()).toBeGreaterThan(before);
});

test('survives localStorage.setItem throwing (private mode / quota)', () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota exceeded');
  });
  expect(() => store.addXp(5, 'x')).not.toThrow();
  expect(store.getXp()).toBe(5);
  spy.mockRestore();
});

test('loads previously persisted state back after a fresh read from localStorage', () => {
  store.addXp(7, 'x');
  const raw = localStorage.getItem('pgk-store');
  expect(raw).toBeTruthy();
  expect(JSON.parse(raw!).xp).toBe(7);
});

test('markExamDone appends attempts and getExamStats picks the best', () => {
  store.markExamDone('typing', { correct: 3, total: 8 });
  store.markExamDone('typing', { correct: 7, total: 8 });
  store.markExamDone('typing', { correct: 5, total: 8 });
  const stats = store.getExamStats('typing');
  expect(stats.count).toBe(3);
  expect(stats.attempts.map((a) => a.correct)).toEqual([3, 7, 5]);
  expect(stats.best).toMatchObject({ correct: 7, total: 8 });
});

test('getExamStats for a chapter without exams is empty', () => {
  const stats = store.getExamStats('nope');
  expect(stats.count).toBe(0);
  expect(stats.attempts).toEqual([]);
  expect(stats.best).toBeUndefined();
});

test('exam attempts are persisted to localStorage', () => {
  store.markExamDone('git-first-commit', { correct: 6, total: 6 });
  const raw = JSON.parse(localStorage.getItem('pgk-store')!);
  expect(raw.exams['git-first-commit']).toHaveLength(1);
  expect(raw.exams['git-first-commit'][0]).toMatchObject({ correct: 6, total: 6 });
});

test('completeDaily records once per dateKey; dailyState reads score back', () => {
  expect(store.dailyState('2026-09-01')).toMatchObject({ done: false, streak: 0 });

  expect(store.completeDaily('2026-09-01', { correct: 4, total: 5 })).toBe(true);
  expect(store.completeDaily('2026-09-01', { correct: 5, total: 5 })).toBe(false); // раз в день

  const ds = store.dailyState('2026-09-01');
  expect(ds.done).toBe(true);
  expect(ds.today).toMatchObject({ correct: 4, total: 5 });
  expect(ds.streak).toBe(1);
});

test('dailyState streak counts consecutive days across month boundary and breaks on a gap', () => {
  store.completeDaily('2026-08-30', { correct: 5, total: 5 });
  store.completeDaily('2026-08-31', { correct: 5, total: 5 });
  store.completeDaily('2026-09-01', { correct: 3, total: 5 });
  expect(store.dailyState('2026-09-01').streak).toBe(3);

  // пропуск 2026-09-02 обнуляет серию
  store.completeDaily('2026-09-03', { correct: 5, total: 5 });
  expect(store.dailyState('2026-09-03').streak).toBe(1);
});

test('dailyState keeps yesterday-ending streak alive while today is not yet done', () => {
  store.completeDaily('2026-08-30', { correct: 5, total: 5 });
  store.completeDaily('2026-08-31', { correct: 5, total: 5 });
  const ds = store.dailyState('2026-09-01');
  expect(ds.done).toBe(false);
  expect(ds.streak).toBe(2);
});

// --- streak-множитель XP (Duolingo combo-bonus) ---

/** N-й день до сегодняшнего (относительно реальных часов, как считает store). */
function daysAgoKey(n: number): string {
  const DAY_MS = 86400000;
  const today = new Date().toISOString().slice(0, 10);
  return new Date(new Date(`${today}T00:00:00Z`).getTime() - n * DAY_MS).toISOString().slice(0, 10);
}

test('addXp applies no bonus with no streak yet (fresh state)', () => {
  store.addXp(100, 'test');
  expect(store.getXp()).toBe(100);
  expect(store.getXpMultiplier()).toBe(1);
});

test('addXp multiplies by the streak leading INTO today (yesterday backward, today excluded)', () => {
  // 4 дня подряд, заканчивающиеся вчера — стрик до начала сегодняшней сессии.
  for (let n = 4; n >= 1; n -= 1) store.completeDaily(daysAgoKey(n), { correct: 1, total: 1 });
  expect(store.getXpMultiplier()).toBeCloseTo(1.2, 5); // 1 + 4×5%
  store.addXp(100, 'test');
  expect(store.getXp()).toBe(120);
});

test('addXp multiplier caps at +50% (10 days)', () => {
  // 15 дней подряд по пути проходят через веху в 7 дней (см. тест ниже) — она
  // тоже начисляет XP, поэтому сверяем прирост от addXp, а не итоговый счёт.
  for (let n = 15; n >= 1; n -= 1) store.completeDaily(daysAgoKey(n), { correct: 1, total: 1 });
  expect(store.getXpMultiplier()).toBeCloseTo(1.5, 5);
  const before = store.getXp();
  store.addXp(100, 'test');
  expect(store.getXp() - before).toBe(150);
});

test('completing today does not retroactively inflate the multiplier used for today XP', () => {
  // Стрик пуст — сегодняшнее прохождение вызова дня не должно поднять себе
  // же множитель (иначе первый день серии платил бы сам себе бонус).
  store.completeDaily(daysAgoKey(0), { correct: 5, total: 5 });
  expect(store.getXp()).toBe(0); // completeDaily сам по себе не начисляет XP за ответы
  store.addXp(20, 'test');
  expect(store.getXp()).toBe(20);
});

test('streak milestones (7 and 30 days) pay a one-off XP bonus via completeDaily', () => {
  for (let n = 6; n >= 1; n -= 1) store.completeDaily(daysAgoKey(n), { correct: 1, total: 1 });
  expect(store.getXp()).toBe(0);
  store.completeDaily(daysAgoKey(0), { correct: 1, total: 1 }); // 7-й день подряд
  expect(store.dailyState(daysAgoKey(0)).streak).toBe(7);
  // множитель за 6 предыдущих дней (1 + 6×5% = 1.3) применяется и к бонусу 50 XP
  expect(store.getXp()).toBe(65);
});

// --- cert-words (wave 4): имя для сертификата + тренировка слов ---

test('prefs.setName persists the certificate name', () => {
  expect(store.prefs.getName()).toBeUndefined();
  store.prefs.setName('Олег');
  expect(store.prefs.getName()).toBe('Олег');
  expect(JSON.parse(localStorage.getItem('pgk-store')!).prefs.name).toBe('Олег');
});

test('words.grade moves weight within [1..4] and persists', () => {
  expect(store.words.weight('api')).toBe(2); // дефолт
  store.words.grade('api', false);
  expect(store.words.weight('api')).toBe(3);
  store.words.grade('api', false);
  store.words.grade('api', false);
  expect(store.words.weight('api')).toBe(4); // потолок
  store.words.grade('api', true);
  store.words.grade('api', true);
  store.words.grade('api', true);
  store.words.grade('api', true);
  expect(store.words.weight('api')).toBe(1); // пол
  expect(JSON.parse(localStorage.getItem('pgk-store')!).wordWeights.api).toBe(1);
});

test('words.queue puts unknown words first and repeats them in the round', () => {
  store.words.grade('bug', false); // вес 3
  store.words.grade('loop', true); // вес 1
  const q = store.words.queue(['loop', 'bug', 'var']);
  expect(q[0]).toBe('bug'); // самый тяжёлый — первым
  expect(q.filter((t) => t === 'bug').length).toBe(2); // и повторяется
  expect(q.filter((t) => t === 'loop').length).toBe(1);
  expect(q.filter((t) => t === 'var').length).toBe(1);
});

// --- sim (этап 3): прогоны симулятора чемпионата по модулю критериев ---

test('sim.stats for a module without runs is empty', () => {
  const stats = store.sim.stats('a');
  expect(stats.count).toBe(0);
  expect(stats.runs).toEqual([]);
  expect(stats.best).toBeUndefined();
});

test('sim.addRun appends runs and sim.stats picks the best by score', () => {
  store.sim.addRun('a', { score: 10, maxScore: 19.9 });
  store.sim.addRun('a', { score: 15.5, maxScore: 19.9 });
  store.sim.addRun('a', { score: 12, maxScore: 19.9 });
  const stats = store.sim.stats('a');
  expect(stats.count).toBe(3);
  expect(stats.runs.map((r) => r.score)).toEqual([10, 15.5, 12]);
  expect(stats.best).toMatchObject({ score: 15.5, maxScore: 19.9 });
});

test('sim runs are keyed independently per module and persisted', () => {
  store.sim.addRun('a', { score: 5, maxScore: 19.9 });
  store.sim.addRun('b', { score: 20, maxScore: 25.5 });
  expect(store.sim.stats('a').count).toBe(1);
  expect(store.sim.stats('b').count).toBe(1);
  const raw = JSON.parse(localStorage.getItem('pgk-store')!);
  expect(raw.simRuns.a[0]).toMatchObject({ score: 5, maxScore: 19.9 });
  expect(raw.simRuns.b[0]).toMatchObject({ score: 20, maxScore: 25.5 });
});

// --- tour (онбординг-тур Driver.js): показывается один раз на весь сайт ---

test('tour.isSeen is false until markSeen, then persists and is idempotent', () => {
  expect(store.tour.isSeen('chapter-basics')).toBe(false);
  store.tour.markSeen('chapter-basics');
  expect(store.tour.isSeen('chapter-basics')).toBe(true);
  store.tour.markSeen('chapter-basics'); // повторная отметка не дублирует запись
  const raw = JSON.parse(localStorage.getItem('pgk-store')!);
  expect(raw.toursSeen).toEqual(['chapter-basics']);
});

test('tour ids are independent of each other', () => {
  store.tour.markSeen('chapter-basics');
  expect(store.tour.isSeen('gym')).toBe(false);
});
