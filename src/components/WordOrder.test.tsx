import { render, screen, fireEvent, within } from '@testing-library/react';
import { store } from '../lib/store';
import WordOrder from './WordOrder';

beforeEach(() => {
  store.__resetForTests();
});

function pick(container: HTMLElement, word: string) {
  const bank = container.querySelector('.wo-bank') as HTMLElement;
  const btn = within(bank)
    .getAllByText(word)
    .find((b) => !(b as HTMLButtonElement).disabled) as HTMLElement;
  fireEvent.click(btn);
}

test('сбор фразы в правильном порядке: зелёная плашка, store и XP', () => {
  const { container } = render(<WordOrder phrase="null pointer exception" chapterId="c" trainerId="w1" />);
  pick(container, 'null');
  pick(container, 'pointer');
  pick(container, 'exception');
  expect(screen.getByText(/Собрано/)).toBeTruthy();
  expect(store.getProgress().trainers.c.w1.result).toMatchObject({ solved: true });
  expect(store.getXp()).toBe(10);
});

test('неправильный порядок: дружелюбная подсказка, слово можно вернуть и пересобрать', () => {
  const { container } = render(<WordOrder correct={['cannot', 'find']} />);
  pick(container, 'find');
  pick(container, 'cannot');
  expect(screen.getByText(/порядок не тот/)).toBeTruthy();
  const line = container.querySelector('.wo-line') as HTMLElement;
  fireEvent.click(within(line).getByText('find')); // вернули лишнее слово
  pick(container, 'find'); // и поставили его в конец
  expect(screen.getByText(/Собрано/)).toBeTruthy();
});

test('повторяющиеся слова считаются по отдельности', () => {
  const { container } = render(<WordOrder phrase="so so good" />);
  pick(container, 'so');
  pick(container, 'so');
  pick(container, 'good');
  expect(screen.getByText(/Собрано/)).toBeTruthy();
});

test('words может содержать лишние слова-обманки', () => {
  const { container } = render(<WordOrder correct={['val', 'x']} words={['x', 'val', 'var']} />);
  pick(container, 'val');
  pick(container, 'x');
  expect(screen.getByText(/Собрано/)).toBeTruthy();
});

test('повторное решение не даёт XP второй раз', () => {
  store.markTrainerDone('c', 'w1', { solved: true });
  const { container } = render(<WordOrder correct={['x', 'y']} chapterId="c" trainerId="w1" />);
  pick(container, 'x');
  pick(container, 'y');
  expect(screen.getByText(/Собрано/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
});

test('«Сбросить» очищает собранную строку', () => {
  const { container } = render(<WordOrder correct={['a', 'b', 'c']} />);
  pick(container, 'b');
  fireEvent.click(screen.getByText('Сбросить'));
  expect(screen.getByText(/Нажимай на слова внизу/)).toBeTruthy();
});
