import { render, screen } from '@testing-library/react';
import { webFetchSchemes } from './webFetch';

test('every webFetch scheme renders an accessible svg', () => {
  expect(Object.keys(webFetchSchemes)).toEqual(['wf-three-states', 'wf-ok-trap', 'wf-race']);
  for (const id of Object.keys(webFetchSchemes)) {
    const { unmount } = render(<>{webFetchSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wf-three-states': ['интерфейс, у которого есть только «данные», при отказе показывает пустоту и молчит', 'поэтому состояние хранят одним объектом: тогда «загружаем и одновременно ошибка» невозможно'],
    'wf-ok-trap': ['запрос считается успешным, если ответ вообще пришёл: каким он был — отдельный вопрос', 'правило одно: после каждого запроса проверяют признак успеха, и только потом разбирают'],
    'wf-race': ['ответы приходят не в том порядке, в каком спрашивали: это не редкость, а обычное дело', 'с флагом отмены в уборке эффекта четвёртая строка остаётся «500.0 ETH — адрес B»'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webFetchSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
