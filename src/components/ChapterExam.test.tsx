import { render, screen, fireEvent, act } from '@testing-library/react';
import { store } from '../lib/store';
import ChapterExam from './ChapterExam';

const questions = [
  { q: 'Вопрос 1', options: ['a', 'b'], correct: 0 },
  { q: 'Вопрос 2', options: ['c', 'd'], correct: 1 },
  { q: 'Вопрос 3', options: ['e', 'f'], correct: 0 },
  { q: 'Вопрос 4', options: ['g', 'h'], correct: 1 },
];

beforeEach(() => {
  store.__resetForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

function startExam() {
  fireEvent.click(screen.getByText('Начать экзамен'));
}

function answerAll(pattern: (qi: number) => number) {
  // Вопросы по одному: после клика рендерится следующий.
  for (let qi = 0; qi < questions.length; qi += 1) {
    const oi = pattern(qi);
    fireEvent.click(screen.getByText(questions[qi].options[oi]));
  }
}

test('intro shows question count and starts exam with one question at a time', () => {
  render(<ChapterExam chapterId="ch" questions={questions} timeLimitSec={60} />);
  expect(screen.getByText(/4 вопросов/)).toBeTruthy();
  startExam();
  expect(screen.getByText('Вопрос 1 из 4')).toBeTruthy();
  expect(screen.getByText('Вопрос 1')).toBeTruthy();
  expect(screen.queryByText('Вопрос 2')).toBeNull();
  fireEvent.click(screen.getByText('a'));
  expect(screen.getByText('Вопрос 2 из 4')).toBeTruthy();
});

test('all correct: grade "Отлично", double XP, result in store', () => {
  render(<ChapterExam chapterId="ch" questions={questions} />);
  startExam();
  answerAll((qi) => questions[qi].correct);
  expect(screen.getByText('Отлично')).toBeTruthy();
  expect(screen.getByText(/\+40 XP/)).toBeTruthy();
  expect(store.getXp()).toBe(40);
  const stats = store.getExamStats('ch');
  expect(stats.count).toBe(1);
  expect(stats.best).toMatchObject({ correct: 4, total: 4 });
  // Экзамен считается в счётчике «Квизы x/y» ChapterProgress наравне с SelfCheck.
  expect(store.getProgress().quizzes.ch?.exam).toMatchObject({ correct: 4, total: 4 });
});

test('half correct: grade "Потренируйся ещё" and no XP', () => {
  render(<ChapterExam chapterId="ch" questions={questions} />);
  startExam();
  answerAll((qi) => (qi < 2 ? questions[qi].correct : 1 - questions[qi].correct));
  expect(screen.getByText('Потренируйся ещё')).toBeTruthy();
  expect(store.getXp()).toBe(0);
  expect(screen.getByText(/Верно: 2 из 4/)).toBeTruthy();
});

test('3 of 4 correct: grade "Хорошо", no double XP below 80%', () => {
  render(<ChapterExam chapterId="ch" questions={questions} />);
  startExam();
  answerAll((qi) => (qi < 3 ? questions[qi].correct : 1 - questions[qi].correct));
  expect(screen.getByText('Хорошо')).toBeTruthy();
  expect(store.getXp()).toBe(0);
});

test('timer expiry finishes the exam with answers given so far', () => {
  vi.useFakeTimers();
  render(<ChapterExam chapterId="ch" questions={questions} timeLimitSec={10} />);
  startExam();
  fireEvent.click(screen.getByText('a')); // 1 верный ответ из 4
  act(() => {
    vi.advanceTimersByTime(10_000);
  });
  expect(screen.getByText('Потренируйся ещё')).toBeTruthy();
  expect(screen.getByText(/Верно: 1 из 4/)).toBeTruthy();
  expect(store.getExamStats('ch').count).toBe(1);
});

test('timer counts down on screen', () => {
  vi.useFakeTimers();
  render(<ChapterExam chapterId="ch" questions={questions} timeLimitSec={90} />);
  startExam();
  expect(screen.getByText(/1:30/)).toBeTruthy();
  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(screen.getByText(/1:25/)).toBeTruthy();
});

test('retake restarts from question 1 and logs a second attempt, XP only once', () => {
  render(<ChapterExam chapterId="ch" questions={questions} />);
  startExam();
  answerAll((qi) => questions[qi].correct);
  expect(store.getXp()).toBe(40);
  fireEvent.click(screen.getByText('Пересдать'));
  expect(screen.getByText('Вопрос 1 из 4')).toBeTruthy();
  answerAll((qi) => questions[qi].correct);
  expect(store.getExamStats('ch').count).toBe(2);
  expect(store.getXp()).toBe(40); // повторно в той же сессии XP не даётся
});
