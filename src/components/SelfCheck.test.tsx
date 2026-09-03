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

test('в зачёт идёт первая попытка: исправление неверного ответа не переписывает запись и не даёт XP', () => {
  render(<SelfCheck questions={questions} chapterId="typing" quizId="basics" />);
  fireEvent.click(screen.getByText('3')); // wrong
  fireEvent.click(screen.getByText('Москва')); // correct
  expect(store.getProgress().quizzes.typing?.basics).toMatchObject({ correct: 1, total: 2 });
  expect(store.getXp()).toBe(0);

  fireEvent.click(screen.getByText('4')); // исправил — но первая попытка уже записана
  expect(store.getProgress().quizzes.typing?.basics).toMatchObject({ correct: 1, total: 2 });
  expect(store.getXp()).toBe(0);
  expect(screen.queryByText(/Идеально/)).toBeNull();
  expect(screen.getByText(/С первой попытки: 1 из 2/)).toBeTruthy();
  // одна попытка на одно прохождение, а не запись на каждое исправление
  expect(store.quiz.stats('typing', 'basics').count).toBe(1);
});

test('прохождение без единой ошибки даёт XP, повторное (после перезагрузки) — уже нет', () => {
  const perfectRun = () => {
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('Москва'));
  };

  const first = render(<SelfCheck questions={questions} chapterId="typing" quizId="basics" />);
  perfectRun();
  expect(store.getProgress().quizzes.typing?.basics).toMatchObject({ correct: 2, total: 2 });
  const earned = store.getXp();
  expect(earned).toBeGreaterThan(0);
  expect(screen.getByText(/Идеально/)).toBeTruthy();
  first.unmount();

  render(<SelfCheck questions={questions} chapterId="typing" quizId="basics" />);
  perfectRun();
  expect(store.getXp()).toBe(earned);
  expect(store.quiz.stats('typing', 'basics').count).toBe(2); // попытка засчитана, XP — нет
});

test('without chapterId/quizId no store write happens (works as before)', () => {
  render(<SelfCheck questions={questions} />);
  fireEvent.click(screen.getByText('4'));
  fireEvent.click(screen.getByText('Москва'));
  expect(store.getProgress().quizzes).toEqual({});
  expect(store.getXp()).toBe(0);
});

test('without chapterId/quizId no "Мои результаты" block is shown', () => {
  render(<SelfCheck questions={questions} />);
  fireEvent.click(screen.getByText('4'));
  fireEvent.click(screen.getByText('Москва'));
  expect(screen.queryByText('Мои результаты')).toBeNull();
});

test('"Мои результаты" shows best/attempts/streak after a full perfect run', () => {
  render(<SelfCheck questions={questions} chapterId="typing" quizId="basics" />);
  fireEvent.click(screen.getByText('4')); // correct
  fireEvent.click(screen.getByText('Москва')); // correct -> single perfect completion
  expect(screen.getByText('Мои результаты')).toBeTruthy();
  expect(screen.getByText('Лучший: 2 из 2')).toBeTruthy();
  expect(screen.getByText('Попыток всего: 1')).toBeTruthy();
  expect(screen.getByText('Текущая серия без ошибок: 1')).toBeTruthy();
});

// --- эскалация подсказки после 2 неверных попыток (scaffolded hint) ---

test('no hint after a single wrong attempt', () => {
  render(<SelfCheck questions={questions} />);
  fireEvent.click(screen.getByText('Киев')); // 1-я неверная попытка вопроса 2
  expect(screen.queryByText(/Подсказка/)).toBeNull();
});

test('generic scaffolded hint appears after the 2nd wrong attempt, without leaking the answer', () => {
  render(<SelfCheck questions={questions} />);
  fireEvent.click(screen.getByText('Киев')); // 1-я неверная попытка
  fireEvent.click(screen.getByText('Минск')); // 2-я неверная попытка — должна показать подсказку
  expect(screen.getByText(/Подсказка/)).toBeTruthy();
  expect(document.querySelector('.sc-scaffold-hint')?.textContent).not.toContain('Москва');

  fireEvent.click(screen.getByText('Москва')); // теперь отвечает верно
  expect(screen.getByText('Верно!')).toBeTruthy();
  expect(screen.queryByText(/Подсказка/)).toBeNull();
});

test('an authored hint is shown instead of the generic fallback', () => {
  const withHint = [
    { q: '1 + 1?', options: ['1', '2', '3'], correct: 1, hint: 'Посчитай на пальцах.' },
  ];
  render(<SelfCheck questions={withHint} />);
  fireEvent.click(screen.getByText('1'));
  fireEvent.click(screen.getByText('3'));
  expect(screen.getByText('Посчитай на пальцах.')).toBeTruthy();
});

test('quiz history stats are keyed per quizId and read from store.quiz.stats', () => {
  store.markQuizDone('typing', 'q1', { correct: 1, total: 2 });
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'other', { correct: 2, total: 2 });
  const stats = store.quiz.stats('typing', 'q1');
  expect(stats.count).toBe(2);
  expect(stats.best).toMatchObject({ correct: 2, total: 2 });
  expect(stats.streak).toBe(1); // last q1 attempt perfect, the one before it was not
});
