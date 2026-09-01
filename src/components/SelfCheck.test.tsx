import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import SelfCheck from './SelfCheck';

const questions = [
  {
    q: 'Сколько будет 2 + 2?',
    options: ['3', '4', '5'],
    correct: 1,
    why: 'Базовая арифметика.',
  },
  {
    q: 'Столица России?',
    options: ['Киев', 'Москва', 'Минск'],
    correct: 1,
  },
];

test('renders questions and options', () => {
  render(<SelfCheck questions={questions} />);
  expect(screen.getByText('Сколько будет 2 + 2?')).toBeTruthy();
  expect(screen.getByText('Столица России?')).toBeTruthy();
  expect(screen.getByText('3')).toBeTruthy();
  expect(screen.getByText('4')).toBeTruthy();
  expect(screen.getByText('Москва')).toBeTruthy();
});

test('correct answer shows "Верно!" with why and locks options', () => {
  render(<SelfCheck questions={questions} />);
  const right = screen.getByText('4');
  fireEvent.click(right);
  expect(right.className).toContain('sc-right');
  expect(screen.getByText('Верно!')).toBeTruthy();
  expect(screen.getByText('Базовая арифметика.')).toBeTruthy();
  expect(screen.getByText('3')).toBeDisabled();
  expect(right).toBeDisabled();
});

test('wrong answer shows hint and allows clicking correct one after', () => {
  render(<SelfCheck questions={questions} />);
  const wrong = screen.getByText('3');
  fireEvent.click(wrong);
  expect(wrong.className).toContain('sc-wrong');
  expect(screen.getByText('Не совсем — подумай ещё')).toBeTruthy();
  expect(screen.getByText('4')).not.toBeDisabled();

  const right = screen.getByText('4');
  fireEvent.click(right);
  expect(right.className).toContain('sc-right');
  expect(screen.getByText('Верно!')).toBeTruthy();
});

test('counter updates as questions get answered correctly', () => {
  render(<SelfCheck questions={questions} />);
  expect(screen.getByText('Отвечено верно: 0 из 2')).toBeTruthy();

  fireEvent.click(screen.getByText('4'));
  expect(screen.getByText('Отвечено верно: 1 из 2')).toBeTruthy();

  fireEvent.click(screen.getByText('Москва'));
  expect(screen.getByText('Отвечено верно: 2 из 2')).toBeTruthy();
});

test('empty questions renders without crashing', () => {
  render(<SelfCheck questions={[]} />);
  expect(screen.getByText('Отвечено верно: 0 из 0')).toBeTruthy();
});

beforeEach(() => {
  store.__resetForTests();
});

test('progress label tracks answered questions regardless of correctness', () => {
  render(<SelfCheck questions={questions} />);
  expect(screen.getByText('Отвечено вопросов: 0 из 2')).toBeTruthy();
  fireEvent.click(screen.getByText('3')); // wrong answer, still counts as answered
  expect(screen.getByText('Отвечено вопросов: 1 из 2')).toBeTruthy();
});

test('final result plate appears once every question has been attempted', () => {
  render(<SelfCheck questions={questions} />);
  expect(screen.queryByText(/Пройдено:/)).toBeNull();
  fireEvent.click(screen.getByText('3')); // wrong, but still an attempt
  expect(screen.queryByText(/Пройдено:/)).toBeNull();
  fireEvent.click(screen.getByText('Москва')); // correct, second question -> all attempted
  expect(screen.getByText('Пройдено: 1 из 2')).toBeTruthy();
  fireEvent.click(screen.getByText('4')); // fix the wrong one -> perfect
  expect(screen.getByText('Пройдено: 2 из 2')).toBeTruthy();
});

test('a full run with chapterId/quizId records the quiz in store and awards xp only on a perfect run', () => {
  render(<SelfCheck questions={questions} chapterId="typing" quizId="basics" />);
  fireEvent.click(screen.getByText('3')); // wrong
  fireEvent.click(screen.getByText('Москва')); // correct
  expect(store.getProgress().quizzes.typing?.basics).toMatchObject({ correct: 1, total: 2 });
  expect(store.getXp()).toBe(0);

  fireEvent.click(screen.getByText('4')); // fix the wrong one -> perfect run
  expect(store.getProgress().quizzes.typing?.basics).toMatchObject({ correct: 2, total: 2 });
  expect(store.getXp()).toBeGreaterThan(0);
});

test('without chapterId/quizId no store write happens (works as before)', () => {
  render(<SelfCheck questions={questions} />);
  fireEvent.click(screen.getByText('4'));
  fireEvent.click(screen.getByText('Москва'));
  expect(store.getProgress().quizzes).toEqual({});
  expect(store.getXp()).toBe(0);
});
