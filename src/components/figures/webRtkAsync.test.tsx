import { render, screen } from '@testing-library/react';
import { webRtkAsyncSchemes } from './webRtkAsync';

test('every webRtkAsync scheme renders an accessible svg', () => {
  expect(Object.keys(webRtkAsyncSchemes)).toEqual(['wra-thunk-flow', 'wra-reject', 'wra-status']);
  for (const id of Object.keys(webRtkAsyncSchemes)) {
    const { unmount } = render(<>{webRtkAsyncSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wra-thunk-flow': ['имена складываются из имени среза, имени запроса и исхода — их видно в списке действий при отладке'],
    'wra-reject': ['в обоих случаях отправка не бросает наружу: она возвращает значение, а не падает', 'поэтому обработчик отказа читает сначала свою нагрузку, а потом уже текст исключения'],
    'wra-status': ['обратите внимание: после отказа старое значение осталось лежать в состоянии', 'это решение, а не случайность: показывать прежний баланс с пометкой «устарел» или очищать — выбираете вы'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webRtkAsyncSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
