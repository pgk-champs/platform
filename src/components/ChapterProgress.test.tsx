import { render, screen, act } from '@testing-library/react';
// @ts-ignore — в проекте нет @types/react-dom; серверный рендер нужен,
// чтобы проверить: первый рендер не заглядывает в store (hydration mismatch).
import { renderToStaticMarkup } from 'react-dom/server';
import { store } from '../lib/store';
import ChapterProgress from './ChapterProgress';

// ChapterTour (онбординг-тур Driver.js) — отдельная забота со своими
// тестами в ChapterTour.test.tsx; здесь заглушен, чтобы тесты чистого
// счётчика прогресса не гоняли реальный Driver.js.
vi.mock('./ChapterTour', () => ({ default: () => null }));

beforeEach(() => {
  store.__resetForTests();
});

test('квизы: ряд делений по числу квизов главы', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={5} totalTrainers={3} />,
  );
  expect(container.querySelectorAll('.cp-row--quizzes .cp-cell').length).toBe(5);
  expect(container.querySelectorAll('.cp-cell--on').length).toBe(0);
});

test('квизы: закрашено ровно столько, сколько сделано', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={5} totalTrainers={3} />,
  );
  act(() => {
    store.markQuizDone('typing', 'q1', { correct: 3, total: 3 });
    store.markQuizDone('typing', 'q2', { correct: 1, total: 3 });
  });
  expect(container.querySelectorAll('.cp-row--quizzes .cp-cell--on').length).toBe(2);
});

test('один тренажёр — не сетка, а состояние (так у 100 глав из 137)', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={4} totalTrainers={1} />,
  );
  expect(container.querySelectorAll('.cp-row--trainers .cp-cell').length).toBe(0);
  expect(container.querySelector('.cp-state')?.textContent).toContain('не пройден');
  act(() => {
    store.markTrainerDone('typing', 't1', { cpm: 100, accuracy: 90 });
  });
  expect(container.querySelector('.cp-state')?.textContent).toContain('пройден');
});

test('нет тренажёров — ряда нет вовсе (так у 11 глав)', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={4} totalTrainers={0} />,
  );
  expect(container.querySelector('.cp-row--trainers')).toBeNull();
});

test('три и больше тренажёров — ряд делений', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={4} totalTrainers={6} />,
  );
  expect(container.querySelectorAll('.cp-row--trainers .cp-cell').length).toBe(6);
});

test('не показывает больше знаменателя при рассинхроне с mdx', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={3} totalTrainers={3} />,
  );
  act(() => {
    store.markQuizDone('typing', 'q1', { correct: 1, total: 1 });
    store.markQuizDone('typing', 'q2', { correct: 1, total: 1 });
    store.markQuizDone('typing', 'q3', { correct: 1, total: 1 });
    store.markQuizDone('typing', 'q4', { correct: 1, total: 1 });
  });
  expect(container.querySelectorAll('.cp-row--quizzes .cp-cell--on').length).toBe(3);
});

test('прочитанное — процент и полоса', () => {
  render(<ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={2} totalTrainers={3} />);
  expect(screen.getByText('0%')).toBeTruthy();
  act(() => {
    store.setSectionRead('typing', 'intro');
  });
  expect(screen.getByText('25%')).toBeTruthy();
});

test('процент зажат сотней, даже если секций прочитано больше объявленного', () => {
  render(<ChapterProgress chapterId="typing" totalSections={1} totalQuizzes={1} totalTrainers={1} />);
  act(() => {
    store.setSectionRead('typing', 'a');
    store.setSectionRead('typing', 'b');
  });
  expect(screen.getByText('100%')).toBeTruthy();
});

test('shows the level badge derived from total XP', () => {
  render(<ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={2} totalTrainers={3} />);
  expect(screen.getByText(/Уровень 1 · Новичок/)).toBeTruthy();

  act(() => {
    store.addXp(60, 'test'); // порог 2-го уровня — 50 XP
  });
  expect(screen.getByText(/Уровень 2 · Стажёр/)).toBeTruthy();
});

test('progress is scoped per chapterId', () => {
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={2} totalQuizzes={1} totalTrainers={1} />,
  );
  act(() => {
    store.setSectionRead('git-first-commit', 'intro');
  });
  expect(screen.getByText('0%')).toBeTruthy();
  expect(container.querySelector('.cp-state')?.textContent).toContain('не пройден');
});

test('первый (серверный) рендер не зависит от store — иначе у вернувшегося студента hydration mismatch', () => {
  // Сервер собирает страницу с пустым прогрессом, а store на клиенте
  // поднимает localStorage ещё при импорте модуля: если читать его прямо в
  // рендере, первая клиентская отрисовка разойдётся с серверной разметкой.
  store.setSectionRead('typing', 'intro');
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markTrainerDone('typing', 't1', { cpm: 100, accuracy: 90 });
  store.addXp(60, 'test');

  const html = renderToStaticMarkup(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={2} totalTrainers={3} />,
  );
  expect(html).toContain('0%');
  expect(html).toContain('Уровень 1');
  expect(html).not.toContain('cp-cell--on');

  // ...а после монтирования числа настоящие
  const { container } = render(
    <ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={2} totalTrainers={3} />,
  );
  expect(screen.getByText('25%')).toBeTruthy();
  expect(container.querySelectorAll('.cp-row--quizzes .cp-cell--on').length).toBe(1);
  expect(screen.getByText(/Уровень 2/)).toBeTruthy();
});
