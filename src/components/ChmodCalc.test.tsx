import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ChmodCalc, { toOctal, toLetters } from './ChmodCalc';

beforeEach(() => {
  store.__resetForTests();
});

test('helpers convert bits to octal and letters', () => {
  expect(toOctal(0o755)).toBe('755');
  expect(toLetters(0o755)).toBe('rwxr-xr-x');
  expect(toLetters(0o640)).toBe('rw-r-----');
  expect(toLetters(0)).toBe('---------');
});

test('checkbox toggle updates octal number and letters', () => {
  render(<ChmodCalc />);
  expect(screen.getByText('rw-r--r--')).toBeTruthy(); // default 644
  fireEvent.click(screen.getByLabelText('Владелец: запуск')); // 644 → 744
  expect(screen.getByDisplayValue('744')).toBeTruthy();
  expect(screen.getByText('rwxr--r--')).toBeTruthy();
});

test('typing an octal number updates checkboxes and letters', () => {
  render(<ChmodCalc />);
  fireEvent.change(screen.getByLabelText('восьмеричные права'), { target: { value: '640' } });
  expect(screen.getByText('rw-r-----')).toBeTruthy();
  expect(screen.getByLabelText('Владелец: чтение')).toBeChecked();
  expect(screen.getByLabelText('Группа: чтение')).toBeChecked();
  expect(screen.getByLabelText('Остальные: чтение')).not.toBeChecked();
});

test('invalid input shows friendly error and keeps previous state', () => {
  render(<ChmodCalc />);
  fireEvent.change(screen.getByLabelText('восьмеричные права'), { target: { value: '9' } });
  expect(screen.getByText(/Нужно три цифры от 0 до 7/)).toBeTruthy();
  expect(screen.getByText('rw-r--r--')).toBeTruthy(); // still 644
});

test('preset buttons apply rights, 777 shows a warning', () => {
  render(<ChmodCalc />);
  fireEvent.click(screen.getByRole('button', { name: '755' }));
  expect(screen.getByText('rwxr-xr-x')).toBeTruthy();
  expect(screen.queryByText(/Почти всегда это ошибка/)).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: '777' }));
  expect(screen.getByText('rwxrwxrwx')).toBeTruthy();
  expect(screen.getByText(/Почти всегда это ошибка/)).toBeTruthy();
});

test('goal: using both directions marks trainer done and awards xp once', () => {
  render(<ChmodCalc chapterId="linux" trainerId="chmod-calc" />);
  fireEvent.click(screen.getByLabelText('Группа: запись'));
  expect(store.getProgress().trainers.linux?.['chmod-calc']).toBeUndefined();

  fireEvent.change(screen.getByLabelText('восьмеричные права'), { target: { value: '640' } });
  expect(store.getProgress().trainers.linux?.['chmod-calc']).toMatchObject({ result: { octal: '640' } });
  expect(store.getXp()).toBe(10);

  fireEvent.change(screen.getByLabelText('восьмеричные права'), { target: { value: '600' } });
  expect(store.getXp()).toBe(10); // не начисляется повторно
});

test('without chapterId/trainerId no goal line and no store writes', () => {
  render(<ChmodCalc />);
  fireEvent.click(screen.getByLabelText('Группа: запись'));
  fireEvent.change(screen.getByLabelText('восьмеричные права'), { target: { value: '640' } });
  expect(screen.queryByText(/Задание:/)).toBeNull();
  expect(store.getProgress().trainers).toEqual({});
  expect(store.getXp()).toBe(0);
});
