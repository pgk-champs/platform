import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import RouteList, { type Entry } from './RouteList';

// Paths carry their real file extension, as produced by scripts/knowledge-map.mjs
// (e.g. "foundation/terminal.md", "mobile/kotlin-vars.mdx") — RouteList must
// strip it when building the link.
const map: Entry[] = [
  { id: 'terminal', title: 'Терминал', audience: 'все', level: 'база', order: 1, path: 'foundation/terminal.md' },
  { id: 'kotlin-vars', title: 'Переменные', audience: 'мобилка', level: 'база', order: 1, path: 'mobile/kotlin-vars.mdx' },
  { id: 'sol', title: 'Solidity', audience: 'блокчейн', level: 'база', order: 1, path: 'blockchain/sol.md' },
];

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('mobile route = foundation + mobile only, in order', () => {
  render(<RouteList map={map} track="мобилка" />);
  const items = screen.getAllByRole('listitem').map((li) => li.textContent);
  expect(items[0]).toContain('Терминал');
  expect(items[1]).toContain('Переменные');
  expect(items.join()).not.toContain('Solidity');
});

test('chapter link href strips the .md/.mdx extension', () => {
  render(<RouteList map={map} track="мобилка" />);
  const links = screen.getAllByRole('link');
  expect(links[0]).toHaveAttribute('href', '/docs/foundation/terminal');
});

test('progress checkbox persists', () => {
  render(<RouteList map={map} track="мобилка" />);
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  expect(JSON.parse(localStorage.getItem('pgk-progress')!)['terminal']).toBe(true);
});

test('empty map shows placeholder', () => {
  render(<RouteList map={[]} track="мобилка" />);
  expect(screen.getByText('Глав пока нет')).toBeTruthy();
});

test('a fresh chapter with no store activity and no checkbox is "не начата"', () => {
  render(<RouteList map={map} track="мобилка" />);
  const items = screen.getAllByRole('listitem');
  expect(items[1].textContent).toContain('не начата');
});

test('any trace in the store (a read section) marks a chapter "читается"', () => {
  store.setSectionRead('kotlin-vars', 'intro');
  render(<RouteList map={map} track="мобилка" />);
  const items = screen.getAllByRole('listitem');
  expect(items[1].textContent).toContain('читается');
});

test('checkbox checked + every recorded quiz perfect marks a chapter "пройдена"', () => {
  store.markQuizDone('terminal', 'q1', { correct: 3, total: 3 });
  render(<RouteList map={map} track="мобилка" />);
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  const items = screen.getAllByRole('listitem');
  expect(items[0].textContent).toContain('пройдена');
});

test('checkbox checked but an imperfect quiz keeps the chapter at "читается"', () => {
  store.markQuizDone('terminal', 'q1', { correct: 2, total: 3 });
  render(<RouteList map={map} track="мобилка" />);
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  const items = screen.getAllByRole('listitem');
  expect(items[0].textContent).toContain('читается');
  expect(items[0].textContent).not.toContain('пройдена');
});

test('chapters after the first not-passed one carry a "дальше" lock', () => {
  render(<RouteList map={map} track="мобилка" />);
  const items = screen.getAllByRole('listitem');
  // "Терминал" (index 0) is the first not-passed chapter — the current one, not locked.
  expect(items[0].textContent).not.toContain('дальше');
  // "Переменные" (index 1) comes after it — locked.
  expect(items[1].textContent).toContain('дальше');
});

test('a fully passed chapter list has no locks at all', () => {
  store.markQuizDone('terminal', 'q1', { correct: 1, total: 1 });
  store.markQuizDone('kotlin-vars', 'q1', { correct: 1, total: 1 });
  render(<RouteList map={map} track="мобилка" />);
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  fireEvent.click(screen.getAllByRole('checkbox')[1]);
  const items = screen.getAllByRole('listitem');
  expect(items.join()).not.toContain('дальше');
});

test('clicking a locked link asks for confirmation naming the gating chapter; declining blocks navigation', () => {
  render(<RouteList map={map} track="мобилка" />);
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
  const lockedLink = screen.getAllByRole('link')[1]; // "Переменные", locked

  const notCanceled = fireEvent.click(lockedLink);

  expect(confirmSpy).toHaveBeenCalledWith('Эта глава идёт после „Терминал“. Перейти всё равно?');
  expect(notCanceled).toBe(false); // preventDefault() was called — navigation blocked
  confirmSpy.mockRestore();
});

test('accepting the confirm lets navigation proceed', () => {
  render(<RouteList map={map} track="мобилка" />);
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  const lockedLink = screen.getAllByRole('link')[1];

  const notCanceled = fireEvent.click(lockedLink);

  expect(notCanceled).toBe(true);
  confirmSpy.mockRestore();
});

test('an unlocked (current) chapter link never prompts for confirmation', () => {
  render(<RouteList map={map} track="мобилка" />);
  const confirmSpy = vi.spyOn(window, 'confirm');
  fireEvent.click(screen.getAllByRole('link')[0]); // "Терминал", current, not locked
  expect(confirmSpy).not.toHaveBeenCalled();
  confirmSpy.mockRestore();
});
