import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ErrorTranslator from './ErrorTranslator';

beforeEach(() => {
  store.__resetForTests();
});

test('renders textarea, disabled parse button and three examples', () => {
  render(<ErrorTranslator />);
  expect(screen.getByPlaceholderText('Вставь сообщение об ошибке…')).toBeTruthy();
  expect(screen.getByText('Разобрать')).toBeDisabled();
  expect(screen.getByText(/cat: report.txt/)).toBeTruthy();
  expect(screen.getByText(/bash: \.\/run_tests.sh/)).toBeTruthy();
  expect(screen.getByText(/fatal: not a git repository/)).toBeTruthy();
});

test('parses pasted text: known words highlighted, paths dimmed, counter correct', () => {
  render(<ErrorTranslator />);
  fireEvent.change(screen.getByPlaceholderText('Вставь сообщение об ошибке…'), {
    target: { value: 'cat: report.txt: No such file or directory' },
  });
  fireEvent.click(screen.getByText('Разобрать'));
  // знакомые слова — кнопки с переводом в title
  const no = screen.getByRole('button', { name: 'No' });
  expect(no.className).toContain('et-known');
  expect(no.title).toBe('нет, никакого');
  expect(screen.getByRole('button', { name: 'directory' })).toBeTruthy();
  // путь приглушён и не кликается
  const out = screen.getByLabelText('Разобранное сообщение');
  const path = Array.from(out.querySelectorAll('span')).find((s) => s.textContent === 'report.txt:');
  expect(path?.className).toContain('et-service');
  // cat: — слово, но не из словаря; знакомых 5 из 6 (No such file or directory + cat)
  expect(screen.getByText('Знакомых слов: 5 из 6')).toBeTruthy();
});

test('click on a known word shows translation line', () => {
  render(<ErrorTranslator />);
  fireEvent.click(screen.getByText(/bash: \.\/run_tests.sh/));
  fireEvent.click(screen.getByRole('button', { name: 'Permission' }));
  expect(screen.getByText('permission').tagName).toBe('STRONG');
  expect(screen.getByText(/— разрешение/)).toBeTruthy();
});

test('plural fallback: directories translates via directory', () => {
  render(<ErrorTranslator />);
  fireEvent.click(screen.getByText(/fatal: not a git repository/));
  expect(screen.getByRole('button', { name: 'directories):' }).title).toBe('каталог');
});

test('first successful parse marks trainer done and awards xp once', () => {
  render(<ErrorTranslator chapterId="it-english" trainerId="trainer-error-translator" />);
  fireEvent.click(screen.getByText(/bash: \.\/run_tests.sh/));
  expect(screen.getByText('Выполнено! · +10 XP')).toBeTruthy();
  expect(store.getProgress().trainers['it-english']?.['trainer-error-translator']).toMatchObject({
    result: { known: 2, words: 3 },
  });
  expect(store.getXp()).toBe(10);
  // повторный разбор XP не добавляет
  fireEvent.click(screen.getByText(/cat: report.txt/));
  expect(store.getXp()).toBe(10);
});

test('text without known words gives no done plaque', () => {
  render(<ErrorTranslator chapterId="it-english" trainerId="trainer-error-translator" />);
  fireEvent.change(screen.getByPlaceholderText('Вставь сообщение об ошибке…'), {
    target: { value: 'segmentation violation core dumped' },
  });
  fireEvent.click(screen.getByText('Разобрать'));
  expect(screen.getByText('Знакомых слов: 0 из 4')).toBeTruthy();
  expect(screen.queryByText(/Выполнено!/)).toBeNull();
  expect(store.getXp()).toBe(0);
});
