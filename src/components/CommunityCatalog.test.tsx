import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityCatalog, { COMMUNITY_JSON_URL, SUBMIT_URL, parseItems } from './CommunityCatalog';
import { decodePreset } from './GymBuilder';

const ITEMS = [
  {
    id: 'i1',
    type: 'preset',
    title: 'Словарь недели',
    author: 'masha',
    chapterId: 'foundation/02-it-english',
    data: { engine: 'wordorder', phrase: 'please review my pull request', name: 'Словарь недели' },
    addedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'i2',
    type: 'repo',
    title: 'Мой первый Compose',
    author: 'petya',
    data: 'https://github.com/petya/compose-app',
    addedAt: '2026-09-01T11:00:00.000Z',
  },
  {
    id: 'i3',
    type: 'link',
    title: 'Шпаргалка по git',
    author: 'masha',
    data: 'https://example.com/git-cheatsheet',
    addedAt: '2026-09-01T12:00:00.000Z',
  },
];

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

test('shows loader, then renders cards from fetched community.json', async () => {
  const spy = mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  expect(screen.getByText('Загружаем каталог…')).toBeInTheDocument();

  expect(await screen.findByText('Словарь недели')).toBeInTheDocument();
  expect(spy).toHaveBeenCalledWith(COMMUNITY_JSON_URL);
  expect(screen.getByText('Мой первый Compose')).toBeInTheDocument();
  expect(screen.getByText('Шпаргалка по git')).toBeInTheDocument();
  expect(screen.getByText(/автор: petya/)).toBeInTheDocument();
  expect(screen.getByText(/глава: foundation\/02-it-english/)).toBeInTheDocument();
});

test('preset card links to the /gym constructor with a decodable hash', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  const launch = (await screen.findByText('Запустить')) as HTMLAnchorElement;
  const href = launch.getAttribute('href') ?? '';
  expect(href).toContain('/gym#preset=');
  const preset = decodePreset(href.split('#preset=')[1]);
  expect(preset).toEqual({
    name: 'Словарь недели',
    engine: 'wordorder',
    phrase: 'please review my pull request',
  });
});

test('repo and link cards open externally, submit button leads to the issue form', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  const open = await screen.findAllByText('Открыть');
  expect(open.map((a) => a.getAttribute('href'))).toEqual([
    'https://github.com/petya/compose-app',
    'https://example.com/git-cheatsheet',
  ]);
  open.forEach((a) => expect(a).toHaveAttribute('target', '_blank'));
  expect(screen.getByText('Добавить своё')).toHaveAttribute('href', SUBMIT_URL);
});

test('filters by type and author', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  await screen.findByText('Словарь недели');

  fireEvent.change(screen.getByLabelText(/Тип:/), { target: { value: 'repo' } });
  expect(screen.getByText('Мой первый Compose')).toBeInTheDocument();
  expect(screen.queryByText('Словарь недели')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/Тип:/), { target: { value: 'all' } });
  fireEvent.change(screen.getByLabelText(/Автор:/), { target: { value: 'masha' } });
  expect(screen.getByText('Словарь недели')).toBeInTheDocument();
  expect(screen.queryByText('Мой первый Compose')).not.toBeInTheDocument();
});

test('network error shows a friendly message and keeps the submit button', async () => {
  mockFetch(() => Promise.reject(new Error('offline')));
  render(<CommunityCatalog />);
  expect(await screen.findByText(/Каталог сейчас не открывается/)).toBeInTheDocument();
  expect(screen.getByText('Добавить своё')).toBeInTheDocument();
});

test('empty catalog invites to be the first', async () => {
  mockFetch(() => okResponse([]));
  render(<CommunityCatalog />);
  expect(await screen.findByText(/стань первым/)).toBeInTheDocument();
});

test('parseItems drops malformed entries instead of crashing', () => {
  const items = parseItems([ITEMS[0], null, 42, { id: 'x' }, { ...ITEMS[1], type: 'evil' }]);
  expect(items.map((i) => i.id)).toEqual(['i1']);
  expect(parseItems('not-an-array')).toEqual([]);
});

test('preset with unreadable data gets a note instead of a launch button', async () => {
  mockFetch(() =>
    okResponse([{ ...ITEMS[0], id: 'i9', title: 'Битый', data: { engine: 'wordorder', phrase: 'one' } }]),
  );
  render(<CommunityCatalog />);
  expect(await screen.findByText(/не читаются/)).toBeInTheDocument();
  expect(screen.queryByText('Запустить')).not.toBeInTheDocument();
});

test('глава показана названием и ведёт на саму главу, незнакомый id остаётся как есть', async () => {
  mockFetch(() =>
    okResponse([
      {
        id: 'i4',
        type: 'video',
        title: 'Видео про переменные',
        author: 'kolya',
        chapterId: 'kotlin-vars',
        data: 'https://youtu.be/abc',
        addedAt: '2026-09-02T10:00:00.000Z',
      },
      ITEMS[0],
    ]),
  );
  render(<CommunityCatalog />);

  const link = await screen.findByText('«Переменные и типы»');
  expect(link).toHaveAttribute('href', '/docs/mobile/kotlin-vars');
  // Фильтр «Глава» — тоже названием, а не сырым id.
  expect(screen.getByRole('option', { name: 'Переменные и типы' })).toBeInTheDocument();
  // Незнакомой главы в карте знаний нет — показываем id как есть, без ссылки.
  expect(screen.getByText(/глава: foundation\/02-it-english/)).toBeInTheDocument();
});

test('вступление называет видео и источники — основной контент каталога', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  expect(await screen.findByText(/видео и источники по темам глав/)).toBeInTheDocument();
});
