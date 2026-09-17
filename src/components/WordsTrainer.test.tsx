import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import WordsTrainer, { buildPool } from './WordsTrainer';
import { VOCAB } from '../data/vocab';
import knowledgeMap from '../data/knowledge-map.json';

type Totals = { sections: number; quizzes: number; trainers: number };
const totalsOf = (id: string) =>
  (knowledgeMap as { id: string; totals: Totals }[]).find((e) => e.id === id)!.totals;

/** Наполняет главу до крышки: все секции, все проверки без ошибок и все
 *  тренажёры — с 17.09.2026 они тоже входят в счёт (src/lib/chapterFill.ts). */
function fillChapter(id: string) {
  const t = totalsOf(id);
  for (let i = 0; i < t.sections; i += 1) store.setSectionRead(id, 's' + i);
  for (let i = 0; i < t.quizzes; i += 1) store.markQuizDone(id, 'q' + i, { correct: 1, total: 1 });
  for (let i = 0; i < t.trainers; i += 1) store.markTrainerDone(id, 'tr' + i, {});
}

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

test('buildPool берёт словарь глав, наполненных до крышки', () => {
  fillChapter('typing');
  const pool = buildPool();
  const typingWords = VOCAB.filter((v) => v.chapterId === 'typing');
  expect(typingWords.length).toBeGreaterThan(0);
  expect(pool.some((w) => w.term === typingWords[0].term)).toBe(true);
});

test('недочитанная глава в словарь не попадает', () => {
  // прочитано всё, но ни одной проверки — сосуд не полон
  const t = totalsOf('typing');
  for (let i = 0; i < t.sections; i += 1) store.setSectionRead('typing', 's' + i);
  expect(buildPool()).toEqual([]);
});

test('buildPool ignores chapters that are not passed', () => {
  const pool = buildPool();
  expect(pool).toEqual([]);
});
