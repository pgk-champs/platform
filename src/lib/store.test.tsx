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
