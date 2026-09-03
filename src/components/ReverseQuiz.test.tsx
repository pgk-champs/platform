import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ReverseQuiz from './ReverseQuiz';
import type { Card } from './Flashcards';

const CARDS: Card[] = [
  { term: 'error', translation: 'ошибка' },
  { term: 'file', translation: 'файл' },
  { term: 'branch', translation: 'ветка' },
  { term: 'path', translation: 'путь' },
];

beforeEach(() => {
  store.__resetForTests();
});

function options(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('.rq-option'));
}

function answer(container: HTMLElement, term: string) {
  const btn = options(container).find((b) => b.textContent === term) as HTMLElement;
  fireEvent.click(btn);
}

test('показывает русское слово и 4 английских варианта, среди них правильный', () => {
  const { container } = render(<ReverseQuiz cards={CARDS} />);
  expect(screen.getByText('«ошибка»')).toBeTruthy();
  const opts = options(container).map((b) => b.textContent);
  expect(opts).toHaveLength(4);
  expect(opts).toContain('error');
});

test('все ответы верные: итог, запись в store и XP', () => {
  const { container } = render(<ReverseQuiz cards={CARDS} chapterId="c" trainerId="rq1" />);
  for (const card of CARDS) {
    answer(container, card.term);
    expect(screen.getByText(/Верно!/)).toBeTruthy();
    fireEvent.click(screen.getByText(/Дальше|Показать результат/));
  }
  expect(screen.getByText(/Верно 4 из 4/)).toBeTruthy();
  expect(store.getProgress().trainers.c.rq1.result).toMatchObject({ correct: 4, total: 4 });
  expect(store.getXp()).toBe(10);
});

test('неверный ответ: подсвечивает правильный, итог без XP', () => {
  const { container } = render(<ReverseQuiz cards={CARDS} chapterId="c" trainerId="rq1" />);
  answer(container, 'file'); // «ошибка» — это error, отвечаем неверно
  expect(screen.getByText(/Правильный ответ/)).toBeTruthy();
  const right = options(container).find((b) => b.textContent === 'error') as HTMLButtonElement;
  expect(right.className).toContain('rq-right');
  fireEvent.click(screen.getByText('Дальше'));
  for (const card of CARDS.slice(1)) {
    answer(container, card.term);
    fireEvent.click(screen.getByText(/Дальше|Показать результат/));
  }
  expect(screen.getByText(/Верно 3 из 4/)).toBeTruthy();
  expect(store.getProgress().trainers.c.rq1.result).toMatchObject({ correct: 3, total: 4 });
  expect(store.getXp()).toBe(0);
});

test('«Пройти ещё раз» начинает квиз заново', () => {
  const { container } = render(<ReverseQuiz cards={CARDS} />);
  for (const card of CARDS) {
    answer(container, card.term);
    fireEvent.click(screen.getByText(/Дальше|Показать результат/));
  }
  fireEvent.click(screen.getByText('Пройти ещё раз'));
  expect(screen.getByText('«ошибка»')).toBeTruthy();
  expect(screen.getByText('Слово 1 / 4')).toBeTruthy();
});

test('меньше 4 слов — дружелюбная заглушка', () => {
  render(<ReverseQuiz cards={CARDS.slice(0, 2)} />);
  expect(screen.getByText('Нужно минимум 4 слова')).toBeTruthy();
});

test('после «Пройти ещё раз» итог с ошибкой не хвастается XP', () => {
  const { container } = render(<ReverseQuiz cards={CARDS} chapterId="c" trainerId="rq1" />);
  for (const card of CARDS) {
    answer(container, card.term);
    fireEvent.click(screen.getByText(/Дальше|Показать результат/));
  }
  expect(screen.getByText(/Верно 4 из 4 · \+10 XP/)).toBeTruthy();
  expect(store.getXp()).toBe(10);

  fireEvent.click(screen.getByText('Пройти ещё раз'));
  answer(container, 'file'); // «ошибка» — это error, отвечаем неверно
  fireEvent.click(screen.getByText('Дальше'));
  for (const card of CARDS.slice(1)) {
    answer(container, card.term);
    fireEvent.click(screen.getByText(/Дальше|Показать результат/));
  }
  expect(screen.getByText('Верно 3 из 4')).toBeTruthy();
  expect(screen.queryByText(/\+10 XP/)).toBeNull();
  expect(store.getXp()).toBe(10); // XP не изменился
});
