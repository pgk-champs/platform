import { render, screen } from '@testing-library/react';
import { store } from '../lib/store';
import ContinueCard from './ContinueCard';
import knowledgeMap from '../data/knowledge-map.json';

type Totals = { sections: number; quizzes: number; trainers: number };
const totalsOf = (id: string) =>
  (knowledgeMap as { id: string; totals: Totals }[]).find((e) => e.id === id)!.totals;

const ch = { id: 'typing', title: 'Печать и клавиатура', path: 'foundation/typing.mdx' };

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('показывает главу, её процент и ссылку без расширения', () => {
  const t = totalsOf('typing');
  for (let i = 0; i < t.sections; i += 1) store.setSectionRead('typing', 's' + i);
  render(<ContinueCard chapter={ch} />);

  // Знаменатель — секции + проверки + тренажёры (с 17.09.2026).
  const pct = Math.round((t.sections / (t.sections + t.quizzes + t.trainers)) * 100);
  expect(screen.getByText('Печать и клавиатура')).toBeTruthy();
  expect(screen.getByText(pct + '%')).toBeTruthy();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/docs/foundation/typing');
});

test('нетронутая глава — ноль процентов, а не пустое место', () => {
  render(<ContinueCard chapter={ch} />);
  expect(screen.getByText('0%')).toBeTruthy();
});

test('трек пройден — вместо главы так и написано, без ссылки', () => {
  render(<ContinueCard chapter={null} />);
  expect(screen.getByText('Трек пройден')).toBeTruthy();
  expect(screen.queryByRole('link')).toBeNull();
});
