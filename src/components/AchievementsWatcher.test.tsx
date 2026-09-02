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

test('shows a +N XP toast on every XP gain, but not for XP already stored before mount', () => {
  store.addXp(30, 'preload'); // накоплено до монтирования — тоста быть не должно
  render(<AchievementsWatcher />);
  expect(screen.queryByText(/XP$/)).toBeNull();

  act(() => {
    store.addXp(15, 'test');
  });
  expect(screen.getByText('+15 XP')).toBeTruthy();
});

test('shows a big level-up toast when XP crosses into a new level', () => {
  render(<AchievementsWatcher />);
  act(() => {
    store.addXp(60, 'test'); // порог 2-го уровня — 50 XP (см. lib/levels.ts)
  });
  expect(screen.getByText(/Новый уровень 2:/)).toBeTruthy();
});
