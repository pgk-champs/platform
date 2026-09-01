import { render, screen, fireEvent, act } from '@testing-library/react';
import { store } from '../lib/store';
import MatchPairs, { type Pair } from './MatchPairs';

const PAIRS: Pair[] = [
  { term: 'error', translation: 'ошибка' },
  { term: 'file', translation: 'файл' },
];
const PARTNER: Record<string, string> = {
  error: 'ошибка',
  ошибка: 'error',
  file: 'файл',
  файл: 'file',
};

beforeEach(() => {
  store.__resetForTests();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function cardButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('.mp-card'));
}

// Раскладка детерминированная (seeded shuffle) — «подглядываем» её отдельным
// рендером: кликаем по каждой карточке, читаем текст, размонтируем.
function learnLayout(): string[] {
  const { container, unmount } = render(<MatchPairs pairs={PAIRS} />);
  const btns = cardButtons(container);
  const texts = btns.map(() => '');
  btns.forEach((btn, i) => {
    fireEvent.click(btn);
    texts[i] = btn.textContent ?? '';
    act(() => vi.advanceTimersByTime(1000)); // несовпавшие закрываются сами
  });
  unmount();
  return texts;
}

test('совпавшая пара остаётся открытой и зелёной', () => {
  const texts = learnLayout();
  const { container } = render(<MatchPairs pairs={PAIRS} />);
  const btns = cardButtons(container);
  const i = texts.indexOf('error');
  const j = texts.indexOf('ошибка');
  fireEvent.click(btns[i]);
  fireEvent.click(btns[j]);
  expect(btns[i].className).toContain('mp-matched');
  expect(btns[j].className).toContain('mp-matched');
  expect(screen.getByText('Пары 1/2')).toBeTruthy();
});

test('несовпавшие карточки закрываются по таймеру, ход посчитан', () => {
  const texts = learnLayout();
  const { container } = render(<MatchPairs pairs={PAIRS} />);
  const btns = cardButtons(container);
  const i = texts.indexOf('error');
  const j = texts.indexOf('file');
  fireEvent.click(btns[i]);
  fireEvent.click(btns[j]);
  expect(btns[i].textContent).toBe('error'); // открыты, но не совпали
  expect(screen.getByText('Ходы 1')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1000));
  expect(btns[i].textContent).toBe('?');
  expect(btns[j].textContent).toBe('?');
});

test('полное прохождение: итог, запись в store и XP', () => {
  const texts = learnLayout();
  const { container } = render(<MatchPairs pairs={PAIRS} chapterId="c" trainerId="m1" />);
  const btns = cardButtons(container);
  texts.forEach((t, i) => {
    if (btns[i].disabled) return;
    fireEvent.click(btns[i]);
    fireEvent.click(btns[texts.indexOf(PARTNER[t])]);
  });
  expect(screen.getByText(/Все пары найдены/)).toBeTruthy();
  expect(store.getProgress().trainers.c.m1.result).toMatchObject({ moves: 2 });
  expect(store.getXp()).toBe(10);
});

test('повторное прохождение не даёт XP второй раз', () => {
  store.markTrainerDone('c', 'm1', { moves: 2, seconds: 5 });
  const texts = learnLayout();
  const { container } = render(<MatchPairs pairs={PAIRS} chapterId="c" trainerId="m1" />);
  const btns = cardButtons(container);
  texts.forEach((t, i) => {
    if (btns[i].disabled) return;
    fireEvent.click(btns[i]);
    fireEvent.click(btns[texts.indexOf(PARTNER[t])]);
  });
  expect(screen.getByText(/Все пары найдены/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
});

test('таймер стартует с первого клика и тикает', () => {
  const { container } = render(<MatchPairs pairs={PAIRS} />);
  expect(screen.getByText('Время 0:00')).toBeTruthy();
  act(() => vi.advanceTimersByTime(3000)); // до первого клика не тикает
  expect(screen.getByText('Время 0:00')).toBeTruthy();
  fireEvent.click(cardButtons(container)[0]);
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByText('Время 0:02')).toBeTruthy();
});
