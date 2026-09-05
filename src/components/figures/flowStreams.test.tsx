import { render, screen } from '@testing-library/react';
import { flowStreamsSchemes } from './flowStreams';

test('every flowStreams scheme renders an accessible svg', () => {
  expect(Object.keys(flowStreamsSchemes)).toEqual([
    'fs-one-vs-many',
    'fs-cold-pipeline',
    'fs-state-vs-shared',
  ]);
  for (const id of Object.keys(flowStreamsSchemes)) {
    const { unmount } = render(<>{flowStreamsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'fs-one-vs-many': [
      'баланс спросили один раз — получили число и забыли',
      'цену подписали — она приходит снова и снова, пока подписка жива',
      'и корутина закончилась',
    ],
    'fs-cold-pipeline': [
      'пока collect не вызван — ни одна строка внутри не выполнилась',
      'collect включает конвейер',
      'холодный поток: у каждого collect своя отдельная работа с самого начала',
    ],
    'fs-state-vs-shared': [
      'всегда есть значение прямо сейчас',
      'то же значение подряд не повторится',
      'подписался позже — прошлое не увидишь',
      'спрашивай себя: это «как сейчас выглядит экран» или «что только что случилось»',
    ],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{flowStreamsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
