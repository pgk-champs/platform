import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import Block from './Block';

beforeEach(() => {
  store.__resetForTests();
});

test('renders russian badge, title and children for each kind', () => {
  const labels: Record<string, string> = {
    trainer: 'Тренажёр',
    quiz: 'Квиз',
    breakdown: 'Разбор по составу',
    vocab: 'Словарь',
    cheatsheet: 'Шпаргалка',
    fact: 'Интересный факт',
  };
  for (const [kind, label] of Object.entries(labels)) {
    const { unmount } = render(
      <Block kind={kind as never} title="Заголовок блока" chapterId="typing" blockId={kind}>
        <p>Содержимое</p>
      </Block>,
    );
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText('Заголовок блока')).toBeTruthy();
    expect(screen.getByText('Содержимое')).toBeTruthy();
    unmount();
  }
});

test('star toggles favorite state in store', () => {
  render(
    <Block kind="trainer" title="Тренажёр набора" chapterId="typing" blockId="t1">
      <p>Тело</p>
    </Block>,
  );
  expect(store.favorites.isFavorite('typing:t1')).toBe(false);
  const star = screen.getByRole('button', { name: 'В избранное' });
  fireEvent.click(star);
  expect(store.favorites.isFavorite('typing:t1')).toBe(true);
  expect(store.favorites.list()[0]).toMatchObject({ id: 'typing:t1', type: 'trainer', chapterId: 'typing' });

  fireEvent.click(screen.getByRole('button', { name: 'Убрать из избранного' }));
  expect(store.favorites.isFavorite('typing:t1')).toBe(false);
});

test('without chapterId/blockId no favorite star is rendered', () => {
  render(
    <Block kind="fact" title="Факт">
      <p>Тело</p>
    </Block>,
  );
  expect(screen.queryByRole('button')).toBeNull();
});
