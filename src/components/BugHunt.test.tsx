import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import BugHunt, { type BugRound } from './BugHunt';

const rounds: BugRound[] = [
  {
    lines: ['fun main() {', '    val record = 100', '    record = 120', '}'],
    bugLine: 2,
    error: "'val' cannot be reassigned.",
    why: 'record объявлена как val — второе значение положить некуда.',
  },
  {
    lines: ['fun main() {', '    val points: Int = "5"', '    println(points)', '}'],
    bugLine: 1,
    error: "Initializer type mismatch: expected 'Int', actual 'String'.",
    why: 'Обещан Int, а "5" в кавычках — строка.',
  },
];

beforeEach(() => {
  store.__resetForTests();
});

test('renders round with numbered lines and progress', () => {
  render(<BugHunt rounds={rounds} />);
  expect(screen.getByText(/Раунд 1 из 2/)).toBeTruthy();
  expect(screen.getByText('val record = 100')).toBeTruthy();
  expect(screen.getByText('record = 120')).toBeTruthy();
});

test('wrong line click says the line is fine', () => {
  render(<BugHunt rounds={rounds} />);
  fireEvent.click(screen.getByText('val record = 100'));
  expect(screen.getByText(/В строке 2 всё в порядке/)).toBeTruthy();
});

test('correct click shows the exact compiler message and unlocks next round', () => {
  render(<BugHunt rounds={rounds} />);
  fireEvent.click(screen.getByText('record = 120'));
  expect(screen.getByText('Верно!')).toBeTruthy();
  expect(screen.getByText("'val' cannot be reassigned.")).toBeTruthy();
  fireEvent.click(screen.getByText('Дальше →'));
  expect(screen.getByText(/Раунд 2 из 2/)).toBeTruthy();
});

test('perfect run marks trainer done and awards xp', () => {
  render(<BugHunt rounds={rounds} chapterId="kotlin-vars" trainerId="trainer-bug-hunt" />);
  fireEvent.click(screen.getByText('record = 120'));
  fireEvent.click(screen.getByText('Дальше →'));
  fireEvent.click(screen.getByText('val points: Int = "5"'));
  fireEvent.click(screen.getByText('Показать результат'));
  expect(screen.getByText(/Выполнено! С первого клика найдено 2 из 2/)).toBeTruthy();
  expect(store.getProgress().trainers['kotlin-vars']?.['trainer-bug-hunt']).toMatchObject({
    result: { firstTry: 2, total: 2 },
  });
  expect(store.getXp()).toBe(25);
});

test('imperfect run records result, gives no xp and offers a retry', () => {
  render(<BugHunt rounds={rounds} chapterId="kotlin-vars" trainerId="trainer-bug-hunt" />);
  fireEvent.click(screen.getByText('val record = 100')); // wrong
  fireEvent.click(screen.getByText('record = 120')); // correct, not first try
  fireEvent.click(screen.getByText('Дальше →'));
  fireEvent.click(screen.getByText('val points: Int = "5"'));
  fireEvent.click(screen.getByText('Показать результат'));
  expect(screen.getByText(/С первого клика найдено 1 из 2/)).toBeTruthy();
  expect(store.getProgress().trainers['kotlin-vars']?.['trainer-bug-hunt']).toMatchObject({
    result: { firstTry: 1, total: 2 },
  });
  expect(store.getXp()).toBe(0);
  fireEvent.click(screen.getByText('Пройти ещё раз'));
  expect(screen.getByText(/Раунд 1 из 2/)).toBeTruthy();
});

test('empty rounds render nothing without crashing', () => {
  const { container } = render(<BugHunt rounds={[]} />);
  expect(container.innerHTML).toBe('');
});

test('повторное прохождение (как после перезагрузки страницы) XP больше не начисляет', () => {
  const perfectRun = () => {
    fireEvent.click(screen.getByText('record = 120'));
    fireEvent.click(screen.getByText('Дальше →'));
    fireEvent.click(screen.getByText('val points: Int = "5"'));
    fireEvent.click(screen.getByText('Показать результат'));
  };

  const first = render(<BugHunt rounds={rounds} chapterId="kotlin-vars" trainerId="trainer-bug-hunt" />);
  perfectRun();
  expect(store.getXp()).toBe(25);
  expect(screen.getByText(/\+25 XP/)).toBeTruthy();
  first.unmount();

  // второй заход на ту же страницу: результат пишется, XP — нет, и плашка не врёт
  render(<BugHunt rounds={rounds} chapterId="kotlin-vars" trainerId="trainer-bug-hunt" />);
  perfectRun();
  expect(store.getXp()).toBe(25);
  expect(screen.queryByText(/\+25 XP/)).toBeNull();
  expect(screen.getByText(/Выполнено! С первого клика найдено 2 из 2/)).toBeTruthy();
});
