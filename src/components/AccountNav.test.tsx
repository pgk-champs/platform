import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AccountNav from './AccountNav';
import { isLoggedIn, cachedProfile, fetchProfile } from '../lib/account';

// Профиль грузился с задержкой: до ответа /me шапка рисовала null (см. AccountNav),
// и на каждой полной загрузке страницы аватар вошедшего появлялся с опозданием
// на целый сетевой запрос. Кеш в localStorage должен закрывать эту паузу.
vi.mock('../lib/account', () => ({
  isLoggedIn: vi.fn(() => false),
  cachedProfile: vi.fn(() => null),
  fetchProfile: vi.fn(() => new Promise(() => {})), // /me ещё не ответил
  fetchContentMeta: vi.fn(() => new Promise(() => {})),
  subscribe: vi.fn(() => () => {}),
  login: vi.fn(),
  logout: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(isLoggedIn).mockReturnValue(true);
});

test('кешированный профиль виден сразу, не дожидаясь ответа /me', () => {
  vi.mocked(cachedProfile).mockReturnValue({
    id: 1,
    login: 'stud',
    name: 'Студент',
    avatar: 'https://example.com/a.png',
  });
  render(<AccountNav />);
  expect(screen.getByLabelText('Профиль: stud')).toBeTruthy();
});

test('без кеша до ответа сети шапка не рисует ни аватар, ни «Войти»', () => {
  vi.mocked(cachedProfile).mockReturnValue(null);
  const { container } = render(<AccountNav />);
  expect(container.querySelector('.an-login')).toBeNull();
  expect(screen.queryByLabelText(/Профиль/)).toBeNull();
});
