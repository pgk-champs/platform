import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import GitStatusReader, { STATUS_TASKS } from './GitStatusReader';

beforeEach(() => {
  store.__resetForTests();
});

test('renders first verbatim git status output with question and progress', () => {
  render(<GitStatusReader />);
  expect(screen.getByText('Вывод 1 из 3')).toBeTruthy();
  expect(screen.getByText('Untracked files:')).toBeTruthy();
  expect(
    screen.getByText('nothing added to commit but untracked files present (use "git add" to track)'),
  ).toBeTruthy();
  expect(screen.getByText('Проверить')).toBeTruthy();
});

test('clicking a line toggles selection', () => {
  render(<GitStatusReader />);
  const line = screen.getByText('main.py');
  fireEvent.click(line);
  expect(line.className).toContain('gsr-picked');
  fireEvent.click(line);
  expect(line.className).not.toContain('gsr-picked');
});

test('wrong pick shows explanation and highlights the wrongly picked line', () => {
  render(<GitStatusReader />);
  const line = screen.getByText('main.py'); // untracked — в коммит не попадёт
  fireEvent.click(line);
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText('Не совсем.')).toBeTruthy();
  expect(screen.getByText(/индекс пуст/)).toBeTruthy();
  expect(line.className).toContain('gsr-wrong');
  expect(line).toBeDisabled();
});

test('missed staged line is highlighted on the second output', () => {
  render(<GitStatusReader />);
  fireEvent.click(screen.getByText('Проверить')); // 1: пусто — верно
  fireEvent.click(screen.getByText('Дальше →'));
  expect(screen.getByText('Вывод 2 из 3')).toBeTruthy();
  fireEvent.click(screen.getByText('Проверить')); // 2: пусто — а надо было выбрать new file
  expect(screen.getByText('Не совсем.')).toBeTruthy();
  expect(screen.getByText(/new file:/, { selector: 'button' }).className).toContain('gsr-missed');
});

test('perfect run finishes with plaque, marks trainer done and awards xp', () => {
  render(<GitStatusReader chapterId="git-first-commit" trainerId="status-reader" />);
  fireEvent.click(screen.getByText('Проверить')); // 1: индекс пуст
  expect(screen.getByText('Верно!')).toBeTruthy();
  fireEvent.click(screen.getByText('Дальше →'));

  fireEvent.click(screen.getByText(/new file:/)); // 2: staged-файл
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText('Верно!')).toBeTruthy();
  fireEvent.click(screen.getByText('Дальше →'));

  fireEvent.click(screen.getByText('Проверить')); // 3: modified не в индексе
  expect(screen.getByText('Верно!')).toBeTruthy();
  fireEvent.click(screen.getByText('Показать результат'));

  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers['git-first-commit']?.['status-reader']).toMatchObject({
    result: { correct: 3, total: 3 },
  });
  expect(store.getXp()).toBe(25);
});

test('imperfect run records result, gives no xp and offers retry', () => {
  render(<GitStatusReader chapterId="git-first-commit" trainerId="status-reader" />);
  fireEvent.click(screen.getByText('On branch master')); // 1: неверно
  fireEvent.click(screen.getByText('Проверить'));
  fireEvent.click(screen.getByText('Дальше →'));
  fireEvent.click(screen.getByText(/new file:/)); // 2: верно
  fireEvent.click(screen.getByText('Проверить'));
  fireEvent.click(screen.getByText('Дальше →'));
  fireEvent.click(screen.getByText('Проверить')); // 3: верно
  fireEvent.click(screen.getByText('Показать результат'));

  expect(screen.getByText(/Верно 2 из 3/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
  expect(store.getProgress().trainers['git-first-commit']?.['status-reader']).toMatchObject({
    result: { correct: 2, total: 3 },
  });

  fireEvent.click(screen.getByText('Попробовать ещё раз'));
  expect(screen.getByText('Вывод 1 из 3')).toBeTruthy();
});

test('tasks data stays consistent: commit indexes point at existing lines', () => {
  for (const t of STATUS_TASKS) {
    for (const i of t.commit) {
      expect(t.lines[i]).toBeTruthy();
    }
  }
});
