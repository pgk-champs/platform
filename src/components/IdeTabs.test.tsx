import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import IdeTabs from './IdeTabs';

beforeEach(() => {
  store.__resetForTests();
});

const items = [
  { ide: 'webstorm' as const, content: 'Открой Project (Alt+1 / ⌘1) слева.' },
  { ide: 'vscode' as const, content: 'В Explorer слева — та же панель файлов.' },
];

test('defaults to WebStorm when no IDE preference is saved', () => {
  render(<IdeTabs items={items} />);
  expect(screen.getByRole('tab', { name: 'WebStorm', selected: true })).toBeTruthy();
  expect(screen.getByText('Открой Project (Alt+1 / ⌘1) слева.')).toBeTruthy();
});

test('switching IDE updates the shown content and persists globally', () => {
  render(<IdeTabs items={items} />);
  fireEvent.click(screen.getByRole('tab', { name: 'VS Code' }));
  expect(screen.getByText('В Explorer слева — та же панель файлов.')).toBeTruthy();
  expect(store.prefs.getIde()).toBe('vscode');
});

test('a saved IDE preference is picked up by a fresh instance', () => {
  store.prefs.setIde('vscode');
  render(<IdeTabs items={items} />);
  expect(screen.getByRole('tab', { name: 'VS Code', selected: true })).toBeTruthy();
});

test('ignores a saved preference outside the given items and falls back to defaultIde', () => {
  store.prefs.setIde('android-studio');
  render(<IdeTabs items={items} />);
  expect(screen.getByRole('tab', { name: 'WebStorm', selected: true })).toBeTruthy();
});

test('renders nothing for an empty item list', () => {
  const { container } = render(<IdeTabs items={[]} />);
  expect(container.firstChild).toBeNull();
});
