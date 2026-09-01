import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ModuleSort, { type SortCard } from './ModuleSort';

const cards: SortCard[] = [
  { name: 'ProductCard', correct: 'ui-kit', why: 'переиспользуемый composable' },
  { name: 'MainActivity', correct: 'app', why: 'точка входа приложения' },
];

beforeEach(() => {
  store.__resetForTests();
});

const place = (card: string, col: string) => {
  fireEvent.click(screen.getByText(card));
  fireEvent.click(screen.getByText(col));
};

test('renders pool cards and three module columns', () => {
  render(<ModuleSort cards={cards} />);
  expect(screen.getByText('ProductCard')).toBeTruthy();
  expect(screen.getByText(':app')).toBeTruthy();
  expect(screen.getByText(':ui-kit')).toBeTruthy();
  expect(screen.getByText(':net')).toBeTruthy();
  expect(screen.getByText('Проверить')).toBeDisabled();
});

test('perfect sorting finishes, marks trainer done and awards xp', () => {
  render(<ModuleSort cards={cards} chapterId="ui-kit" trainerId="module-sort" />);
  place('ProductCard', ':ui-kit');
  place('MainActivity', ':app');
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/Выполнено! Все 2 сущностей/)).toBeTruthy();
  expect(store.getProgress().trainers['ui-kit']?.['module-sort']).toMatchObject({
    result: { correct: 2, total: 2 },
  });
  expect(store.getXp()).toBe(15);
});

test('wrong placement shows explanation, records result, gives no xp', () => {
  render(<ModuleSort cards={cards} chapterId="ui-kit" trainerId="module-sort" />);
  place('ProductCard', ':app'); // wrong
  place('MainActivity', ':app');
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/Не сошлось: 1 из 2/)).toBeTruthy();
  expect(screen.getByText(/переиспользуемый composable/)).toBeTruthy();
  expect(store.getProgress().trainers['ui-kit']?.['module-sort']).toMatchObject({
    result: { correct: 1, total: 2 },
  });
  expect(store.getXp()).toBe(0);
});

test('clicking a placed card returns it to the pool', () => {
  render(<ModuleSort cards={cards} />);
  place('ProductCard', ':net');
  place('MainActivity', ':app');
  fireEvent.click(screen.getByText('ProductCard')); // back to pool
  expect(screen.getByText('Проверить')).toBeDisabled();
});

test('reset returns everything to the pool', () => {
  render(<ModuleSort cards={cards} />);
  place('ProductCard', ':ui-kit');
  fireEvent.click(screen.getByText('Сбросить'));
  expect(screen.getByText('Проверить')).toBeDisabled();
  expect(screen.getByText('ProductCard')).toBeTruthy();
});
