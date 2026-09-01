import { render, screen } from '@testing-library/react';
import HomeHero from './HomeHero';

test('hero renders title, one-line subtitle and stats', () => {
  render(<HomeHero />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'От нуля до чемпиона' }),
  ).toBeTruthy();
  expect(screen.getByText(/симулятор чемпионата/)).toBeTruthy();
  expect(
    screen.getByText('17 глав · 40+ тренажёров · 40 достижений'),
  ).toBeTruthy();
});

test('hero has three action buttons with correct links', () => {
  render(<HomeHero />);
  expect(screen.getByRole('link', { name: 'Маршрут' }).getAttribute('href')).toBe('/route');
  expect(screen.getByRole('link', { name: 'Песочница' }).getAttribute('href')).toBe('/playground');
  expect(screen.getByRole('link', { name: 'Симулятор' }).getAttribute('href')).toBe('/simulator');
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
