import { makeKonamiDetector, KONAMI_SEQUENCE } from './konami';

function feedAll(feed: (key: string) => void, keys: readonly string[]) {
  for (const k of keys) feed(k);
}

test('срабатывает на полной последовательности', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  feedAll(feed, KONAMI_SEQUENCE);
  expect(hits).toBe(1);
});

test('не срабатывает на сбитой последовательности', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  feedAll(feed, ['ArrowUp', 'ArrowUp', 'ArrowDown', 'x', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'b', 'a']);
  expect(hits).toBe(0);
});

test('после сбоя начинает заново и всё-таки срабатывает', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  feed('ArrowUp');
  feed('x'); // сбой
  feedAll(feed, KONAMI_SEQUENCE);
  expect(hits).toBe(1);
});

test('сбой на ArrowUp считается началом новой последовательности', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  // Лишний ArrowUp в начале: ↑↑↑↓↓←→←→BA — код всё равно введён.
  feedAll(feed, ['ArrowUp', ...KONAMI_SEQUENCE]);
  expect(hits).toBe(1);
});

test('B/A нечувствительны к регистру, код можно вводить повторно', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  feedAll(feed, [...KONAMI_SEQUENCE.slice(0, 8), 'B', 'A']);
  feedAll(feed, KONAMI_SEQUENCE);
  expect(hits).toBe(2);
});

test('русская раскладка: физические B и A дают «и» и «ф» — код всё равно засчитан', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  feedAll(feed, [...KONAMI_SEQUENCE.slice(0, 8), 'и', 'ф']);
  expect(hits).toBe(1);
});

test('e.code вместо e.key: KeyB/KeyA засчитываются наравне с b/a', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  feedAll(feed, [...KONAMI_SEQUENCE.slice(0, 8), 'KeyB', 'KeyA']);
  expect(hits).toBe(1);
});

test('русские буквы с других клавиш последовательность по-прежнему сбивают', () => {
  let hits = 0;
  const feed = makeKonamiDetector(() => (hits += 1));
  feedAll(feed, [...KONAMI_SEQUENCE.slice(0, 8), 'ы', 'ф']);
  expect(hits).toBe(0);
});
