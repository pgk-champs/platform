import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import CodeTyping from './CodeTyping';

beforeEach(() => {
  store.__resetForTests();
});

test('shows accuracy after typing full snippet', () => {
  render(<CodeTyping snippet="ab" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'ax' } });
  expect(screen.getByText(/Точность: 50%/)).toBeTruthy();
});

test('without chapterId/trainerId nothing is written to the store', () => {
  render(<CodeTyping snippet="ab" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText(/Точность: 100%/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
  expect(store.getProgress().trainers).toEqual({});
});

test('live counter shows speed and accuracy while typing, before completion', () => {
  render(<CodeTyping snippet="abcdef" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText(/зн\/мин/)).toBeTruthy();
  expect(screen.getByText(/точность \d+%/)).toBeTruthy();
});

test('completion records best trainer result and grants first-completion XP', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });

  const saved = store.getProgress().trainers.typing.t1.result as { cpm: number; accuracy: number };
  expect(saved.accuracy).toBe(100);
  expect(saved.cpm).toBeGreaterThan(0);
  expect(store.getXp()).toBe(10);
  expect(screen.getByText(/Лучший: \d+ зн\/мин · точность 100%/)).toBeTruthy();
});

test('"Ещё раз" resets the input but keeps the best result visible', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  fireEvent.click(screen.getByText('Ещё раз'));

  expect(screen.getByRole('textbox')).toBeTruthy();
  expect(screen.getByText(/Лучший: \d+ зн\/мин/)).toBeTruthy();
});

test('reaching the target shows "Цель достигнута!" and grants goal XP once', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" targetAccuracy={50} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText('Цель достигнута!')).toBeTruthy();
  // first-completion XP (10) + goal XP (15)
  expect(store.getXp()).toBe(25);

  fireEvent.click(screen.getByText('Ещё раз'));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  // goal already met by the stored best — no repeat goal XP, no repeat first-completion XP
  expect(store.getXp()).toBe(25);
});

test('missing the target shows "Цель пока не достигнута"', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" targetAccuracy={999} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText('Цель пока не достигнута')).toBeTruthy();
});
