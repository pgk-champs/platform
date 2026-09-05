import { render, screen } from '@testing-library/react';
import { scaffoldBarsSchemes } from './scaffoldBars';

test('every scaffoldBars scheme renders an accessible svg', () => {
  expect(Object.keys(scaffoldBarsSchemes)).toEqual([
    'sb-slots',
    'sb-inner-padding',
    'sb-tab-state',
  ]);
  for (const id of Object.keys(scaffoldBarsSchemes)) {
    const { unmount } = render(<>{scaffoldBarsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sb-slots': ['содержимое экрана', 'получает innerPadding', 'снекбар показывается поверх и тоже знает про эти границы'],
    'sb-inner-padding': ['первый элемент — под ней', 'список начинается под шапкой', 'Scaffold сообщает высоту панелей, но применить её обязан ты сам'],
    'sb-tab-state': ['живёт выше панели: во ViewModel, а для перезапуска — в хранилище', 'панель ничего не помнит сама: она показывает то, что ей передали, и сообщает о нажатии'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{scaffoldBarsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
