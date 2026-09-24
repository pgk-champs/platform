import React from 'react';
import { render, screen } from '@testing-library/react';
import CommunityBoard from './CommunityBoard';

function mockFetch(impl: () => Promise<unknown>) {
  const spy = vi.fn(impl);
  vi.stubGlobal('fetch', spy);
  return spy;
}
function okResponse(json: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(json) });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('место, участник, принято и отправлено — по каждой строке', async () => {
  mockFetch(() =>
    okResponse({
      rows: [
        { gh_id: 1, login: 'nina', name: 'Нина', avatar: '', submitted: 2, approved: 1, place: 1, me: false },
        { gh_id: 2, login: 'pasha', name: '', avatar: '', submitted: 1, approved: 0, place: 2, me: true },
      ],
    }),
  );
  render(<CommunityBoard />);
  expect(await screen.findByText('Нина')).toBeTruthy();
  // у второго имени с GitHub нет — берём логин, а не пустую строку
  expect(screen.getByText('pasha')).toBeTruthy();
  // это я — пилюля видна
  expect(screen.getByText('ты')).toBeTruthy();
  const rows = screen.getAllByRole('row');
  expect(rows[1].textContent).toContain('1'); // принято у нины
  expect(rows[1].textContent).toContain('2'); // отправлено у нины
});

test('пустой каталог приглашает стать первым, а не молчит', async () => {
  mockFetch(() => okResponse({ rows: [] }));
  render(<CommunityBoard />);
  expect(await screen.findByText(/стань первым/)).toBeTruthy();
});

test('сервер не ответил — не путается с пустым каталогом', async () => {
  mockFetch(() => Promise.reject(new Error('network')));
  render(<CommunityBoard />);
  expect(await screen.findByText(/сейчас недоступен/)).toBeTruthy();
  expect(screen.queryByText(/стань первым/)).toBeNull();
});
