import { render, screen } from '@testing-library/react';
import { tsFunctionsSchemes } from './tsFunctions';

test('every tsFunctions scheme renders an accessible svg', () => {
  expect(Object.keys(tsFunctionsSchemes)).toEqual([
    'tfn-call-return',
    'tfn-three-forms',
    'tfn-closure',
    'tfn-signature',
  ]);
  for (const id of Object.keys(tsFunctionsSchemes)) {
    const { unmount } = render(<>{tsFunctionsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tfn-call-return': ['место вызова', 'тело функции', 'аргументы 1000 и 3', 'одно значение: 30'],
    'tfn-three-forms': ['объявление', 'выражение', 'стрелка', 'своего this НЕТ'],
    'tfn-closure': ['внешняя функция', 'уносит с собой', 'n продолжает жить, пока жива next'],
    'tfn-signature': ['типы параметров — внутри скобок', 'тип результата — после скобок', 'типы исчезли, тело осталось'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsFunctionsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
