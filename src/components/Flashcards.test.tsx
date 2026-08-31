import { render, screen, fireEvent } from '@testing-library/react';
import Flashcards from './Flashcards';

const cards = [{ term: 'variable', translation: 'переменная' }];

test('flips card on click', () => {
  render(<Flashcards cards={cards} />);
  fireEvent.click(screen.getByText('variable'));
  expect(screen.getByText('переменная')).toBeTruthy();
});

test('shows counter and disables Назад on first card', () => {
  const many = [
    { term: 'variable', translation: 'переменная' },
    { term: 'function', translation: 'функция' },
  ];
  render(<Flashcards cards={many} />);
  expect(screen.getByText('1 / 2')).toBeTruthy();
  expect(screen.getByText('Назад')).toBeDisabled();
  expect(screen.getByText('Дальше')).not.toBeDisabled();
});

test('next card resets to term side and disables Дальше on last', () => {
  const many = [
    { term: 'variable', translation: 'переменная' },
    { term: 'function', translation: 'функция' },
  ];
  render(<Flashcards cards={many} />);
  fireEvent.click(screen.getByText('variable'));
  expect(screen.getByText('переменная')).toBeTruthy();
  fireEvent.click(screen.getByText('Дальше'));
  expect(screen.getByText('function')).toBeTruthy();
  expect(screen.getByText('2 / 2')).toBeTruthy();
  expect(screen.getByText('Дальше')).toBeDisabled();
});

test('shows note on back when present', () => {
  const withNote = [{ term: 'variable', translation: 'переменная', note: 'named storage' }];
  render(<Flashcards cards={withNote} />);
  fireEvent.click(screen.getByText('variable'));
  expect(screen.getByText('named storage')).toBeTruthy();
});

test('card flips via keyboard Enter', () => {
  render(<Flashcards cards={cards} />);
  const card = screen.getByRole('button', { name: /variable/ });
  fireEvent.keyDown(card, { key: 'Enter' });
  expect(screen.getByText('переменная')).toBeTruthy();
});

test('empty cards shows placeholder without crashing', () => {
  render(<Flashcards cards={[]} />);
  expect(screen.getByText('Нет карточек')).toBeTruthy();
});
