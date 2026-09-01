import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import CallTracer, { STEPS } from './CallTracer';

beforeEach(() => {
  store.__resetForTests();
});

function stepN(n: number) {
  for (let i = 0; i < n; i += 1) fireEvent.click(screen.getByText('Шаг'));
}

test('до старта: подсказка видна, строка не подсвечена, счётчика нет', () => {
  const { container } = render(<CallTracer />);
  expect(screen.getByText(/Нажимай «Шаг»/)).toBeTruthy();
  expect(container.querySelector('.ctr-line-active')).toBeNull();
  expect(screen.queryByText(/Шаг 1 из/)).toBeNull();
});

test('шаги подсвечивают строку и показывают значения it', () => {
  const { container } = render(<CallTracer />);
  stepN(5); // шаг с it = 3 → 3000
  expect(screen.getByText(`Шаг 5 из ${STEPS.length}`)).toBeTruthy();
  expect(screen.getByText('3 → 3000')).toBeTruthy();
  const active = container.querySelector('.ctr-line-active');
  expect(active?.textContent).toContain('return km.map { it * 1000 }');
  stepN(1);
  expect(screen.getByText('5 → 5000')).toBeTruthy();
});

test('прохождение до конца: вывод, Выполнено, store и XP', () => {
  render(<CallTracer chapterId="functions-lambdas" trainerId="trainer-call-tracer" />);
  stepN(STEPS.length);
  expect(screen.getByText(/Выполнено! Трассировка пройдена/)).toBeTruthy();
  expect(screen.getByText('[3000, 5000, 4000]')).toBeTruthy();
  expect(screen.queryByText('Шаг')).toBeNull();
  expect(
    store.getProgress().trainers['functions-lambdas']?.['trainer-call-tracer'],
  ).toMatchObject({ result: { solved: true, steps: STEPS.length } });
  expect(store.getXp()).toBe(15);
});

test('Сначала сбрасывает трассировку, XP повторно не начисляется', () => {
  render(<CallTracer chapterId="functions-lambdas" trainerId="trainer-call-tracer" />);
  stepN(STEPS.length);
  expect(store.getXp()).toBe(15);
  fireEvent.click(screen.getByText('Сначала'));
  expect(screen.getByText(/Нажимай «Шаг»/)).toBeTruthy();
  stepN(STEPS.length);
  expect(store.getXp()).toBe(15);
});
