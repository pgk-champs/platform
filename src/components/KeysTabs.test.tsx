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

test('defaults to macOS combos when no OS preference is saved', () => {
  render(<KeysTabs items={items} />);
  expect(screen.getByText('⌘C')).toBeTruthy();
  expect(screen.getByText('⌘⇧Z')).toBeTruthy();
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
