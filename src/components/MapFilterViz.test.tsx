import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import MapFilterViz from './MapFilterViz';

beforeEach(() => {
  store.__resetForTests();
});

const step = () => fireEvent.click(screen.getByText('Шаг →'));

test('renders first scenario: chain, source items, both operations, empty stages', () => {
  render(<MapFilterViz />);
  expect(screen.getByText('team.filter { it.score >= 80 }.map { it.name }')).toBeTruthy();
  expect(screen.getByText('Алиса · 82')).toBeTruthy();
  expect(screen.getByText('Соня · 77')).toBeTruthy();
  expect(screen.getByText('filter { it.score >= 80 }')).toBeTruthy();
  expect(screen.getByText('map { it.name }')).toBeTruthy();
  expect(screen.getAllByText('пока пусто')).toHaveLength(2);
  expect(screen.getByText('Шаг 0 из 5')).toBeTruthy();
});

test('step moves an element through the operation with highlight and caption', () => {
  render(<MapFilterViz />);
  step();
  // элемент появился в промежуточном списке — теперь их два: в team и после filter
  const chips = screen.getAllByText('Алиса · 82');
  expect(chips).toHaveLength(2);
  expect(chips[1].className).toContain('mfv-chip-active');
  expect(screen.getByText(/«Алиса · 82» прошёл условие/)).toBeTruthy();
});

test('filter drops an element: caption explains, source chip crossed out', () => {
  render(<MapFilterViz />);
  step();
  step();
  step(); // Соня · 77 — score < 80
  expect(screen.getByText(/«Соня · 77» не прошёл условие — отброшен/)).toBeTruthy();
  const sonya = screen.getAllByText('Соня · 77');
  expect(sonya).toHaveLength(1); // в промежуточный список не попала
  expect(sonya[0].className).toContain('mfv-chip-dropped');
});

test('map stage shows transformation and fills the result list', () => {
  render(<MapFilterViz />);
  for (let i = 0; i < 4; i += 1) step(); // 3 filter + 1 map
  expect(screen.getByText(/«Алиса · 82» → «Алиса»/)).toBeTruthy();
  expect(screen.getByText('Алиса')).toBeTruthy();
});

test('finishing one scenario shows final println, no xp yet, reset works', () => {
  render(<MapFilterViz chapterId="classes-collections" trainerId="mfv" />);
  for (let i = 0; i < 5; i += 1) step();
  expect(screen.getByText('println(qualified) → [Алиса, Богдан]')).toBeTruthy();
  expect(store.getXp()).toBe(0);
  fireEvent.click(screen.getByText('Сначала'));
  expect(screen.getByText('Шаг 0 из 5')).toBeTruthy();
});

test('finishing both scenarios marks trainer done, awards xp and shows the plaque', () => {
  render(<MapFilterViz chapterId="classes-collections" trainerId="mfv" />);
  for (let i = 0; i < 5; i += 1) step();
  fireEvent.click(screen.getByText('map → filter: удвоение очков'));
  expect(screen.getByText('scores.map { it * 2 }.filter { it > 160 }')).toBeTruthy();
  for (let i = 0; i < 6; i += 1) step(); // 3 map + 3 filter
  expect(screen.getByText(/Выполнено! Оба сценария пройдены/)).toBeTruthy();
  expect(store.getProgress().trainers['classes-collections']?.mfv).toMatchObject({
    result: { scenarios: 2 },
  });
  expect(store.getXp()).toBe(25);
});
