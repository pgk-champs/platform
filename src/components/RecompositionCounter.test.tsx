import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import RecompositionCounter from './RecompositionCounter';

beforeEach(() => {
  store.__resetForTests();
});

test('первая отрисовка: все три бейджа показывают один рендер', () => {
  render(<RecompositionCounter />);
  expect(screen.getByTestId('rcc-badge-parent').textContent).toBe('перерисован 1 раз');
  expect(screen.getByTestId('rcc-badge-counter').textContent).toBe('перерисован 1 раз');
  expect(screen.getByTestId('rcc-badge-name').textContent).toBe('перерисован 1 раз');
});

test('клик перерисовывает родителя и «Счёт», но не «Имя»', () => {
  const { container } = render(<RecompositionCounter />);
  const btn = screen.getByText('Плюс (count++)');

  fireEvent.click(btn);
  expect(container.textContent).toContain('Счёт: 1');
  expect(screen.getByTestId('rcc-badge-parent').textContent).toBe('перерисован 2 раза');
  expect(screen.getByTestId('rcc-badge-counter').textContent).toBe('перерисован 2 раза');
  expect(screen.getByTestId('rcc-badge-name').textContent).toBe('перерисован 1 раз');
  expect(container.textContent).toContain('«Имя» не перерисовано');
});

test('три клика: плашка «Выполнено!», запись в store и XP', () => {
  const { container } = render(
    <RecompositionCounter chapterId="state-events" trainerId="trainer-recomposition-counter" />,
  );
  const btn = screen.getByText('Плюс (count++)');
  expect(screen.queryByText(/Выполнено!/)).toBeNull();

  fireEvent.click(btn);
  fireEvent.click(btn);
  fireEvent.click(btn);

  expect(container.textContent).toContain('Выполнено!');
  expect(screen.getByTestId('rcc-badge-name').textContent).toBe('перерисован 1 раз');
  const rec = store.getProgress().trainers['state-events']?.['trainer-recomposition-counter'];
  expect(rec).toBeTruthy();
  expect((rec?.result as { clicks: number }).clicks).toBe(3);
  expect(store.getXp()).toBeGreaterThan(0);
});
