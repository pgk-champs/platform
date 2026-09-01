import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ModuleGraph, { cycleEdges } from './ModuleGraph';

beforeEach(() => {
  store.__resetForTests();
});

const node = (label: string) => screen.getByText(label);

test('renders three module nodes and a hint', () => {
  render(<ModuleGraph />);
  expect(node(':app')).toBeTruthy();
  expect(node(':ui-kit')).toBeTruthy();
  expect(node(':net')).toBeTruthy();
  expect(screen.getByText(/Клик по модулю выбирает его/)).toBeTruthy();
});

test('clicking a pair of nodes draws a dependency edge, same pair removes it', () => {
  const { container } = render(<ModuleGraph />);
  fireEvent.click(node(':app'));
  fireEvent.click(node(':ui-kit'));
  expect(container.querySelectorAll('line.mg-edge').length).toBe(1);
  fireEvent.click(node(':app'));
  fireEvent.click(node(':ui-kit'));
  expect(container.querySelectorAll('line.mg-edge').length).toBe(0);
});

test('cycle is highlighted red with an explanation', () => {
  const { container } = render(<ModuleGraph />);
  fireEvent.click(node(':app'));
  fireEvent.click(node(':ui-kit'));
  fireEvent.click(node(':ui-kit'));
  fireEvent.click(node(':app'));
  expect(screen.getByText(/Циклическая зависимость/)).toBeTruthy();
  expect(container.querySelectorAll('line.mg-edge-bad').length).toBe(2);
});

test('correct acyclic graph finishes, marks trainer done and awards xp once', () => {
  render(<ModuleGraph chapterId="ui-kit" trainerId="module-graph" />);
  fireEvent.click(node(':app'));
  fireEvent.click(node(':ui-kit'));
  fireEvent.click(node(':app'));
  fireEvent.click(node(':net'));
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers['ui-kit']?.['module-graph']).toBeTruthy();
  expect(store.getXp()).toBe(10);
});

test('reset clears all edges', () => {
  const { container } = render(<ModuleGraph />);
  fireEvent.click(node(':app'));
  fireEvent.click(node(':ui-kit'));
  fireEvent.click(screen.getByText('Сбросить'));
  expect(container.querySelectorAll('line.mg-edge').length).toBe(0);
});

test('cycleEdges finds a 3-node cycle and ignores acyclic edges', () => {
  const cyclic = [
    { from: 'app', to: 'ui-kit' },
    { from: 'ui-kit', to: 'net' },
    { from: 'net', to: 'app' },
  ];
  expect(cycleEdges(cyclic).length).toBe(3);
  expect(
    cycleEdges([
      { from: 'app', to: 'ui-kit' },
      { from: 'ui-kit', to: 'net' },
    ]).length,
  ).toBe(0);
});
