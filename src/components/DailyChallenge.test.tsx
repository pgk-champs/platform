import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import knowledgeMap from '../data/knowledge-map.json';
import DailyChallenge, {
  questionKey,
  CHAPTER_META,
  DAILY_BANK,
  DAILY_SIZE,
  DAILY_XP_PER_CORRECT,
  FEW_CHAPTERS,
  STARTER_CHAPTERS,
  dailyPool,
  eligibleChapters,
  ownChapters,
  pickDaily,
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

test('новичку хватает вопросов больше чем на день', () => {
  // Стартовыми были две главы — шесть вопросов на пять в день, то есть весь
  // первый месяц один и тот же квиз (ожидаемое совпадение со вчерашним
  // набором 4,2 из 5). Теперь стартовый пул — весь Фундамент: он общий для
  // обоих треков, и его главы студент так или иначе проходит.
  expect(eligibleChapters()).toEqual(STARTER_CHAPTERS);
  const pool = dailyPool();
  expect(pool.length).toBeGreaterThanOrEqual(DAILY_SIZE * 5);
  for (const q of pool) expect(STARTER_CHAPTERS).toContain(q.chapterId);
});

test('стартовые главы берутся из карты знаний, а не перечисляются руками', () => {
  const foundation = (knowledgeMap as { id: string; track: string }[])
    .filter((c) => c.track === 'foundation')
    .map((c) => c.id);
  expect([...STARTER_CHAPTERS].sort()).toEqual([...foundation].sort());
});

test('вчерашние вопросы не приходят снова, пока есть непоказанные', () => {
  const pool = dailyPool();
  const day1 = pickDaily('2026-09-21', pool);
  const seen = day1.map(questionKey);
  const day2 = pickDaily('2026-09-22', pool, seen);
  expect(day2).toHaveLength(DAILY_SIZE);
  expect(day2.filter((q) => seen.includes(questionKey(q)))).toEqual([]);
});

test('когда непоказанных не осталось, круг начинается заново', () => {
  const pool = dailyPool().slice(0, 7); // маленький пул: 7 вопросов, берём 5
  const all = pool.map(questionKey);
  const next = pickDaily('2026-09-30', pool, all);
  expect(next).toHaveLength(DAILY_SIZE);
});

test('непоказанных меньше пяти — добираем, а не отдаём огрызок', () => {
  const pool = dailyPool().slice(0, 8);
  const seen = pool.slice(0, 6).map(questionKey); // непоказанных 2
  const day = pickDaily('2026-10-01', pool, seen);
  expect(day).toHaveLength(DAILY_SIZE);
  // оба непоказанных обязаны попасть в набор
  const keys = day.map(questionKey);
  for (const q of pool.slice(6)) expect(keys).toContain(questionKey(q));
});

test('фильтрация по прогрессу: глава попадает в пул через секцию, квиз или тренажёр', () => {
  store.setSectionRead('kotlin-vars', 's1');
  store.markQuizDone('git-branches', 'q1', { correct: 1, total: 2 });
  store.markTrainerDone('what-is-blockchain', 't1', {});

  const eligible = eligibleChapters();
  expect(eligible).toEqual(
    expect.arrayContaining(['typing', 'it-english', 'kotlin-vars', 'git-branches', 'what-is-blockchain']),
  );
  // Фундамент лежит в пуле бесплатно, поэтому считаем СВОИ главы.
  // git-branches — глава Фундамента, она и так была доступна.
  expect([...ownChapters()].sort()).toEqual(['kotlin-vars', 'what-is-blockchain'].sort());

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
  // Главы НЕ из Фундамента: он в пуле бесплатно и «своим» прогрессом не
  // считается, иначе строка исчезала бы у того, кто ещё ничего не открыл.
  for (const id of ['kotlin-vars', 'what-is-blockchain', 'kotlin-null', 'ts-vs-js']) {
    store.setSectionRead(id, 's1');
  }
  expect(ownChapters().length).toBeGreaterThanOrEqual(FEW_CHAPTERS);
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

test('активный стрик показывает XP-множитель рядом с серией', async () => {
  const DAY_MS = 86400000;
  const today = todayKey();
  const daysAgo = (n: number) => new Date(new Date(`${today}T00:00:00Z`).getTime() - n * DAY_MS).toISOString().slice(0, 10);
  for (let n = 3; n >= 1; n -= 1) store.completeDaily(daysAgo(n), { correct: 1, total: 1 });

  render(<DailyChallenge />);
  expect(await screen.findByText(/×1\.15 XP/)).toBeTruthy(); // 1 + 3×5%
});

test('без стрика множитель не показывается', async () => {
  render(<DailyChallenge />);
  await screen.findByText('Вызов дня');
  expect(screen.queryByText(/XP$/)).toBeNull();
});

test('если день уже пройден — квиз не открывается, плашка показывает результат и серию', async () => {
  store.completeDaily(todayKey(), { correct: 3, total: 5 });
  render(<DailyChallenge />);
  expect(await screen.findByText(/Вызов дня пройден: 3 из 5/)).toBeTruthy();
  expect(screen.queryByText('Вызов дня')).toBeNull();
  // Серия рисуется StreakBadge: число, склонённое слово и одна зажжённая ячейка
  // недели. Эмодзи-огоньков больше нет — оформление теперь подхватывает тему.
  const streak = screen.getByLabelText('Серия: 1');
  expect(streak.textContent).toContain('день подряд');
  expect(streak.querySelectorAll('.st-pip.on')).toHaveLength(1);
});

test('пройденный вызов запоминается — назавтра вопросы другие', async () => {
  // Раньше набор дня выбирался независимо, и при полном банке первый повтор
  // приходил на восьмой день, а у новичка — на второй.
  const { container } = render(<DailyChallenge />);
  fireEvent.click(await screen.findByText('Вызов дня'));
  const shown = pickDaily(todayKey(), dailyPool(), store.dailySeenList());

  // отвечаем на все вопросы — как в тесте прохождения выше
  container.querySelectorAll('.dc-question').forEach((q) => {
    const opt = q.querySelector('button');
    if (opt) fireEvent.click(opt);
  });

  expect(store.dailySeenList().length).toBeGreaterThan(0);
  const tomorrow = pickDaily('2099-01-01', dailyPool(), store.dailySeenList());
  const seen = new Set(shown.map(questionKey));
  expect(tomorrow.filter((q) => seen.has(questionKey(q)))).toEqual([]);
});

test('круг пройден — память обнуляется, а не копится вечно', () => {
  const pool = dailyPool();
  store.markDailySeen(pool.map(questionKey), pool.length);
  expect(store.dailySeenList()).toEqual([]);
});
