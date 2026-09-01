import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import CodeSketchMatch from './CodeSketchMatch';

beforeEach(() => {
  store.__resetForTests();
});

// Порядок скетчей — сдвиг пар на одну позицию:
// Скетч 1 = row, Скетч 2 = button, Скетч 3 = column.
const matchAll = (correct: boolean) => {
  fireEvent.click(screen.getByText(/Привет, Олег!/)); // код Column
  fireEvent.click(screen.getByLabelText(correct ? 'Скетч 3' : 'Скетч 1'));
  fireEvent.click(screen.getByText(/Победы: 7/)); // код Row
  fireEvent.click(screen.getByLabelText(correct ? 'Скетч 1' : 'Скетч 3'));
  fireEvent.click(screen.getByText(/Начать/)); // код Button
  fireEvent.click(screen.getByLabelText('Скетч 2'));
};

test('renders three code fragments and three sketches, check disabled until all matched', () => {
  render(<CodeSketchMatch />);
  expect(screen.getByText(/Привет, Олег!/)).toBeTruthy();
  expect(screen.getByText(/Победы: 7/)).toBeTruthy();
  expect(screen.getByText(/Начать/)).toBeTruthy();
  expect(screen.getByLabelText('Скетч 1')).toBeTruthy();
  expect(screen.getByLabelText('Скетч 3')).toBeTruthy();
  expect(screen.getByText('Проверить')).toBeDisabled();
});

test('click code then sketch creates a pair badge and enables check after all three', () => {
  const { container } = render(<CodeSketchMatch />);
  fireEvent.click(screen.getByText(/Привет, Олег!/));
  fireEvent.click(screen.getByLabelText('Скетч 3'));
  expect(container.querySelector('.csm-badge')?.textContent).toBe('скетч 3');
  expect(screen.getByText('Проверить')).toBeDisabled();
  fireEvent.click(screen.getByText(/Победы: 7/));
  fireEvent.click(screen.getByLabelText('Скетч 1'));
  fireEvent.click(screen.getByText(/Начать/));
  fireEvent.click(screen.getByLabelText('Скетч 2'));
  expect(screen.getByText('Проверить')).not.toBeDisabled();
});

test('clicking a matched code breaks the pair', () => {
  const { container } = render(<CodeSketchMatch />);
  fireEvent.click(screen.getByText(/Привет, Олег!/));
  fireEvent.click(screen.getByLabelText('Скетч 3'));
  expect(container.querySelector('.csm-badge')).toBeTruthy();
  fireEvent.click(screen.getByText(/Привет, Олег!/));
  expect(container.querySelector('.csm-badge')).toBeNull();
});

test('perfect match shows done banner, marks trainer and awards xp', () => {
  render(<CodeSketchMatch chapterId="first-compose-screen" trainerId="trainer-code-sketch" />);
  matchAll(true);
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(
    store.getProgress().trainers['first-compose-screen']?.['trainer-code-sketch'],
  ).toMatchObject({ result: { correct: 3, total: 3 } });
  expect(store.getXp()).toBe(15);
});

test('wrong match shows explanations, records result and gives no xp', () => {
  render(<CodeSketchMatch chapterId="c" trainerId="t" />);
  matchAll(false); // Column и Row перепутаны местами
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/Не сошлось: 2 из 3/)).toBeTruthy();
  expect(screen.getByText(/сверху вниз/)).toBeTruthy();
  expect(screen.getByText(/слева направо/)).toBeTruthy();
  expect(store.getProgress().trainers.c?.t).toMatchObject({ result: { correct: 1, total: 3 } });
  expect(store.getXp()).toBe(0);
});

test('empty pairs render nothing without crashing', () => {
  const { container } = render(<CodeSketchMatch pairs={[]} />);
  expect(container.innerHTML).toBe('');
});
