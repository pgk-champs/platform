import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import DailyChallenge, {
  DAILY_BANK,
  DAILY_SIZE,
  DAILY_XP_PER_CORRECT,
  pickDaily,
  streakFire,
  todayKey,
} from './DailyChallenge';

beforeEach(() => {
  store.__resetForTests();
});

test('банк: 30 вопросов, у каждого валидный индекс правильного ответа', () => {
  expect(DAILY_BANK).toHaveLength(30);
  for (const q of DAILY_BANK) {
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    expect(q.correct).toBeGreaterThanOrEqual(0);
    expect(q.correct).toBeLessThan(q.options.length);
  }
});

test('pickDaily детерминирован: одна дата — всегда те же 5 уникальных вопросов из банка', () => {
  const a = pickDaily('2026-09-01');
  const b = pickDaily('2026-09-01');
  expect(a).toEqual(b);
  expect(a).toHaveLength(DAILY_SIZE);
  expect(new Set(a.map((q) => q.q)).size).toBe(DAILY_SIZE);
  for (const q of a) expect(DAILY_BANK).toContain(q);
});

test('pickDaily даёт разные наборы в разные даты', () => {
  const keys = Array.from({ length: 30 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`);
  const sets = new Set(keys.map((k) => pickDaily(k).map((q) => q.q).join('|')));
  expect(sets.size).toBeGreaterThan(20);
});

test('streakFire: пороги огоньков 1/3/7', () => {
  expect(streakFire(0)).toBe('');
  expect(streakFire(1)).toBe('🔥');
  expect(streakFire(2)).toBe('🔥');
  expect(streakFire(3)).toBe('🔥🔥');
  expect(streakFire(6)).toBe('🔥🔥');
  expect(streakFire(7)).toBe('🔥🔥🔥');
  expect(streakFire(30)).toBe('🔥🔥🔥');
});

test('прохождение: ответы на все вопросы записывают день, начисляют XP и блокируют повтор', async () => {
  const { container } = render(<DailyChallenge />);
  fireEvent.click(await screen.findByText('Вызов дня'));

  const key = todayKey();
  const questions = pickDaily(key);
  const qEls = container.querySelectorAll('.dc-question');
  expect(qEls).toHaveLength(DAILY_SIZE);
  qEls.forEach((qEl, qi) => {
    const buttons = qEl.querySelectorAll('button.dc-option');
    fireEvent.click(buttons[questions[qi].correct]);
  });

  const ds = store.dailyState(key);
  expect(ds.done).toBe(true);
  expect(ds.today).toMatchObject({ correct: DAILY_SIZE, total: DAILY_SIZE });
  expect(ds.streak).toBe(1);
  expect(store.getXp()).toBe(DAILY_SIZE * DAILY_XP_PER_CORRECT);
  expect(screen.getByText(/возвращайся завтра/)).toBeTruthy();
});

test('первый ответ фиксируется — перевыбрать вариант нельзя', async () => {
  const { container } = render(<DailyChallenge />);
  fireEvent.click(await screen.findByText('Вызов дня'));

  const q0 = pickDaily(todayKey())[0];
  const wrongIndex = q0.correct === 0 ? 1 : 0;
  const buttons = container.querySelectorAll('.dc-question')[0].querySelectorAll('button.dc-option');
  fireEvent.click(buttons[wrongIndex]);
  expect(buttons[wrongIndex].className).toContain('dc-wrong');

  fireEvent.click(buttons[q0.correct]); // disabled — клик не проходит
  expect(buttons[q0.correct].className).not.toContain('dc-right');
  expect(screen.getByText(new RegExp(`Правильный ответ: `))).toBeTruthy();
});

test('если день уже пройден — квиз не открывается, плашка показывает результат и серию', async () => {
  store.completeDaily(todayKey(), { correct: 3, total: 5 });
  render(<DailyChallenge />);
  expect(await screen.findByText(/Вызов дня пройден: 3 из 5/)).toBeTruthy();
  expect(screen.queryByText('Вызов дня')).toBeNull();
  expect(screen.getByText(/Серия: 1/)).toBeTruthy();
  expect(screen.getByText('🔥')).toBeTruthy();
});
