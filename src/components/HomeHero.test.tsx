import { render, screen } from '@testing-library/react';
import HomeHero from './HomeHero';

test('первый экран: надзаголовок, заголовок, подзаголовок и числа', () => {
  render(<HomeHero />);
  expect(screen.getByText(/Учебная платформа ПГК/)).toBeTruthy();
  expect(
    screen.getByRole('heading', { level: 1, name: 'От нуля до чемпиона' }),
  ).toBeTruthy();
  expect(screen.getByText(/симулятор чемпионата/)).toBeTruthy();
  for (const [num, label] of [
    ['22', 'главы с разбором'],
    ['40+', 'тренажёра'],
    ['43', 'достижения'],
  ]) {
    expect(screen.getByText(num)).toBeTruthy();
    expect(screen.getByText(label)).toBeTruthy();
  }
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
