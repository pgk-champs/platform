import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import PredictOutput from './PredictOutput';

beforeEach(() => {
  store.__resetForTests();
});

test('верный ответ с первой попытки: «Верно», XP и запись в store', () => {
  render(<PredictOutput code="println(2 + 2)" expected="4" chapterId="c" trainerId="p1" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: ' 4 ' } });
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/Верно — с первой попытки/)).toBeTruthy();
  expect(store.getXp()).toBe(10);
  expect(store.getProgress().trainers.c.p1.result).toMatchObject({ attempts: 1 });
});

test('неверный ответ: дружелюбная подсказка, со второй попытки «Верно» без XP', () => {
  render(<PredictOutput code="println(2 + 2)" expected="4" chapterId="c" trainerId="p1" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '5' } });
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/Пока не так/)).toBeTruthy();
  fireEvent.change(input, { target: { value: '4' } });
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText('Верно!')).toBeTruthy();
  expect(store.getXp()).toBe(0);
  expect(store.getProgress().trainers.c.p1.result).toMatchObject({ attempts: 2 });
});

test('normalizeWhitespace прощает лишние пробелы и переводы строк', () => {
  render(<PredictOutput code="..." expected={'1 2'} normalizeWhitespace />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '1   \n2' } });
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/Верно/)).toBeTruthy();
});

test('после трёх неудач появляется «Показать ответ»; раскрытие не даёт XP и записи', () => {
  render(<PredictOutput code="..." expected="42" chapterId="c" trainerId="p1" />);
  const input = screen.getByRole('textbox');
  for (const v of ['1', '2', '3']) {
    fireEvent.change(input, { target: { value: v } });
    fireEvent.click(screen.getByText('Проверить'));
  }
  fireEvent.click(screen.getByText('Показать ответ'));
  expect(screen.getByText('42')).toBeTruthy();
  expect(store.getXp()).toBe(0);
  expect(store.getProgress().trainers).toEqual({});
});

test('kotlin: после верного ответа появляется «запусти и убедись» с KotlinPlay', () => {
  const { container } = render(<PredictOutput code={'fun main() { println(4) }'} expected="4" kotlin />);
  expect(container.querySelector('.kotlin-playground')).toBeNull();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '4' } });
  fireEvent.click(screen.getByText('Проверить'));
  expect(screen.getByText(/запусти и убедись/)).toBeTruthy();
  expect(container.querySelector('.kotlin-playground')?.textContent).toBe('fun main() { println(4) }');
});
