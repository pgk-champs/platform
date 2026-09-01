import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import FetchPullViz from './FetchPullViz';

beforeEach(() => {
  store.__resetForTests();
});

test('renders initial state: both repos, no commit C locally, step counter', () => {
  render(<FetchPullViz />);
  expect(screen.getByText('Локальный репозиторий')).toBeTruthy();
  expect(screen.getByText('origin (сервер)')).toBeTruthy();
  expect(screen.getByText('Шаг 1 из 3')).toBeTruthy();
  expect(screen.getByTestId('fpv-local').textContent).not.toContain('C');
  expect(screen.getByTestId('fpv-server').textContent).toContain('C');
});

test('git fetch moves only origin/main: commit C appears, main stays behind', () => {
  render(<FetchPullViz />);
  fireEvent.click(screen.getByText('Шаг →'));
  expect(screen.getByText('$ git fetch')).toBeTruthy();
  expect(screen.getByTestId('fpv-local').textContent).toContain('C');
  expect(screen.getByText(/Локальная main и файлы на диске не тронуты/)).toBeTruthy();
});

test('git merge finishes the scenario, «Сначала» resets it', () => {
  render(<FetchPullViz />);
  fireEvent.click(screen.getByText('Шаг →'));
  fireEvent.click(screen.getByText('Шаг →'));
  expect(screen.getByText('$ git merge origin/main')).toBeTruthy();
  expect(screen.getByText('Шаг 3 из 3')).toBeTruthy();
  expect(screen.getByText('fetch + merge по шагам ✓')).toBeTruthy();

  fireEvent.click(screen.getByText('Сначала'));
  expect(screen.getByText('Шаг 1 из 3')).toBeTruthy();
});

test('pull scenario is a separate tab with its own steps', () => {
  render(<FetchPullViz />);
  fireEvent.click(screen.getByText('pull одной командой'));
  expect(screen.getByText('Шаг 1 из 2')).toBeTruthy();
  fireEvent.click(screen.getByText('Шаг →'));
  expect(screen.getByText('$ git pull')).toBeTruthy();
  expect(screen.getByText(/Одна команда — две операции/)).toBeTruthy();
});

test('finishing both scenarios marks trainer done and awards xp once', () => {
  render(<FetchPullViz chapterId="git-remote" trainerId="fetch-pull-viz" />);
  fireEvent.click(screen.getByText('Шаг →'));
  fireEvent.click(screen.getByText('Шаг →'));
  expect(screen.queryByText(/Выполнено!/)).toBeNull();

  fireEvent.click(screen.getByText('pull одной командой'));
  fireEvent.click(screen.getByText('Шаг →'));
  expect(screen.getByText(/Выполнено! Оба сценария пройдены/)).toBeTruthy();
  expect(store.getProgress().trainers['git-remote']?.['fetch-pull-viz']).toMatchObject({
    result: { scenarios: 2 },
  });
  expect(store.getXp()).toBe(25);

  // повторный проход не даёт xp второй раз
  fireEvent.click(screen.getByText('Сначала'));
  fireEvent.click(screen.getByText('Шаг →'));
  expect(store.getXp()).toBe(25);
});
