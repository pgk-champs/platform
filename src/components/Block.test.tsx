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
  expect(screen.queryByRole('button', { name: /избранное/i })).toBeNull();
});

test('container carries id={blockId} for anchor links', () => {
  const { container } = render(
    <Block kind="fact" title="Факт" chapterId="typing" blockId="fact-1">
      <p>Тело</p>
    </Block>,
  );
  expect(container.querySelector('#fact-1')).toBeTruthy();
});

test('is expanded by default and the header toggle collapses/expands the body for every kind', () => {
  const kinds: Array<'trainer' | 'quiz' | 'breakdown' | 'vocab' | 'cheatsheet' | 'fact'> = [
    'trainer',
    'quiz',
    'breakdown',
    'vocab',
    'cheatsheet',
    'fact',
  ];
  for (const kind of kinds) {
    const { unmount } = render(
      <Block kind={kind} title="Заголовок">
        <p>Тело блока</p>
      </Block>,
    );
    const body = screen.getByText('Тело блока');
    expect(collapsedState(body)).toBe(false);
    const toggle = screen.getByRole('button', { name: 'Свернуть блок' });
    fireEvent.click(toggle);
    expect(collapsedState(body)).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Развернуть блок' }));
    expect(collapsedState(body)).toBe(false);
    unmount();
  }
});

/** Свёрнутость: тело схлопывается треком грида (0fr) и глушится через inert,
 *  поэтому проверяем состояние обёртки, а не CSS-видимость узла с текстом. */
function collapsedState(node: HTMLElement): boolean {
  const wrap = node.closest('.block-body');
  const inner = node.closest('.block-body-inner');
  return !!wrap?.classList.contains('block-body--collapsed') && inner?.hasAttribute('inert') === true;
}

test('collapsed state persists per blockId in the store across remounts', () => {
  const { unmount } = render(
    <Block kind="trainer" title="Т" chapterId="typing" blockId="collapse-1">
      <p>Тело</p>
    </Block>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Свернуть блок' }));
  unmount();

  render(
    <Block kind="trainer" title="Т" chapterId="typing" blockId="collapse-1">
      <p>Тело</p>
    </Block>,
  );
  expect(collapsedState(screen.getByText('Тело'))).toBe(true);
  expect(store.block.isCollapsed('typing:collapse-1')).toBe(true);
});

test('favPayload is stored with the favorite and the url anchors to the blockId', () => {
  render(
    <Block
      kind="cheatsheet"
      title="Шпаргалка"
      chapterId="typing"
      blockId="sheet-1"
      favPayload={{ kind: 'table', head: ['A', 'B'], rows: [['1', '2']] }}
    >
      <p>Тело</p>
    </Block>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'В избранное' }));
  const saved = store.favorites.list()[0];
  expect(saved.data).toEqual({ kind: 'table', head: ['A', 'B'], rows: [['1', '2']] });
  expect(saved.url).toBe('/#sheet-1');
});
