import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import PRTrainer from './PRTrainer';

beforeEach(() => {
  store.__resetForTests();
});

const LINE_NULL = /val login = author\.login/;
const LINE_HARDCODE = /github\.com\/ivan\/team-report/;
const LINE_TYPO = /val encodedBrnach = urlEncode/;
const LINE_CLEAN = /val target = "main"/;

test('renders diff, score line and hint', () => {
  render(<PRTrainer />);
  expect(screen.getByText('Найдено: 0 из 3 · Промахи: 0')).toBeTruthy();
  expect(screen.getByText(LINE_NULL)).toBeTruthy();
  expect(screen.getByText(/Кликай по строкам/)).toBeTruthy();
});

test('clicking a problem line marks it found, second click does not double-count', () => {
  render(<PRTrainer />);
  const line = screen.getByText(LINE_NULL);
  fireEvent.click(line);
  expect(screen.getByText('Найдено: 1 из 3 · Промахи: 0')).toBeTruthy();
  expect(line.className).toContain('prt-found');
  fireEvent.click(line);
  expect(screen.getByText('Найдено: 1 из 3 · Промахи: 0')).toBeTruthy();
});

test('clicking a clean line counts a miss', () => {
  render(<PRTrainer />);
  const line = screen.getByText(LINE_CLEAN);
  fireEvent.click(line);
  expect(screen.getByText('Найдено: 0 из 3 · Промахи: 1')).toBeTruthy();
  expect(line.className).toContain('prt-missclick');
  fireEvent.click(line); // тот же промах не считается дважды
  expect(screen.getByText('Найдено: 0 из 3 · Промахи: 1')).toBeTruthy();
});

test('finding all 3 without misses shows review, marks done and awards xp', () => {
  render(<PRTrainer chapterId="git-remote" trainerId="pr-review" />);
  fireEvent.click(screen.getByText(LINE_NULL));
  fireEvent.click(screen.getByText(LINE_HARDCODE));
  fireEvent.click(screen.getByText(LINE_TYPO));

  expect(screen.getByText(/Выполнено! Все 3 проблемы найдены/)).toBeTruthy();
  expect(screen.getByText('Забытая проверка null.')).toBeTruthy();
  expect(screen.getByText('Захардкоженная строка.')).toBeTruthy();
  expect(screen.getByText('Опечатка в имени.')).toBeTruthy();
  expect(store.getProgress().trainers['git-remote']?.['pr-review']).toMatchObject({
    result: { found: 3, misses: 0 },
  });
  expect(store.getXp()).toBe(25);
});

test('run with misses records them, gives no xp and offers a retry', () => {
  render(<PRTrainer chapterId="git-remote" trainerId="pr-review" />);
  fireEvent.click(screen.getByText(LINE_CLEAN)); // промах
  fireEvent.click(screen.getByText(LINE_NULL));
  fireEvent.click(screen.getByText(LINE_HARDCODE));
  fireEvent.click(screen.getByText(LINE_TYPO));

  expect(store.getProgress().trainers['git-remote']?.['pr-review']).toMatchObject({
    result: { found: 3, misses: 1 },
  });
  expect(store.getXp()).toBe(0);

  fireEvent.click(screen.getByText('Попробовать ещё раз'));
  expect(screen.getByText('Найдено: 0 из 3 · Промахи: 0')).toBeTruthy();
});
