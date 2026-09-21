import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';

// Страница /favorites не была покрыта ничем: тесты избранного жили только у
// Block и Flashcards. Здесь проверяется то, ради чего страница переставала
// быть списком закладок, — что она ХРАНИТ и запускает упражнение.
//
// @theme/Layout vitest не резолвит, поэтому проверяем через те же чистые
// части, что рендерит страница: RunPreset и форму данных избранного.
import { RunPreset } from '../components/GymBuilder';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('набор кладётся в избранное целиком и запускается из данных', () => {
  store.favorites.add({
    id: 'gym:cp-1',
    type: 'preset',
    chapterId: 'gym',
    title: 'Слова к зачёту',
    data: { kind: 'preset', name: 'Слова к зачёту', engine: 'flashcards', cards: [{ term: 'commit', translation: 'коммит' }] },
  });
  const saved = store.favorites.list()[0];
  expect(saved.data).toMatchObject({ kind: 'preset', engine: 'flashcards' });

  const { kind, ...preset } = saved.data as { kind: string; name: string; engine: 'flashcards'; cards: { term: string; translation: string }[] };
  render(<RunPreset preset={preset} />);
  expect(screen.getByText('commit')).toBeInTheDocument();
});

test('снятая звезда не возвращается: остаётся надгробие', () => {
  store.favorites.add({ id: 'typing:home-row', type: 'cheatsheet', chapterId: 'typing', title: 'Домашний ряд' });
  store.favorites.remove('typing:home-row');
  expect(store.favorites.list()).toHaveLength(0);
  expect(store.snapshot().removed.map((r) => r.id)).toContain('typing:home-row');
});

test('добавленное заново стирает своё надгробие', () => {
  store.favorites.add({ id: 'typing:home-row', type: 'cheatsheet', chapterId: 'typing', title: 'Домашний ряд' });
  store.favorites.remove('typing:home-row');
  store.favorites.add({ id: 'typing:home-row', type: 'cheatsheet', chapterId: 'typing', title: 'Домашний ряд' });
  expect(store.snapshot().removed.map((r) => r.id)).not.toContain('typing:home-row');
});

test('слова из избранного — это уже готовый набор карточек', () => {
  // Форма данных у избранного слова и у карточки движка одна и та же, поэтому
  // «собрать тренажёр» — это не конвертация, а прямая передача.
  store.favorites.add({
    id: 'it-english:word:commit',
    type: 'word',
    chapterId: 'it-english',
    title: 'commit',
    data: { kind: 'word', term: 'commit', translation: 'коммит' },
  });
  const cards = store.favorites
    .list({ type: 'word' })
    .map((i) => i.data as { term: string; translation: string });
  render(<RunPreset preset={{ name: 'Мои слова', engine: 'flashcards', cards }} />);
  expect(screen.getByText('commit')).toBeInTheDocument();
});

test('звезда на наборе пишет упражнение, а не ссылку на него', async () => {
  const PresetStar = (await import('../components/PresetStar')).default;
  render(<PresetStar id="gym:cp-9" preset={{ name: 'Набор', engine: 'wordorder', phrase: 'раз два три' }} />);
  fireEvent.click(screen.getByRole('button'));
  const saved = store.favorites.list()[0];
  expect(saved.data).toMatchObject({ kind: 'preset', engine: 'wordorder', phrase: 'раз два три' });
  expect(saved.url).toBeUndefined();
});
