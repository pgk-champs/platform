import { render, screen, act } from '@testing-library/react';
import { store } from '../lib/store';
import ChapterProgress from './ChapterProgress';

// ChapterTour (онбординг-тур Driver.js) — отдельная забота со своими
// тестами в ChapterTour.test.tsx; здесь заглушен, чтобы тесты чистого
// счётчика прогресса не гоняли реальный Driver.js.
vi.mock('./ChapterTour', () => ({ default: () => null }));

beforeEach(() => {
  store.__resetForTests();
});

test('shows zeroes before any progress is recorded', () => {
  render(<ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={2} totalTrainers={3} />);
  expect(screen.getByText('Прочитано 0%')).toBeTruthy();
  expect(screen.getByText('Квизы 0/2')).toBeTruthy();
  expect(screen.getByText('Тренажёры 0/3')).toBeTruthy();
});

test('updates live as sections/quizzes/trainers are recorded in the store', () => {
  render(<ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={2} totalTrainers={3} />);

  act(() => {
    store.setSectionRead('typing', 'intro');
    store.markQuizDone('typing', 'q1', { correct: 3, total: 3 });
    store.markTrainerDone('typing', 't1', { cpm: 100, accuracy: 90 });
  });

  expect(screen.getByText('Прочитано 25%')).toBeTruthy();
  expect(screen.getByText('Квизы 1/2')).toBeTruthy();
  expect(screen.getByText('Тренажёры 1/3')).toBeTruthy();
});

test('percentage is clamped at 100% even if more sections were read than declared', () => {
  render(<ChapterProgress chapterId="typing" totalSections={1} totalQuizzes={1} totalTrainers={1} />);
  act(() => {
    store.setSectionRead('typing', 'a');
    store.setSectionRead('typing', 'b');
  });
  expect(screen.getByText('Прочитано 100%')).toBeTruthy();
});

test('quizzes/trainers counters are clamped at the declared total (mismatch insurance)', () => {
  // Если totalQuizzes/totalTrainers в mdx главы забудут поднять при
  // добавлении блока, счётчик не должен показать «5 из 4».
  render(<ChapterProgress chapterId="typing" totalSections={1} totalQuizzes={1} totalTrainers={1} />);
  act(() => {
    store.markQuizDone('typing', 'q1', { correct: 1, total: 1 });
    store.markQuizDone('typing', 'q2', { correct: 1, total: 1 });
    store.markTrainerDone('typing', 't1', { cpm: 100, accuracy: 90 });
    store.markTrainerDone('typing', 't2', { cpm: 100, accuracy: 90 });
  });
  expect(screen.getByText('Квизы 1/1')).toBeTruthy();
  expect(screen.getByText('Тренажёры 1/1')).toBeTruthy();
});

test('progress is scoped per chapterId', () => {
  render(<ChapterProgress chapterId="typing" totalSections={2} totalQuizzes={1} totalTrainers={1} />);
  act(() => {
    store.setSectionRead('git-first-commit', 'intro');
  });
  expect(screen.getByText('Прочитано 0%')).toBeTruthy();
});
