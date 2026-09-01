import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ModifierChain from './ModifierChain';

beforeEach(() => {
  store.__resetForTests();
});

test('renders three modifier cards, chain code and first task', () => {
  render(<ModifierChain />);
  expect(screen.getByText('.padding(16.dp)')).toBeTruthy();
  expect(screen.getByText('.background(Color.Green)')).toBeTruthy();
  expect(screen.getByText('.fillMaxWidth()')).toBeTruthy();
  expect(screen.getByText(/Задание 1 из 2/)).toBeTruthy();
  expect(
    screen.getByText('Modifier.background(Color.Green).padding(16.dp).fillMaxWidth()'),
  ).toBeTruthy();
});

test('preview nests layers in chain order: background outside padding at start', () => {
  const { container } = render(<ModifierChain />);
  expect(container.querySelector('.mchain-l-bg .mchain-l-pad')).toBeTruthy();
  expect(container.querySelector('.mchain-l-pad .mchain-l-bg')).toBeNull();
});

test('up button on the first card is disabled, down on the last too', () => {
  render(<ModifierChain />);
  expect(screen.getByLabelText('выше: .background(Color.Green)')).toBeDisabled();
  expect(screen.getByLabelText('ниже: .fillMaxWidth()')).toBeDisabled();
});

test('moving padding above background completes task 1 and flips the preview nesting', () => {
  const { container } = render(<ModifierChain />);
  fireEvent.click(screen.getByLabelText('выше: .padding(16.dp)'));
  expect(screen.getByText(/Задание 2 из 2/)).toBeTruthy();
  expect(container.querySelector('.mchain-l-pad .mchain-l-bg')).toBeTruthy();
  expect(screen.getByText(/padding стоит раньше background/)).toBeTruthy();
});

test('completing both tasks shows done banner, marks trainer and awards xp', () => {
  render(<ModifierChain chapterId="first-compose-screen" trainerId="trainer-modifier-order" />);
  fireEvent.click(screen.getByLabelText('выше: .padding(16.dp)')); // задание 1
  fireEvent.click(screen.getByLabelText('выше: .background(Color.Green)')); // задание 2
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(
    store.getProgress().trainers['first-compose-screen']?.['trainer-modifier-order'],
  ).toMatchObject({ result: { tasks: 2 } });
  expect(store.getXp()).toBe(15);
});

test('xp is awarded only once even after further reordering', () => {
  render(<ModifierChain chapterId="c" trainerId="t" />);
  fireEvent.click(screen.getByLabelText('выше: .padding(16.dp)'));
  fireEvent.click(screen.getByLabelText('выше: .background(Color.Green)'));
  fireEvent.click(screen.getByLabelText('выше: .padding(16.dp)'));
  fireEvent.click(screen.getByLabelText('выше: .background(Color.Green)'));
  expect(store.getXp()).toBe(15);
});
