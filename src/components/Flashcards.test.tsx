import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import Flashcards from './Flashcards';

const cards = [{ term: 'variable', translation: 'переменная' }];

beforeEach(() => {
  store.__resetForTests();
});

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

test('without chapterId there is no word-favorite star (backwards compatible)', () => {
  render(<Flashcards cards={cards} />);
  expect(screen.queryByRole('button', { name: /избранное/i })).toBeNull();
});

test('with chapterId, the star saves the current word as a separate favorite', () => {
  const withNote = [{ term: 'variable', translation: 'переменная', note: 'named storage' }];
  render(<Flashcards cards={withNote} chapterId="typing" />);
  const star = screen.getByRole('button', { name: 'Слово в избранное' });
  fireEvent.click(star);
  expect(store.favorites.isFavorite('typing:word:variable')).toBe(true);
  expect(store.favorites.list()[0]).toMatchObject({
    id: 'typing:word:variable',
    type: 'word',
    chapterId: 'typing',
    data: { kind: 'word', term: 'variable', translation: 'переменная', note: 'named storage' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Убрать слово из избранного' }));
  expect(store.favorites.isFavorite('typing:word:variable')).toBe(false);
});

test('clicking the star does not flip the card', () => {
  render(<Flashcards cards={cards} chapterId="typing" />);
  fireEvent.click(screen.getByRole('button', { name: 'Слово в избранное' }));
  expect(screen.queryByText('переменная')).toBeNull();
  expect(screen.getByText('variable')).toBeTruthy();
});

test('star reflects the favorite state of the current card when navigating', () => {
  const many = [
    { term: 'variable', translation: 'переменная' },
    { term: 'function', translation: 'функция' },
  ];
  render(<Flashcards cards={many} chapterId="typing" />);
  fireEvent.click(screen.getByRole('button', { name: 'Слово в избранное' }));
  fireEvent.click(screen.getByText('Дальше'));
  expect(screen.getByRole('button', { name: 'Слово в избранное' })).toBeTruthy();
  fireEvent.click(screen.getByText('Назад'));
  expect(screen.getByRole('button', { name: 'Убрать слово из избранного' })).toBeTruthy();
});

test('Enter на звёздочке не переворачивает карточку (нажатие достаётся кнопке)', () => {
  render(<Flashcards cards={cards} chapterId="typing" />);
  const star = screen.getByRole('button', { name: 'Слово в избранное' });
  const notPrevented = fireEvent.keyDown(star, { key: 'Enter' });
  expect(notPrevented).toBe(true); // preventDefault не вызван — браузер сам нажмёт кнопку
  expect(screen.queryByText('переменная')).toBeNull();
  expect(screen.getByText('variable')).toBeTruthy();

  // сама карточка на Enter по-прежнему переворачивается
  fireEvent.keyDown(screen.getByRole('button', { name: /variable/ }), { key: 'Enter' });
  expect(screen.getByText('переменная')).toBeTruthy();
});
