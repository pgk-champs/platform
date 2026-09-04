import { render, screen } from '@testing-library/react';
import { tsCollectionsSchemes } from './tsCollections';

test('every tsCollections scheme renders an accessible svg', () => {
  expect(Object.keys(tsCollectionsSchemes)).toEqual([
    'tcl-array-index',
    'tcl-reference-vs-copy',
    'tcl-shallow-deep',
    'tcl-object-shape',
  ]);
  for (const id of Object.keys(tsCollectionsSchemes)) {
    const { unmount } = render(<>{tsCollectionsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tcl-array-index': ['coins.length === 3', 'последний индекс = length - 1', 'не ошибка, а пустота'],
    'tcl-reference-vs-copy': ['скопировали ссылку', 'создали новый массив', 'a остался прежним'],
    'tcl-shallow-deep': ['дублируется только верхний уровень', 'вложенный объект — общий на двоих', 'у каждого свой вложенный объект'],
    'tcl-object-shape': ['точка: имя известно заранее', 'скобки: имя вычисляется', 'обе записи ведут к одному и тому же полю объекта'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsCollectionsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
