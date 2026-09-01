import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { store } from '../lib/store';
import CodeTyping from './CodeTyping';

beforeEach(() => {
  store.__resetForTests();
});

test('shows accuracy after typing full snippet', () => {
  render(<CodeTyping snippet="ab" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'ax' } });
  expect(screen.getByText(/Точность: 50%/)).toBeTruthy();
});

test('without chapterId/trainerId nothing is written to the store', () => {
  render(<CodeTyping snippet="ab" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText(/Точность: 100%/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
  expect(store.getProgress().trainers).toEqual({});
});

test('live counter shows speed and accuracy while typing, before completion', () => {
  render(<CodeTyping snippet="abcdef" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText(/зн\/мин/)).toBeTruthy();
  expect(screen.getByText(/точность \d+%/)).toBeTruthy();
});

test('completion records best trainer result and grants first-completion XP', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });

  const saved = store.getProgress().trainers.typing.t1.result as { cpm: number; accuracy: number };
  expect(saved.accuracy).toBe(100);
  expect(saved.cpm).toBeGreaterThan(0);
  expect(store.getXp()).toBe(10);
  expect(screen.getByText(/Лучший: \d+ зн\/мин · точность 100%/)).toBeTruthy();
});

test('"Ещё раз" resets the input but keeps the best result visible', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  fireEvent.click(screen.getByText('Ещё раз'));

  expect(screen.getByRole('textbox')).toBeTruthy();
  expect(screen.getByText(/Лучший: \d+ зн\/мин/)).toBeTruthy();
});

test('reaching the target shows "Цель достигнута!" and grants goal XP once', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" targetAccuracy={50} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText('Цель достигнута!')).toBeTruthy();
  // first-completion XP (10) + goal XP (15)
  expect(store.getXp()).toBe(25);

  fireEvent.click(screen.getByText('Ещё раз'));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  // goal already met by the stored best — no repeat goal XP, no repeat first-completion XP
  expect(store.getXp()).toBe(25);
});

test('missing the target shows "Цель пока не достигнута"', () => {
  render(<CodeTyping snippet="ab" chapterId="typing" trainerId="t1" targetAccuracy={999} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  expect(screen.getByText('Цель пока не достигнута')).toBeTruthy();
});

test('preset pool starts on the first fragment deterministically (no pool-switch button for a single pool)', () => {
  render(<CodeTyping preset="git" />);
  expect(screen.getByText('Следующий фрагмент')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'git' })).toBeNull();
});

test('"Следующий фрагмент" swaps to the other snippet in a 2-item pool and never repeats it', () => {
  render(<CodeTyping pools={[{ label: 'p', snippets: ['ab', 'cd'] }]} />);
  const codeText = () => screen.getByRole('textbox').closest('.ct')!.querySelector('.ct-code')!.textContent;
  expect(codeText()).toBe('ab');
  fireEvent.click(screen.getByText('Следующий фрагмент'));
  expect(codeText()).toBe('cd');
  fireEvent.click(screen.getByText('Следующий фрагмент'));
  expect(codeText()).toBe('ab');
});

test('multiple pools show a switcher and switching resets the trainer to the new pool', () => {
  render(
    <CodeTyping
      pools={[
        { label: 'Alpha', snippets: ['ab'] },
        { label: 'Beta', snippets: ['xy'] },
      ]}
    />,
  );
  const codeText = () => screen.getByRole('textbox').closest('.ct')!.querySelector('.ct-code')!.textContent;
  expect(codeText()).toBe('ab');
  fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
  expect(codeText()).toBe('xy');
});

test('plain snippet prop still works with no pool toolbar (backward compatibility)', () => {
  render(<CodeTyping snippet="ab" />);
  expect(screen.queryByText('Следующий фрагмент')).toBeNull();
});

test('keyboard prop renders a live InteractiveKeyboard highlighting the next expected key', () => {
  render(<CodeTyping snippet="ab" keyboard />);
  const keyA = screen.getByRole('img', { name: 'клавиша A' });
  expect(keyA.getAttribute('class')).toContain('kb-key-next');
});

test('keyboard prop marks the last typed key ok or err by comparing against the snippet', () => {
  render(<CodeTyping snippet="ab" keyboard />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
  expect(screen.getByRole('img', { name: 'клавиша A' }).getAttribute('class')).toContain('kb-key-active-ok');

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ax' } });
  expect(screen.getByRole('img', { name: 'клавиша X' }).getAttribute('class')).toContain('kb-key-active-err');
});

test('without the keyboard prop no InteractiveKeyboard is rendered', () => {
  render(<CodeTyping snippet="ab" />);
  expect(screen.queryByRole('img', { name: 'клавиша A' })).toBeNull();
});

// --- ghost: гонка с собой ---

afterEach(() => {
  vi.useRealTimers();
});

test('ghost: рекорд сохраняет таймлайн позиций по секундам вместе с фрагментом', () => {
  vi.useFakeTimers();
  render(<CodeTyping snippet="ab" chapterId="c" trainerId="t" ghost />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'a' } });
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  fireEvent.change(input, { target: { value: 'ab' } });
  const saved = store.getProgress().trainers.c.t.result as { timeline?: number[]; snippet?: string };
  expect(saved.snippet).toBe('ab');
  expect(saved.timeline).toEqual([1, 1, 2]);
});

test('ghost: до первого прохождения показывается подсказка про призрака', () => {
  render(<CodeTyping snippet="ab" chapterId="c" trainerId="t" ghost />);
  expect(screen.getByText(/призрак твоего рекорда/)).toBeTruthy();
});

test('ghost: после «Ещё раз» видна гонка — бары «Ты» и «Рекорд»', () => {
  vi.useFakeTimers();
  render(<CodeTyping snippet="ab" chapterId="c" trainerId="t" ghost />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'a' } });
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  fireEvent.change(input, { target: { value: 'ab' } });
  fireEvent.click(screen.getByText('Ещё раз'));
  expect(screen.getByText('Ты')).toBeTruthy();
  expect(screen.getByText('Рекорд')).toBeTruthy();
  expect(screen.queryByText(/призрак твоего рекорда/)).toBeNull();
});

test('ghost: побив рекорд, видим «Новый рекорд!» и призрак обновляется', () => {
  vi.useFakeTimers();
  render(<CodeTyping snippet="ab" chapterId="c" trainerId="t" ghost />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } }); // медленная попытка — рекорд №1
  fireEvent.click(screen.getByText('Ещё раз'));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
  act(() => {
    vi.advanceTimersByTime(100);
  });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } }); // быстрее — новый рекорд
  expect(screen.getByText(/Новый рекорд/)).toBeTruthy();
  const saved = store.getProgress().trainers.c.t.result as { timeline: number[] };
  expect(saved.timeline).toEqual([1, 2]);
});

test('без ghost таймлайн не пишется (обратная совместимость)', () => {
  render(<CodeTyping snippet="ab" chapterId="c" trainerId="t" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
  const saved = store.getProgress().trainers.c.t.result as { timeline?: number[] };
  expect(saved.timeline).toBeUndefined();
  expect(document.querySelector('.ct-ghost')).toBeNull();
});
