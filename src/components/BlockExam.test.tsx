import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import BlockExam from './BlockExam';

const questions = [
  { q: 'Вопрос 1', options: ['a', 'b'], correct: 0 },
  { q: 'Вопрос 2', options: ['c', 'd'], correct: 1 },
  { q: 'Вопрос 3', options: ['e', 'f'], correct: 0 },
  { q: 'Вопрос 4', options: ['g', 'h'], correct: 1 },
  { q: 'Вопрос 5', options: ['i', 'j'], correct: 0 },
];
const chapters = ['ch-a', 'ch-b', 'ch-c'];

beforeEach(() => {
  store.__resetForTests();
});

function renderExam() {
  return render(
    <BlockExam blockId="solidity" title="Solidity" chapterIds={chapters} questions={questions} timeLimitSec={120} />,
  );
}

function answerAll(pattern: (qi: number) => number) {
  for (let qi = 0; qi < questions.length; qi += 1) {
    fireEvent.click(screen.getByText(questions[qi].options[pattern(qi)]));
  }
}

test('intro shows readiness: how many chapter exams of the block are passed', () => {
  store.markExamDone('ch-a', { correct: 5, total: 5 });
  store.markExamDone('ch-b', { correct: 2, total: 5 }); // ниже порога — не считается
  renderExam();
  expect(screen.getByText(/сданы 1 из 3/)).toBeTruthy();
  expect(screen.getByText(/5 вопросов/)).toBeTruthy();
});

test('pass: result under block: key, 100 XP once, chapter progress untouched', () => {
  renderExam();
  fireEvent.click(screen.getByText('Начать экзамен по блоку'));
  expect(screen.getByText('Вопрос 1 из 5')).toBeTruthy();
  answerAll((qi) => questions[qi].correct);
  expect(screen.getByText('Блок сдан')).toBeTruthy();
  expect(screen.getByText(/\+100 XP/)).toBeTruthy();
  expect(store.getXp()).toBe(100);
  expect(store.getExamStats('block:solidity').best).toMatchObject({ correct: 5, total: 5 });
  // Блочный экзамен не пишет в квизы глав — счётчики ChapterProgress не трогает.
  expect(store.getProgress().quizzes['ch-a']).toBeUndefined();
  expect(store.getProgress().quizzes['block:solidity']).toBeUndefined();
});

test('fail: grade points back to chapters and no XP', () => {
  renderExam();
  fireEvent.click(screen.getByText('Начать экзамен по блоку'));
  answerAll((qi) => 1 - questions[qi].correct);
  expect(screen.getByText(/вернись к главам блока/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
  expect(store.getExamStats('block:solidity').count).toBe(1);
});
