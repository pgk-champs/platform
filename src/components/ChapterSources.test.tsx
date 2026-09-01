import React from 'react';
import { render, screen } from '@testing-library/react';
import ChapterSources, { pickSources } from './ChapterSources';
import { COMMUNITY_JSON_URL } from './CommunityCatalog';

const ITEMS = [
  {
    id: 's1',
    type: 'video',
    title: 'Kotlin с нуля — курс',
    author: 'pgk-champs',
    chapterId: 'kotlin-vars',
    data: 'https://www.youtube.com/watch?v=abc123',
    addedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 's2',
    type: 'source',
    title: 'Официальная документация Kotlin',
    author: 'masha',
    chapterId: 'kotlin-vars',
    data: 'https://kotlinlang.org/docs/basic-syntax.html',
    addedAt: '2026-09-01T11:00:00.000Z',
  },
  {
    id: 's3',
    type: 'link',
    title: 'Шпаргалка',
    author: 'petya',
    chapterId: 'kotlin-vars',
    data: 'https://example.com/cheatsheet',
    addedAt: '2026-09-01T12:00:00.000Z',
  },
  // не источник: пресет той же главы — в блок не попадает
  {
    id: 's4',
    type: 'preset',
    title: 'Пресет',
    author: 'petya',
    chapterId: 'kotlin-vars',
    data: { engine: 'wordorder', phrase: 'val x = 1' },
    addedAt: '2026-09-01T13:00:00.000Z',
  },
  // чужая глава — в блок не попадает
  {
    id: 's5',
    type: 'video',
    title: 'Git для новичков',
    author: 'pgk-champs',
    chapterId: 'git-first-commit',
    data: 'https://www.youtube.com/watch?v=def456',
    addedAt: '2026-09-01T14:00:00.000Z',
  },
  // битая ссылка (не https) — выпадает
  {
    id: 's6',
    type: 'video',
    title: 'Подозрительное',
    author: 'x',
    chapterId: 'kotlin-vars',
    data: 'http://insecure.example.com',
    addedAt: '2026-09-01T15:00:00.000Z',
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

test('renders only video/source/link cards of its chapter', async () => {
  const spy = mockFetch(() => okResponse(ITEMS));
  render(<ChapterSources chapterId="kotlin-vars" />);

  expect(await screen.findByText('Видео и источники по теме')).toBeInTheDocument();
  expect(spy).toHaveBeenCalledWith(COMMUNITY_JSON_URL);
  expect(screen.getByText('Kotlin с нуля — курс')).toBeInTheDocument();
  expect(screen.getByText('Официальная документация Kotlin')).toBeInTheDocument();
  expect(screen.getByText('Шпаргалка')).toBeInTheDocument();
  // пресет, чужая глава и не-https выпали
  expect(screen.queryByText('Пресет')).not.toBeInTheDocument();
  expect(screen.queryByText('Git для новичков')).not.toBeInTheDocument();
  expect(screen.queryByText('Подозрительное')).not.toBeInTheDocument();
});

test('cards carry type label, author and open the link in a new tab', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<ChapterSources chapterId="kotlin-vars" />);
  const card = (await screen.findByText('Kotlin с нуля — курс')).closest('a');
  expect(card).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abc123');
  expect(card).toHaveAttribute('target', '_blank');
  expect(screen.getByText('Видео')).toBeInTheDocument();
  expect(screen.getByText('Источник')).toBeInTheDocument();
  expect(screen.getByText('добавил: pgk-champs')).toBeInTheDocument();
});

test('renders nothing when the chapter has no sources', async () => {
  mockFetch(() => okResponse(ITEMS));
  const { container } = render(<ChapterSources chapterId="typing" />);
  await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
});

test('renders nothing on network error', async () => {
  mockFetch(() => Promise.reject(new Error('offline')));
  const { container } = render(<ChapterSources chapterId="kotlin-vars" />);
  await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
});

test('pickSources survives malformed payloads', () => {
  expect(pickSources('not-an-array', 'typing')).toEqual([]);
  expect(pickSources([null, 42, { id: 'x' }], 'typing')).toEqual([]);
  expect(pickSources(ITEMS, 'kotlin-vars').map((i) => i.id)).toEqual(['s1', 's2', 's3']);
});
