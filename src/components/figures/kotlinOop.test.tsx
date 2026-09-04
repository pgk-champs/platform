import { render, screen } from '@testing-library/react';
import { kotlinOopSchemes } from './kotlinOop';

test('every kotlinOop scheme renders an accessible svg', () => {
  expect(Object.keys(kotlinOopSchemes)).toEqual([
    'ko-class-anatomy',
    'ko-open-final',
    'ko-data-class',
    'ko-sealed-when',
  ]);
  for (const id of Object.keys(kotlinOopSchemes)) {
    const { unmount } = render(<>{kotlinOopSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ko-class-anatomy': ['свойство и параметр сразу', 'init выполняется при создании объекта', 'значение по умолчанию'],
    'ko-open-final': ['замок закрыт', 'замок открыт', 'наследники разрешены, метод — тоже через open'],
    'ko-data-class': ['сравнение по содержимому', 'клон с заменой поля', 'разбор на переменные'],
    'ko-sealed-when': ['снаружи файла новых не добавить', 'ветка else не нужна: все случаи уже перечислены', 'компилятор сам покажет этот when'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{kotlinOopSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
