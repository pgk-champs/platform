import { render, screen, fireEvent, within } from '@testing-library/react';
import { store } from '../lib/store';
import SignatureBuilder, { type SigTask } from './SignatureBuilder';

const tasks: SigTask[] = [
  {
    brief: 'Функция greet: принимает имя-строку, возвращает строку.',
    pieces: ['fun ', 'greet', '(', 'name: ', 'String', ')', ': ', 'String'],
  },
  {
    brief: 'Функция greet с приветствием по умолчанию.',
    pieces: ['fun greet', '(name: String, ', 'greeting: String', ' = ', '"Привет"', ')'],
  },
];

beforeEach(() => {
  store.__resetForTests();
});

function bank() {
  return within(screen.getByLabelText('Банк кусочков'));
}

/** Кликает по первому ещё не выбранному чипу с таким текстом (дубликаты — два String). */
function clickPiece(text: string) {
  // testing-library нормализует пробелы, поэтому ищем по обрезанному тексту
  const btn = bank()
    .getAllByText(text.trim())
    .map((el) => el.closest('button') as HTMLButtonElement)
    .find((b) => !b.disabled);
  fireEvent.click(btn!);
}

function solveTask(pieces: string[]) {
  for (const p of pieces) clickPiece(p);
  fireEvent.click(screen.getByText('Проверить сигнатуру'));
}

test('показывает задание, кнопка проверки заблокирована до полного набора', () => {
  render(<SignatureBuilder tasks={tasks} />);
  expect(screen.getByText(/Задание 1 из 2/)).toBeTruthy();
  expect(screen.getByText(/имя-строку/)).toBeTruthy();
  expect(screen.getByText('Проверить сигнатуру')).toBeDisabled();
  clickPiece('fun ');
  expect(screen.getByText('Проверить сигнатуру')).toBeDisabled();
});

test('правильная сборка показывает код и «Верно!», переход к следующему заданию', () => {
  render(<SignatureBuilder tasks={tasks} />);
  solveTask(tasks[0].pieces);
  expect(screen.getByText(/Верно!/)).toBeTruthy();
  expect(screen.getByLabelText('Собранный код').textContent).toBe('fun greet(name: String): String');
  fireEvent.click(screen.getByText('Следующее задание'));
  expect(screen.getByText(/Задание 2 из 2/)).toBeTruthy();
});

test('неправильный порядок: сообщение об ошибке, можно вернуть чип и пересобрать', () => {
  render(<SignatureBuilder tasks={[tasks[0]]} chapterId="functions-lambdas" trainerId="t" />);
  // собираем в обратном порядке
  for (const p of [...tasks[0].pieces].reverse()) clickPiece(p);
  fireEvent.click(screen.getByText('Проверить сигнатуру'));
  expect(screen.getByText(/Пока не то/)).toBeTruthy();
  expect(store.getXp()).toBe(0);

  // возвращаем всё в банк кликами по собранным чипам и собираем правильно
  const seq = screen.getByLabelText('Собранная сигнатура');
  while (seq.querySelector('button')) {
    fireEvent.click(seq.querySelector('button')!);
  }
  solveTask(tasks[0].pieces);
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
});

test('все задания решены: Выполнено, store и XP один раз', () => {
  render(
    <SignatureBuilder tasks={tasks} chapterId="functions-lambdas" trainerId="trainer-signature-builder" />,
  );
  solveTask(tasks[0].pieces);
  fireEvent.click(screen.getByText('Следующее задание'));
  solveTask(tasks[1].pieces);
  expect(screen.getByText(/Выполнено! Все сигнатуры собраны/)).toBeTruthy();
  expect(
    store.getProgress().trainers['functions-lambdas']?.['trainer-signature-builder'],
  ).toMatchObject({ result: { solved: true, tasks: 2 } });
  expect(store.getXp()).toBe(20);
});

test('пустой список заданий не рендерит ничего', () => {
  const { container } = render(<SignatureBuilder tasks={[]} />);
  expect(container.innerHTML).toBe('');
});
