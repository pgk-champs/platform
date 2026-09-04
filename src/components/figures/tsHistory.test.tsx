import { render, screen } from '@testing-library/react';
import { tsHistorySchemes } from './tsHistory';

test('every tsHistory scheme renders an accessible svg', () => {
  expect(Object.keys(tsHistorySchemes)).toEqual([
    'th-timeline',
    'th-es-versions',
    'th-runtimes',
    'th-ts-pipeline',
  ]);
  for (const id of Object.keys(tsHistorySchemes)) {
    const { unmount } = render(<>{tsHistorySchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'th-timeline': ['язык за 10 дней', 'ES6 — перелом', 'стандарт не менялся почти десять лет'],
    'th-es-versions': ['спор убил версию', 'граница «старого» и «нового» кода', 'сплошной var'],
    'th-runtimes': ['права на файлы', 'сам язык: синтаксис, типы, классы'],
    'th-ts-pipeline': ['проверил и стёр', 'типов больше нет', 'сюда типы уже не доходят'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsHistorySchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
