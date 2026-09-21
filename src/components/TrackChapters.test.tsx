import { render } from '@testing-library/react';
import { store } from '../lib/store';
import knowledgeMap from '../data/knowledge-map.json';
import TrackChapters from './TrackChapters';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

const count = (track: string) =>
  (knowledgeMap as { track: string }[]).filter((c) => c.track === track).length;

test('показывает все главы трека, а не выборку', () => {
  // До витрины на /docs/mobile было ноль карточек на 46 глав: попасть в них
  // можно было только через сайдбар.
  const { container } = render(<TrackChapters track="mobile" />);
  expect(container.querySelectorAll('.tch-card')).toHaveLength(count('mobile'));
  expect(count('mobile')).toBeGreaterThan(40);
});

test('главы разложены по ярусам и не задваиваются', () => {
  const { container } = render(<TrackChapters track="blockchain" />);
  const groups = container.querySelectorAll('.tch-group');
  expect(groups.length).toBeGreaterThan(1);
  const inGroups = [...groups].reduce((s, g) => s + g.querySelectorAll('.tch-card').length, 0);
  expect(inGroups).toBe(count('blockchain'));
});

test('карточка говорит, что внутри главы — вместо описания, которого нет', () => {
  // description есть у 10 глав из 140, поэтому вместо него показываем состав.
  const { container } = render(<TrackChapters track="foundation" />);
  const parts = container.querySelector('.tch-parts')?.textContent ?? '';
  expect(parts).toMatch(/секц/);
  expect(parts).toMatch(/провер|тренаж/);
});

test('полоса прогресса появляется только у начатых глав', () => {
  const { container: before } = render(<TrackChapters track="foundation" />);
  expect(before.querySelectorAll('.tch-bar')).toHaveLength(0);

  store.setSectionRead('typing', 'intro');
  const { container: after } = render(<TrackChapters track="foundation" />);
  expect(after.querySelectorAll('.tch-bar').length).toBeGreaterThan(0);
});

test('ссылка ведёт на главу без расширения', () => {
  const { container } = render(<TrackChapters track="mobile" />);
  const href = container.querySelector('.tch-card')?.getAttribute('href') ?? '';
  expect(href).toMatch(/^\/docs\/mobile\//);
  expect(href).not.toMatch(/\.mdx?$/);
});
