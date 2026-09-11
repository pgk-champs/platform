import { render, screen } from '@testing-library/react';
import { webStateSchemes } from './webState';

test('every webState scheme renders an accessible svg', () => {
  expect(Object.keys(webStateSchemes)).toEqual(['ws-stale-value', 'ws-controlled', 'ws-effect-order']);
  for (const id of Object.keys(webStateSchemes)) {
    const { unmount } = render(<>{webStateSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ws-stale-value': ['новое значение зависит от старого — пишут функцию; не зависит — можно значением', 'то же правило спасает в таймерах и обработчиках ответа из сети: там значение устаревает почти всегда'],
    'ws-controlled': ['одно значение — и поле, и состояние кнопки, и подсказка: расходиться им негде', 'два поля, смотрящих в одно состояние, меняются одновременно — это проверено прогоном'],
    'ws-effect-order': ['эффект идёт ПОСЛЕ', 'перед новым запуском —'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webStateSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
