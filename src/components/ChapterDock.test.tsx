import { render, screen, fireEvent, act } from '@testing-library/react';
import { store } from '../lib/store';
import ChapterDock from './ChapterDock';
import ChapterProgress from './ChapterProgress';

vi.mock('./ChapterTour', () => ({ default: () => null }));

beforeEach(() => {
  store.__resetForTests();
});

test('режим чтения включается кнопкой и запоминается в prefs', () => {
  render(<ChapterDock chapterId="typing" />);
  const btn = screen.getByRole('button', { name: /Режим чтения/ });
  expect(btn.getAttribute('aria-pressed')).toBe('false');
  act(() => fireEvent.click(btn));
  expect(store.prefs.getFocus()).toBe(true);
  expect(screen.getByRole('button', { name: /Обычный вид/ }).getAttribute('aria-pressed')).toBe('true');
});

test('заметки без входа просят войти, а не падают на запросе', () => {
  render(<ChapterDock chapterId="typing" />);
  act(() => fireEvent.click(screen.getByRole('button', { name: /Заметки/ })));
  expect(screen.getByRole('dialog', { name: 'Заметки к главе' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Войти через GitHub' })).toBeTruthy();
  act(() => fireEvent.keyDown(window, { key: 'Escape' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('плашка прогресса сворачивается в одну строку своей кнопкой', () => {
  render(<ChapterProgress chapterId="typing" totalSections={4} totalQuizzes={3} totalTrainers={1} />);
  const fold = screen.getByTitle('Свернуть в одну строку');
  expect(fold.getAttribute('aria-expanded')).toBe('true');
  act(() => fireEvent.click(fold));
  expect(store.prefs.getProgressMini()).toBe(true);
  expect(screen.getByTitle('Показать квизы, тренажёры и уровень').getAttribute('aria-expanded')).toBe('false');
});
