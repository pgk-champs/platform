import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import Hint from './Hint';

beforeEach(() => {
  store.__resetForTests();
});

test('renders label per type and children', () => {
  const labels: Record<string, string> = { tip: 'Совет', important: 'Важно', fact: 'Интересный факт' };
  for (const [type, label] of Object.entries(labels)) {
    const { unmount } = render(
      <Hint id={`h-${type}`} type={type as never}>
        Текст подсказки
      </Hint>,
    );
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText('Текст подсказки')).toBeTruthy();
    unmount();
  }
});

test('dismiss button persists dismissal and collapses the hint', () => {
  render(
    <Hint id="h1" type="tip">
      Текст подсказки
    </Hint>,
  );
  expect(store.isHintDismissed('h1')).toBe(false);
  fireEvent.click(screen.getByText('Понятно, больше не показывать'));
  expect(store.isHintDismissed('h1')).toBe(true);
  expect(screen.queryByText('Текст подсказки')).toBeNull();
  expect(screen.getByText(/Показать подсказку/)).toBeTruthy();
});

test('a hint already dismissed in store renders collapsed on mount', () => {
  store.dismissHint('h2');
  render(
    <Hint id="h2" type="important">
      Текст подсказки
    </Hint>,
  );
  expect(screen.queryByText('Текст подсказки')).toBeNull();
  expect(screen.getByText(/Показать подсказку/)).toBeTruthy();
});

test('clicking "Показать подсказку" re-expands the hint locally', () => {
  store.dismissHint('h3');
  render(
    <Hint id="h3" type="fact">
      Текст подсказки
    </Hint>,
  );
  fireEvent.click(screen.getByText(/Показать подсказку/));
  expect(screen.getByText('Текст подсказки')).toBeTruthy();
});
