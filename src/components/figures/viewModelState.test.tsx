import { render, screen } from '@testing-library/react';
import { viewModelStateSchemes } from './viewModelState';

test('every viewModelState scheme renders an accessible svg', () => {
  expect(Object.keys(viewModelStateSchemes)).toEqual([
    'vm-survives',
    'vm-uistate',
    'vm-udf',
  ]);
  for (const id of Object.keys(viewModelStateSchemes)) {
    const { unmount } = render(<>{viewModelStateSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'vm-survives': ['ViewModel умирает не при повороте, а когда экран закрыт по-настоящему', 'перезапуск приложения она тоже не переживает — это уже задача хранилища'],
    'vm-uistate': ['спиннер и ошибка одновременно', 'третьего не дано — невозможных сочетаний нет', 'экран рисуется одним when по состоянию, а не пятью вложенными if'],
    'vm-udf': ['состояние вниз', 'события вверх', 'данные текут в одну сторону, поэтому всегда понятно, кто изменил состояние'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{viewModelStateSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
