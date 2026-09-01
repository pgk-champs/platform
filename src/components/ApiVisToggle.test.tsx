import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ApiVisToggle from './ApiVisToggle';

beforeEach(() => {
  store.__resetForTests();
});

test('api mode by default: class visible, build successful, no error', () => {
  render(<ApiVisToggle />);
  expect(screen.getByText(/виден из :app/)).toBeTruthy();
  expect(screen.getByText(/BUILD SUCCESSFUL/)).toBeTruthy();
  expect(screen.queryByText(/Unresolved reference/)).toBeNull();
});

test('implementation mode hides the class and shows Unresolved reference', () => {
  render(<ApiVisToggle />);
  fireEvent.click(screen.getByRole('button', { name: 'implementation' }));
  expect(screen.getByText(/НЕ виден из :app/)).toBeTruthy();
  expect(screen.getByText(/Unresolved reference 'lib'/)).toBeTruthy();
  expect(screen.queryByText(/BUILD SUCCESSFUL/)).toBeNull();
});

test('toggling back to api restores visibility', () => {
  render(<ApiVisToggle />);
  fireEvent.click(screen.getByRole('button', { name: 'implementation' }));
  fireEvent.click(screen.getByRole('button', { name: 'api' }));
  expect(screen.getByText(/BUILD SUCCESSFUL/)).toBeTruthy();
  expect(screen.queryByText(/Unresolved reference/)).toBeNull();
});

test('seeing both modes finishes, marks trainer done and awards xp once', () => {
  render(<ApiVisToggle chapterId="ui-kit" trainerId="api-vis" />);
  expect(screen.queryByText(/Выполнено!/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'implementation' }));
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers['ui-kit']?.['api-vis']).toBeTruthy();
  expect(store.getXp()).toBe(10);
  fireEvent.click(screen.getByRole('button', { name: 'api' }));
  expect(store.getXp()).toBe(10);
});
