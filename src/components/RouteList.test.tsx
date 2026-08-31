import { render, screen, fireEvent } from '@testing-library/react';
import RouteList, { type Entry } from './RouteList';

const map: Entry[] = [
  { id: 'terminal', title: 'Терминал', audience: 'все', level: 'база', order: 1, path: 'foundation/terminal' },
  { id: 'kotlin-vars', title: 'Переменные', audience: 'мобилка', level: 'база', order: 1, path: 'mobile/kotlin-vars' },
  { id: 'sol', title: 'Solidity', audience: 'блокчейн', level: 'база', order: 1, path: 'blockchain/sol' },
];

beforeEach(() => {
  localStorage.clear();
});

test('mobile route = foundation + mobile only, in order', () => {
  render(<RouteList map={map} track="мобилка" />);
  const items = screen.getAllByRole('listitem').map((li) => li.textContent);
  expect(items[0]).toContain('Терминал');
  expect(items[1]).toContain('Переменные');
  expect(items.join()).not.toContain('Solidity');
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
