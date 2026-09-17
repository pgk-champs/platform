import { render, screen } from '@testing-library/react';
import HomeHero from './HomeHero';
import knowledgeMap from '../data/knowledge-map.json';
import { ACHIEVEMENTS } from '../lib/achievements';

test('первый экран: надзаголовок, заголовок, подзаголовок и числа', () => {
  render(<HomeHero />);
  expect(screen.getByText(/Учебная платформа ПГК/)).toBeTruthy();
  expect(
    screen.getByRole('heading', { level: 1, name: 'От нуля до чемпиона' }),
  ).toBeTruthy();
  expect(screen.getByText(/симулятор чемпионата/)).toBeTruthy();
  // Числа сверяются с данными, а не с переписанной константой: закреплённые
  // «22 главы» держались на первом экране, пока глав не стало 137.
  const trainers = (knowledgeMap as { totals?: { trainers?: number } }[]).reduce(
    (sum, e) => sum + (e.totals?.trainers ?? 0),
    0,
  );
  for (const n of [knowledgeMap.length, trainers, ACHIEVEMENTS.length])
    expect(screen.getByText(String(n))).toBeTruthy();
  expect(screen.getByText(/с разбором/)).toBeTruthy();
});

test('первый экран: два действия и честная оговорка про регистрацию', () => {
  render(<HomeHero />);
  expect(screen.getByRole('link', { name: 'Начать маршрут' }).getAttribute('href')).toBe('/route');
  expect(screen.getByRole('link', { name: 'Попробовать сразу' }).getAttribute('href')).toBe(
    '/playground',
  );
  expect(screen.getByText(/регистрация не нужна/)).toBeTruthy();
});

test('первый экран: элементы появляются по очереди, каждый со своим номером', () => {
  const { container } = render(<HomeHero />);
  const revealed = [...container.querySelectorAll('.pgk-reveal')];
  expect(revealed.length).toBeGreaterThanOrEqual(5);
  // У каждого свой порядковый номер, иначе всё выедет одновременно.
  expect(revealed.every((el) => (el as HTMLElement).style.getPropertyValue('--i') !== '')).toBe(true);
});

test('hero v2 shows the illustration scene with parallax layers', () => {
  const { container } = render(<HomeHero />);
  const art = container.querySelector('.hh-art svg');
  expect(art).toBeTruthy();
  expect(container.querySelector('.hh-art-l1')).toBeTruthy();
  expect(container.querySelector('.hh-art-l2')).toBeTruthy();
  expect(container.querySelector('.hh-art-l3')).toBeTruthy();
});

test('track cards keep the original three tracks', () => {
  render(<HomeHero />);
  expect(screen.getByText('Выберите свой трек обучения')).toBeTruthy();
  expect(screen.getByRole('link', { name: /Фундамент/ }).getAttribute('href')).toBe('/docs/foundation');
  expect(screen.getByRole('link', { name: /Мобилка/ }).getAttribute('href')).toBe('/docs/mobile');
  expect(screen.getByRole('link', { name: /Блокчейн/ }).getAttribute('href')).toBe('/docs/blockchain');
});

test('показывает настоящие числа платформы', () => {
  // Числа берутся из карты знаний. Если они разойдутся с реальностью —
  // значит кто-то опять вписал их руками, как было с «22 главами».
  render(<HomeHero />);
  expect(screen.getByText('137')).toBeTruthy();
  expect(screen.getByText('228')).toBeTruthy();
});

test('треки идут по объёму, крупные — первыми', () => {
  const { container } = render(<HomeHero />);
  const cards = [...container.querySelectorAll('.hh-track')];
  expect(cards.map((c) => c.querySelector('.hh-track-title')?.textContent)).toEqual([
    'Блокчейн',
    'Мобилка',
    'Фундамент',
    'Отдельные темы',
  ]);
  // Крупные — только те, где глав действительно много.
  expect(cards.filter((c) => c.className.includes('hh-track--big')).length).toBe(2);
  // Цвет трека приходит общим классом, а не своим набором на каждой странице.
  expect(cards[0].className).toContain('trk-blockchain');
});
