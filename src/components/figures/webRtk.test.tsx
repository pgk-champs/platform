import { render, screen } from '@testing-library/react';
import { webRtkSchemes } from './webRtk';

test('every webRtk scheme renders an accessible svg', () => {
  expect(Object.keys(webRtkSchemes)).toEqual(['wrt-slice', 'wrt-selectors', 'wrt-memo']);
  for (const id of Object.keys(webRtkSchemes)) {
    const { unmount } = render(<>{webRtkSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wrt-slice': ['имена действий складываются из названия среза и названия обработчика — придумывать их не надо', 'раньше всё это писали руками в трёх файлах; отсюда репутация подхода как многословного'],
    'wrt-selectors': ['выбирать надо самое узкое: компонент пересчитывается тогда, когда выбранное значение стало другим'],
    'wrt-memo': ['сравнение идёт по ссылке: новый массив с тем же содержимым — это другое значение', 'то же правило, что делало «изменение на месте» невидимым: библиотека сравнивает ссылки, а не поля'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webRtkSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
