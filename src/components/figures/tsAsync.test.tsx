import { render, screen } from '@testing-library/react';
import { tsAsyncSchemes } from './tsAsync';

test('every tsAsync scheme renders an accessible svg', () => {
  expect(Object.keys(tsAsyncSchemes)).toEqual([
    'ts-event-loop',
    'ts-promise-states',
    'ts-await-timeline',
    'ts-combinators',
  ]);
  for (const id of Object.keys(tsAsyncSchemes)) {
    const { unmount } = render(<>{tsAsyncSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ts-event-loop': ['сначала ВСЕ микрозадачи', 'потом ОДНА макрозадача', 'пока стек занят, очереди просто ждут: ни один таймер не сработает вовремя'],
    'ts-promise-states': ['ответа ещё нет', 'есть причина отказа', 'обратной дороги нет: осевший промис навсегда хранит своё значение или ошибку'],
    'ts-await-timeline': ['измерено: 1.003s — второй запрос ждал, пока закончится первый', 'измерено: 501.458ms — оба запроса ушли в сеть сразу'],
    'ts-combinators': ['падает от первой ошибки', 'не падает никогда', 'первый УСПЕШНЫЙ'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsAsyncSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
