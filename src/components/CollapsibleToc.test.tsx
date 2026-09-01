import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import CollapsibleToc from './CollapsibleToc';

beforeEach(() => {
  store.__resetForTests();
});

const toc = [
  { value: 'Введение', id: 'intro', level: 2 },
  { value: 'Практика', id: 'practice', level: 2 },
];

test('renders the heading and toc items expanded by default', () => {
  render(<CollapsibleToc toc={toc} chapterId="typing" />);
  expect(screen.getByText('Содержание главы')).toBeTruthy();
  expect(screen.getByText('Введение')).toBeTruthy();
  expect(screen.getByText('Практика')).toBeTruthy();
});

test('clicking the header collapses the toc and persists per chapterId', () => {
  render(<CollapsibleToc toc={toc} chapterId="typing" />);
  fireEvent.click(screen.getByText('Содержание главы'));
  expect(screen.queryByText('Введение')).toBeNull();
  expect(store.toc.isCollapsed('typing')).toBe(true);
});

test('a chapter previously collapsed in store renders collapsed on mount', () => {
  store.toc.setCollapsed('typing', true);
  render(<CollapsibleToc toc={toc} chapterId="typing" />);
  expect(screen.queryByText('Введение')).toBeNull();
});

test('collapsed state is scoped per chapterId', () => {
  store.toc.setCollapsed('typing', true);
  render(<CollapsibleToc toc={toc} chapterId="git-first-commit" />);
  expect(screen.getByText('Введение')).toBeTruthy();
});
