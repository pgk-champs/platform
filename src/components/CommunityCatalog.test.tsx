import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityCatalog, { COMMUNITY_JSON_URL, parseItems } from './CommunityCatalog';
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
  // автор теперь отдельной подписью, глава — тегом рядом с названием
  expect(screen.getAllByText('petya').length).toBeGreaterThan(0);
  expect(screen.getByText('foundation/02-it-english', { selector: '.cc-tag' })).toBeInTheDocument();
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

test('репозитории и инструменты — строки-ссылки, открываются наружу', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  // Сама строка и есть ссылка: отдельной кнопки «Открыть» больше нет.
  const repo = (await screen.findByText('Мой первый Compose')).closest('a')!;
  const tool = screen.getByText('Шпаргалка по git').closest('a')!;
  expect(repo).toHaveAttribute('href', 'https://github.com/petya/compose-app');
  expect(tool).toHaveAttribute('href', 'https://example.com/git-cheatsheet');
  expect(repo).toHaveAttribute('target', '_blank');
});

test('filters by type and author', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  await screen.findByText('Словарь недели');

  // Тип выбирается чипом, а не выпадающим списком: видно варианты и количества.
  fireEvent.click(screen.getByRole('button', { name: /Репозитории/ }));
  expect(screen.getByText('Мой первый Compose')).toBeInTheDocument();
  expect(screen.queryByText('Словарь недели')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Всё/ }));
  fireEvent.change(screen.getByLabelText(/Автор:/), { target: { value: 'masha' } });
  expect(screen.getByText('Словарь недели')).toBeInTheDocument();
  expect(screen.queryByText('Мой первый Compose')).not.toBeInTheDocument();
});

test('сеть упала — честная строка вместо пустоты', async () => {
  mockFetch(() => Promise.reject(new Error('offline')));
  render(<CommunityCatalog />);
  expect(await screen.findByText(/Каталог сейчас не открывается/)).toBeInTheDocument();
});

test('пустой каталог зовёт принести первый материал', async () => {
  mockFetch(() => okResponse([]));
  render(<CommunityCatalog />);
  expect(await screen.findByText(/Принеси первый материал/)).toBeInTheDocument();
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

  // Глава подписана названием — тегом у карточки видео, а не ссылкой в строке
  // «автор: … · глава: …», которой больше нет.
  expect(await screen.findByText('Переменные и типы', { selector: '.cc-tag' })).toBeInTheDocument();
  // Фильтр «Глава» — тоже названием, а не сырым id.
  expect(screen.getByRole('option', { name: 'Переменные и типы' })).toBeInTheDocument();
  // Незнакомой главы в карте знаний нет — показываем id как есть.
  expect(screen.getByText('foundation/02-it-english', { selector: '.cc-tag' })).toBeInTheDocument();
});

test('вступление говорит, чьи это материалы', async () => {
  mockFetch(() => okResponse(ITEMS));
  render(<CommunityCatalog />);
  expect(await screen.findByText(/собрали кураторы и принесли студенты/)).toBeInTheDocument();
});

import { groupItems, thumbUrl, EMPTY_HINT } from './CommunityCatalog';

const mk = (type: string, i: number, data = 'https://example.com/' + i) =>
  ({ id: 'x' + i, type, title: 'Материал ' + i, author: 'kto', data, addedAt: '2026-09-16' }) as never;

test('группы идут в постоянном порядке и несут свои записи', () => {
  const groups = groupItems([mk('source', 1), mk('video', 2), mk('repo', 3)]);
  expect(groups.map((g) => g.key)).toEqual(['video', 'read', 'repo', 'preset']);
  expect(groups[0].items).toHaveLength(1);
  expect(groups[1].items).toHaveLength(1);
  expect(groups[2].items).toHaveLength(1);
});

test('статьи и инструменты попадают в одну группу', () => {
  const read = groupItems([mk('source', 1), mk('link', 2)]).find((g) => g.key === 'read')!;
  expect(read.items).toHaveLength(2);
});

test('пустая группа остаётся в списке — ей есть что сказать', () => {
  const groups = groupItems([mk('video', 1)]);
  expect(groups.find((g) => g.key === 'repo')!.items).toEqual([]);
  expect(EMPTY_HINT.repo).toMatch(/проект/i);
});

test('обложка строится только для ссылок YouTube', () => {
  expect(thumbUrl(mk('video', 1, 'https://youtu.be/TGVoOBmvTJs'))).toBe(
    'https://i.ytimg.com/vi/TGVoOBmvTJs/mqdefault.jpg',
  );
  expect(thumbUrl(mk('video', 2, 'https://example.com/video'))).toBeNull();
  expect(thumbUrl(mk('preset', 3, ''))).toBeNull();
});
