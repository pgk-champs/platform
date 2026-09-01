import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import RememberSim from './RememberSim';

beforeEach(() => {
  store.__resetForTests();
});

test('без remember: рекомпозиция сбрасывает счёт в 0', () => {
  const { container } = render(<RememberSim />);
  const text = () => container.textContent ?? '';
  const plus = screen.getByText('Плюс (count++)');

  expect(text()).toContain('var count = 0');
  fireEvent.click(plus);
  fireEvent.click(plus);
  expect(text()).toContain('Счёт: 2');

  fireEvent.click(screen.getByText('Форсировать рекомпозицию'));
  expect(text()).toContain('Счёт: 0');
  expect(text()).toContain('Рекомпозиций: 1');
  expect(text()).toContain('накопленное значение 2 потеряно');
});

test('с remember: рекомпозиция сохраняет счёт', () => {
  const { container } = render(<RememberSim />);
  const text = () => container.textContent ?? '';

  fireEvent.click(screen.getByText('с remember'));
  expect(text()).toContain('var count by remember { mutableStateOf(0) }');

  const plus = screen.getByText('Плюс (count++)');
  fireEvent.click(plus);
  fireEvent.click(plus);
  fireEvent.click(screen.getByText('Форсировать рекомпозицию'));

  expect(text()).toContain('Счёт: 2');
  expect(text()).toContain('remember отдал сохранённое значение');
});

test('обе судьбы значения: плашка «Выполнено!», запись в store и XP', () => {
  const { container } = render(
    <RememberSim chapterId="state-events" trainerId="trainer-remember-sim" />,
  );
  const text = () => container.textContent ?? '';
  const plus = () => fireEvent.click(screen.getByText('Плюс (count++)'));
  const recompose = () => fireEvent.click(screen.getByText('Форсировать рекомпозицию'));

  // без remember: сброс
  plus();
  recompose();
  expect(screen.queryByText(/Выполнено!/)).toBeNull();

  // с remember: сохранение
  fireEvent.click(screen.getByText('с remember'));
  plus();
  recompose();

  expect(text()).toContain('Выполнено!');
  const rec = store.getProgress().trainers['state-events']?.['trainer-remember-sim'];
  expect(rec).toBeTruthy();
  expect(store.getXp()).toBeGreaterThan(0);
});

test('переключение режима обнуляет счёт и рекомпозиции', () => {
  const { container } = render(<RememberSim />);
  const text = () => container.textContent ?? '';

  fireEvent.click(screen.getByText('Плюс (count++)'));
  fireEvent.click(screen.getByText('Форсировать рекомпозицию'));
  fireEvent.click(screen.getByText('с remember'));

  expect(text()).toContain('Счёт: 0');
  expect(text()).toContain('Рекомпозиций: 0');
  expect(text()).toContain('Режим «с remember»');
});
