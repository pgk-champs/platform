import { render, screen, act } from '@testing-library/react';
import { store } from '../lib/store';
import AchievementsWatcher from './AchievementsWatcher';

beforeEach(() => {
  store.__resetForTests();
});

test('shows a toast when a store change unlocks a new achievement', () => {
  render(<AchievementsWatcher />);
  expect(screen.queryByText(/Достижение:/)).toBeNull();

  act(() => {
    store.setSectionRead('typing', 'intro'); // triggers 'первая-прочитанная-глава'
  });

  expect(screen.getByText(/Достижение: Первая прочитанная глава/)).toBeTruthy();
});

test('toast auto-hides after 4 seconds', () => {
  vi.useFakeTimers();
  render(<AchievementsWatcher />);
  act(() => {
    store.setSectionRead('typing', 'intro');
  });
  expect(screen.getByText(/Достижение:/)).toBeTruthy();

  act(() => {
    vi.advanceTimersByTime(4000);
  });
  expect(screen.queryByText(/Достижение:/)).toBeNull();
  vi.useRealTimers();
});
