import { render, screen } from '@testing-library/react';
import { store } from '../lib/store';
import RouteList, { type Entry } from './RouteList';

// RouteList похудел: основной маршрут рисуют сосуды, здесь остались только
// углубления и простые страницы. Пути несут настоящее расширение файла, как их
// пишет scripts/knowledge-map.mjs, — компонент обязан его срезать.

const map: Entry[] = [
  { id: 'grep', title: 'grep', audience: 'все', level: 'углубление', order: 1, path: 'advanced/grep.mdx' },
  { id: 'kit', title: 'UI Kit', audience: 'мобилка', level: 'углубление', order: 2, path: 'mobile/kit.mdx' },
  { id: 'sol', title: 'Solidity', audience: 'блокчейн', level: 'углубление', order: 3, path: 'blockchain/sol.md' },
  { id: 'vars', title: 'Переменные', audience: 'мобилка', level: 'база', order: 4, path: 'mobile/vars.mdx' },
];

const pages: Entry[] = [
  { id: 'dobrota', title: 'Что такое доброта?', audience: 'все', level: 'база', order: 1, path: 'advanced/dobrota.mdx' },
];

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('показываются углубления своего трека и общие, чужие — нет', () => {
  render(<RouteList map={map} track="мобилка" />);
  const items = screen.getAllByRole('listitem').map((li) => li.textContent);
  expect(items.join()).toContain('grep');
  expect(items.join()).toContain('UI Kit');
  expect(items.join()).not.toContain('Solidity');
});

test('главы основного маршрута сюда не попадают — их рисуют сосуды', () => {
  render(<RouteList map={map} track="мобилка" />);
  expect(screen.queryByText('Переменные')).toBeNull();
});

test('ссылка теряет расширение файла', () => {
  render(<RouteList map={map} track="мобилка" />);
  expect(screen.getByText('grep').closest('a')).toHaveAttribute('href', '/docs/advanced/grep');
});

test('страницы идут отдельным блоком и помечены «страница»', () => {
  render(<RouteList map={map} pages={pages} track="мобилка" />);
  expect(screen.getByText('Страницы')).toBeTruthy();
  const li = screen.getByText('Что такое доброта?').closest('li')!;
  expect(li.textContent).toContain('страница');
});

test('нет ни углублений, ни страниц — блок не рисуется вовсе', () => {
  const { container } = render(<RouteList map={[]} pages={[]} track="мобилка" />);
  expect(container.firstChild).toBeNull();
});

test('галочек «пройдено» больше нет', () => {
  render(<RouteList map={map} pages={pages} track="мобилка" />);
  expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
});
