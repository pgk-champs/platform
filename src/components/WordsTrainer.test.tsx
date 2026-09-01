import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import WordsTrainer, { buildPool } from './WordsTrainer';
import { VOCAB } from '../data/vocab';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

function addFavWord(term: string, translation: string) {
  store.favorites.add({
    id: `typing:word:${term}`,
    type: 'word',
    chapterId: 'typing',
    title: term,
    data: { kind: 'word', term, translation },
  });
}

test('empty pool shows the hint instead of cards', async () => {
  render(<WordsTrainer />);
  expect(await screen.findByText('Пока нет слов для тренировки.')).toBeTruthy();
});

test('favorite words are trained: reveal, grade, and the weight changes', async () => {
  addFavWord('bug', 'жук/ошибка');
  render(<WordsTrainer />);
  expect(await screen.findByText('bug')).toBeTruthy();
  fireEvent.click(screen.getByText('Показать перевод'));
  expect(screen.getByText('жук/ошибка')).toBeTruthy();
  fireEvent.click(screen.getByText('Не знал'));
  expect(store.words.weight('bug')).toBe(3);
  // одно слово, круг из одного показа — финальный экран
  expect(await screen.findByText(/Круг пройден/)).toBeTruthy();
  fireEvent.click(screen.getByText('Ещё круг'));
  expect(await screen.findByText('bug')).toBeTruthy();
});

test('buildPool includes the vocab of passed chapters (checkbox in pgk-progress)', () => {
  localStorage.setItem('pgk-progress', JSON.stringify({ typing: true }));
  const pool = buildPool();
  const typingWords = VOCAB.filter((v) => v.chapterId === 'typing');
  expect(typingWords.length).toBeGreaterThan(0);
  expect(pool.some((w) => w.term === typingWords[0].term)).toBe(true);
});

test('buildPool ignores chapters that are not passed', () => {
  const pool = buildPool();
  expect(pool).toEqual([]);
});
