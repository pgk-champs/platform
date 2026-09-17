import { store } from './store';
import { buildCards, filterCards, chipCounts, RUNNABLE } from './gym';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('карточка строится на каждую механику и знает свои упражнения', () => {
  const cards = buildCards();
  expect(cards.length).toBe(46);

  const bug = cards.find((c) => c.component === 'BugHunt')!;
  expect(bug.name).toBe('Охота на ошибки');
  expect(bug.count).toBe(1);
  expect(bug.runnable).toBe(false);
  // Ссылка ведёт на сам тренажёр, а не на верх главы.
  expect(bug.exercises[0].href).toMatch(/^\/docs\/.+#trainer-/);
});

test('печать — самая частая механика и запускается в зале', () => {
  const typing = buildCards().find((c) => c.component === 'CodeTyping')!;
  expect(typing.count).toBeGreaterThan(100);
  expect(typing.runnable).toBe(true);
});

test('у каждой карточки есть непустая подпись', () => {
  for (const c of buildCards()) {
    expect(c.name).not.toBe('');
    expect(c.blurb).not.toBe('');
  }
});

test('безымянное упражнение подписывается главой, а не пустотой', () => {
  // У 85 упражнений из 228 своего title нет — почти все это наборы печати.
  const typing = buildCards().find((c) => c.component === 'CodeTyping')!;
  for (const e of typing.exercises) expect(e.title).not.toBe('');
});

test('пройденное считается по store, а не по отметкам', () => {
  expect(buildCards().find((c) => c.component === 'BugHunt')!.done).toBe(0);

  store.markTrainerDone('kotlin-vars', 'trainer-bug-hunt', {});
  expect(buildCards().find((c) => c.component === 'BugHunt')!.done).toBe(1);
});

test('поиск ищет по названию и по сути', () => {
  const cards = buildCards();
  expect(filterCards(cards, 'глазомер', 'all').map((c) => c.component)).toEqual(['EyeDp']);
  // «nonce» стоит не в названии, а в подписи PoW-майнера.
  expect(filterCards(cards, 'nonce', 'all').map((c) => c.component)).toEqual(['PowMiner']);
  expect(filterCards(cards, 'ГЛАЗОМЕР', 'all')).toHaveLength(1);
  expect(filterCards(cards, '', 'all')).toHaveLength(46);
});

test('чип трека отбирает механики этого трека', () => {
  const cards = buildCards();
  const mobile = filterCards(cards, '', 'mobile');
  expect(mobile.length).toBeGreaterThan(0);
  expect(mobile.every((c) => c.tracks.includes('mobile'))).toBe(true);
  expect(filterCards(cards, '', 'runnable')).toHaveLength(RUNNABLE.length);
});

test('сумма чипов больше 46 — механика живёт в нескольких треках', () => {
  const chips = chipCounts(buildCards());
  expect(chips.find((c) => c.id === 'all')!.n).toBe(46);
  const tracks = chips.filter((c) => c.id !== 'all' && c.id !== 'runnable');
  expect(tracks.reduce((s, c) => s + c.n, 0)).toBeGreaterThan(46);
});
