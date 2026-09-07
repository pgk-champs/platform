import { render, screen } from '@testing-library/react';
import { tsModulesSchemes } from './tsModules';

test('every tsModules scheme renders an accessible svg', () => {
  expect(Object.keys(tsModulesSchemes)).toEqual(['tm-two-systems', 'tm-extension', 'tm-cycle']);
  for (const id of Object.keys(tsModulesSchemes)) {
    const { unmount } = render(<>{tsModulesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tm-two-systems': ['судьбу файла решает не расширение, а поле «тип» в ближайшем описании проекта', 'расширения .mjs и .cjs решают за себя и поле «тип» не спрашивают'],
    'tm-extension': ['выбор зависит от того, как запускают: напрямую — одно расширение, через сборку — другое', 'в собранном файле остаётся именно то, что вы написали: компилятор путь не переписывает'],
    'tm-cycle': ['на константах цикл падает, на функциях — работает: значение берётся в момент вызова, а не загрузки', 'тихая авария опаснее громкой: в первом случае расчёт пойдёт по пустому значению'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsModulesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
