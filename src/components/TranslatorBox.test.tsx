import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import TranslatorBox from './TranslatorBox';

beforeEach(() => {
  store.__resetForTests();
  vi.restoreAllMocks();
});

test('кнопки заблокированы, пока фраза пустая', () => {
  render(<TranslatorBox />);
  expect(screen.getByRole('button', { name: 'DeepL' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Google' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Яндекс' })).toBeDisabled();
});

test('клик открывает переводчик с фразой и один раз даёт прогресс + XP', () => {
  const open = vi.spyOn(window, 'open').mockImplementation(() => null);
  render(<TranslatorBox chapterId="it-english" trainerId="trainer-translator-box" />);

  fireEvent.change(screen.getByLabelText('Фраза для перевода'), { target: { value: 'no such file' } });
  fireEvent.click(screen.getByRole('button', { name: 'Google' }));

  expect(open).toHaveBeenCalledWith(
    expect.stringContaining('translate.google.com'),
    '_blank',
    'noopener,noreferrer',
  );
  expect(open.mock.calls[0][0]).toContain('no%20such%20file');
  expect(store.getProgress().trainers['it-english']?.['trainer-translator-box']).toBeTruthy();
  const xpAfterFirst = store.getXp();
  expect(xpAfterFirst).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole('button', { name: 'DeepL' }));
  expect(store.getXp()).toBe(xpAfterFirst); // повторное использование XP не удваивает
});

test('памятка о правильном использовании присутствует', () => {
  render(<TranslatorBox />);
  expect(screen.getByText(/обратным переводом/)).toBeTruthy();
  expect(screen.getByText(/фразами, а не отдельными словами/)).toBeTruthy();
});
