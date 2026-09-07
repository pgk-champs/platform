import { render, screen } from '@testing-library/react';
import { tsRunSchemes } from './tsRun';

test('every tsRun scheme renders an accessible svg', () => {
  expect(Object.keys(tsRunSchemes)).toEqual(['tr-three-ways', 'tr-what-erases', 'tr-three-errors']);
  for (const id of Object.keys(tsRunSchemes)) {
    const { unmount } = render(<>{tsRunSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tr-three-ways': ['только первый путь оставляет артефакт на диске: после прямого запуска рядом не появляется ничего', 'типы срезаны, но НИЧЕГО не проверено'],
    'tr-what-erases': ['21 строка и 768 символов исходника превратились в 19 строк и 579 символов', 'проверка типа во время работы даёт «number», а не имя вашего типа: имени уже нет'],
    'tr-three-errors': ['компилятор поймал одну из трёх, запуск уронил одну — третью не поймал никто', 'напечатал неправду'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsRunSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
