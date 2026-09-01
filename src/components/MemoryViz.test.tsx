import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import MemoryViz, { VAL_ERROR } from './MemoryViz';

beforeEach(() => {
  store.__resetForTests();
});

test('renders both cells with initial values', () => {
  render(<MemoryViz />);
  expect(screen.getByText('val x')).toBeTruthy();
  expect(screen.getByText('var y')).toBeTruthy();
  expect(screen.getByText('5')).toBeTruthy();
  expect(screen.getByText('0')).toBeTruthy();
  expect(screen.queryByText(VAL_ERROR)).toBeNull();
});

test('assigning to var changes its value', () => {
  render(<MemoryViz />);
  const [, varBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(varBtn);
  expect(screen.getByText('15')).toBeTruthy();
  fireEvent.click(varBtn);
  expect(screen.getByText('42')).toBeTruthy();
  // val untouched
  expect(screen.getByText('5')).toBeTruthy();
});

test('assigning to val shows the real compiler error, value stays', () => {
  render(<MemoryViz />);
  const [valBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(valBtn);
  expect(screen.getByText(VAL_ERROR)).toBeTruthy();
  expect(screen.getByText('5')).toBeTruthy();
  expect(screen.getByText('Создать новую val поверх')).toBeTruthy();
});

test('creating a new val on top adds the new cell', () => {
  render(<MemoryViz />);
  const [valBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(valBtn);
  fireEvent.click(screen.getByText('Создать новую val поверх'));
  expect(screen.getByText('val newX')).toBeTruthy();
  expect(screen.getByText('120')).toBeTruthy();
});

test('all three steps mark trainer done and award xp once', () => {
  render(<MemoryViz chapterId="kotlin-vars" trainerId="trainer-memory-viz" />);
  const [valBtn, varBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(varBtn);
  fireEvent.click(valBtn);
  fireEvent.click(screen.getByText('Создать новую val поверх'));
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers['kotlin-vars']?.['trainer-memory-viz']).toMatchObject({
    result: { varAssigned: true, valError: true, newVal: true },
  });
  expect(store.getXp()).toBe(25);
  // further clicks do not double the reward
  fireEvent.click(varBtn);
  expect(store.getXp()).toBe(25);
});
