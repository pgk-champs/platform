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

// --- главная знает о студенте (23.09.2026) ---
//
// До этого HomeHero не импортировал store вовсе: витрина не менялась ни на
// йоту для того, кто уже прошёл половину трека. Тесты выше держат «холодный»
// вариант (store пуст в этом файле по умолчанию — конвенция без beforeEach);
// здесь — то, что видит вернувшийся студент.

import { store } from '../lib/store';
import { fillOf } from '../lib/chapterFill';
import { badgeState } from '../lib/gameBadge';
import { levelForXp } from '../lib/levels';

beforeEach(() => {
  store.__resetForTests();
});

test('вернувшийся студент видит «Продолжить главу», а не «Начать маршрут»', () => {
  // Тот же признак, что у достижения «Первая прочитанная глава»: секция
  // прочитана. nextChapter() сам по себе не отличает «никого не было» от
  // «читает первую главу» — оба раза вернёт её же.
  store.setSectionRead('github-start', 'intro');
  render(<HomeHero />);
  expect(screen.getByText('С возвращением')).toBeTruthy();
  const link = screen.getByRole('link', { name: 'Продолжить главу' });
  expect(link.getAttribute('href')).toBe('/docs/foundation/github-start');
  expect(screen.getByText(/GitHub с нуля: регистрация и первые шаги/)).toBeTruthy();
  // «Начать маршрут» пропал целиком — не просто спрятан рядом со своим двойником
  expect(screen.queryByText('Начать маршрут')).toBeNull();
  expect(screen.queryByText('Попробовать сразу')).toBeNull();
});

test('процент в подзаголовке — тот же, что у сосуда Маршрута', () => {
  store.setSectionRead('github-start', 'intro');
  render(<HomeHero />);
  const pct = Math.round(fillOf('github-start') * 100);
  expect(screen.getByText(new RegExp(`пройдено ${pct}%`))).toBeTruthy();
});

test('свежий гость (без чтения) не видит персональных чисел', () => {
  // Мусор в сторе типа prefs.track без единой прочитанной секции не должен
  // включать персонализацию — иначе «started» отвечал бы не на тот вопрос.
  store.prefs.setTrack('блокчейн');
  render(<HomeHero />);
  expect(screen.getByRole('link', { name: 'Начать маршрут' }).getAttribute('href')).toBe('/route');
  expect(screen.queryByText('С возвращением')).toBeNull();
});

test('уровень, достижения и серия в персональных числах — те же, что в шапке', () => {
  store.setSectionRead('github-start', 'intro');
  store.addXp(50, 'test-seed');
  const { container } = render(<HomeHero />);
  const badge = badgeState();
  const level = levelForXp(store.getXp());
  const nums = [...container.querySelectorAll('.hh-num dt b')].map((el) => el.textContent);
  expect(nums).toEqual([String(level.level), `${badge.unlocked}/${badge.total}`, String(badge.streak)]);
});

test('трек, пройденный целиком, ведёт на другой трек и на достижения', () => {
  // Реальный список фундамента у теста нет смысла проходить целиком — берём
  // главы своего трека и наполняем их через store, без обхода мимо DOM.
  type Full = { id: string; audience: string; level: string; totals: { sections: number; quizzes: number; trainers: number } };
  const chapters = (knowledgeMap as Full[]).filter(
    (e) => (e.audience === 'все' || e.audience === 'мобилка') && e.level !== 'углубление',
  );
  expect(chapters.length).toBeGreaterThan(0);
  for (const c of chapters) {
    for (let i = 0; i < c.totals.sections; i += 1) store.setSectionRead(c.id, `s${i}`);
    for (let i = 0; i < c.totals.quizzes; i += 1) store.markQuizDone(c.id, `q${i}`, { correct: 1, total: 1 });
    for (let i = 0; i < c.totals.trainers; i += 1) store.markTrainerDone(c.id, `t${i}`, {});
  }
  render(<HomeHero />);
  expect(screen.getByText(/Трек «Мобилка» пройден целиком/)).toBeTruthy();
  const primary = screen.getByRole('link', { name: 'Открыть другой трек' });
  expect(primary.getAttribute('href')).toBe('/route');
  const secondary = screen.getByRole('link', { name: 'Мои достижения' });
  expect(secondary.getAttribute('href')).toBe('/achievements');
});
