import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import KeysTabs from './KeysTabs';

beforeEach(() => {
  store.__resetForTests();
});

const items = [
  { combo: { mac: '⌘C', win: 'Ctrl+C', linux: 'Ctrl+C' }, action: 'Копировать' },
  { combo: { mac: '⌘⇧Z', win: 'Ctrl+Y', linux: 'Ctrl+Shift+Z' }, action: 'Повторить' },
];

test('без сохранённого выбора показывает сочетания определённой браузером ОС (в jsdom — Windows)', () => {
  render(<KeysTabs items={items} />);
  expect(screen.getByText('Ctrl+C')).toBeTruthy();
  expect(screen.getByText('Ctrl+Y')).toBeTruthy();
  expect(screen.queryByText('⌘C')).toBeNull();
  expect(store.prefs.getOs()).toBe('win');
});

test('сохранённый выбор macOS остаётся: автоопределение не перебивает студента', () => {
  store.prefs.setOs('mac');
  render(<KeysTabs items={items} />);
  expect(screen.getByText('⌘C')).toBeTruthy();
  expect(store.prefs.getOs()).toBe('mac');
});

test('switching OS updates the shown combos and persists globally', () => {
  render(<KeysTabs items={items} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Windows' }));
  expect(screen.getByText('Ctrl+C')).toBeTruthy();
  expect(screen.getByText('Ctrl+Y')).toBeTruthy();
  expect(store.prefs.getOs()).toBe('win');
});

test('a saved OS preference is picked up by a fresh instance', () => {
  store.prefs.setOs('linux');
  render(<KeysTabs items={items} />);
  expect(screen.getByText('Ctrl+Shift+Z')).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Ubuntu', selected: true })).toBeTruthy();
});

test('renders the action description next to each combo', () => {
  render(<KeysTabs items={items} />);
  expect(screen.getByText('Копировать')).toBeTruthy();
  expect(screen.getByText('Повторить')).toBeTruthy();
});
