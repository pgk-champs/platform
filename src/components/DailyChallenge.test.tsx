import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import DailyChallenge, {
  CHAPTER_META,
  DAILY_BANK,
  DAILY_SIZE,
  DAILY_XP_PER_CORRECT,
  FEW_CHAPTERS,
  STARTER_CHAPTERS,
  dailyPool,
  eligibleChapters,
  pickDaily,
  streakFire,
  todayKey,
} from './DailyChallenge';

beforeEach(() => {
  store.__resetForTests();
});

test('банк: не меньше 60 вопросов, у каждого валидный индекс ответа и известная глава', () => {
  expect(DAILY_BANK.length).toBeGreaterThanOrEqual(60);
  for (const q of DAILY_BANK) {
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    expect(q.correct).toBeGreaterThanOrEqual(0);
    expect(q.correct).toBeLessThan(q.options.length);
    expect(CHAPTER_META[q.chapterId]).toBeTruthy();
  }
});

test('банк: каждая глава карты знаний представлена 3–7 вопросами', () => {
  const perChapter = new Map<string, number>();
  for (const q of DAILY_BANK) perChapter.set(q.chapterId, (perChapter.get(q.chapterId) ?? 0) + 1);
  for (const id of Object.keys(CHAPTER_META)) {
    const n = perChapter.get(id) ?? 0;
    expect(n, `глава ${id}`).toBeGreaterThanOrEqual(3);
    expect(n, `глава ${id}`).toBeLessThanOrEqual(7);
  }
});

test('новичок без прогресса: доступны только первые две главы Фундамента', () => {
  expect(eligibleChapters()).toEqual(STARTER_CHAPTERS);
  const pool = dailyPool();
  expect(pool.length).toBeGreaterThanOrEqual(DAILY_SIZE);
  for (const q of pool) expect(STARTER_CHAPTERS).toContain(q.chapterId);
});

test('фильтрация по прогрессу: глава попадает в пул через секцию, квиз или тренажёр', () => {
  store.setSectionRead('kotlin-vars', 's1');
  store.markQuizDone('git-branches', 'q1', { correct: 1, total: 2 });
  store.markTrainerDone('what-is-blockchain', 't1', {});

  const eligible = eligibleChapters();
  expect(eligible).toEqual(
    expect.arrayContaining(['typing', 'it-english', 'kotlin-vars', 'git-branches', 'what-is-blockchain']),
  );
  expect(eligible).toHaveLength(5);

  const pool = dailyPool(eligible);
  expect(pool.length).toBeGreaterThan(0);
  for (const q of pool) expect(eligible).toContain(q.chapterId);
  // Глав без прогресса в пуле нет
  expect(pool.some((q) => q.chapterId === 'ui-kit')).toBe(false);
});

test('детерминизм: одна дата и один прогресс — всегда тот же набор из доступных глав', () => {
  store.setSectionRead('linux-terminal', 's1');
  const eligible = eligibleChapters();
  const a = pickDaily('2026-09-01', dailyPool(eligible));
  const b = pickDaily('2026-09-01', dailyPool(eligibleChapters()));
  expect(a).toEqual(b);
  expect(a).toHaveLength(DAILY_SIZE);
  expect(new Set(a.map((q) => q.q)).size).toBe(DAILY_SIZE);
  for (const q of a) expect(eligible).toContain(q.chapterId);
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

test('новичок в квизе: вопросы только из стартовых глав, честная строка и ссылки «по мотивам»', async () => {
  const { container } = render(<DailyChallenge />);
  fireEvent.click(await screen.findByText('Вызов дня'));

  expect(screen.getByText('Изучай больше глав — вызовы станут разнообразнее.')).toBeTruthy();

  const srcEls = container.querySelectorAll('.dc-src');
  expect(srcEls).toHaveLength(DAILY_SIZE);
  const starterTitles = STARTER_CHAPTERS.map((id) => CHAPTER_META[id].title);
  srcEls.forEach((el) => {
    expect(el.textContent).toContain('по мотивам главы');
    expect(starterTitles.some((t) => el.textContent!.includes(t))).toBe(true);
    const a = el.querySelector('a');
    expect(a?.getAttribute('href')).toMatch(/^\/docs\/foundation\//);
  });
});

test('при достаточном прогрессе честная строка не показывается', async () => {
  for (const id of ['linux-terminal', 'git-first-commit', 'kotlin-vars', 'what-is-blockchain']) {
    store.setSectionRead(id, 's1');
  }
  expect(eligibleChapters().length).toBeGreaterThanOrEqual(FEW_CHAPTERS);
  render(<DailyChallenge />);
  fireEvent.click(await screen.findByText('Вызов дня'));
  expect(screen.queryByText('Изучай больше глав — вызовы станут разнообразнее.')).toBeNull();
});

test('прохождение: ответы на все вопросы записывают день, начисляют XP и блокируют повтор', async () => {
  const { container } = render(<DailyChallenge />);
  fireEvent.click(await screen.findByText('Вызов дня'));

  const key = todayKey();
  const questions = pickDaily(key, dailyPool());
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

  const q0 = pickDaily(todayKey(), dailyPool())[0];
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
