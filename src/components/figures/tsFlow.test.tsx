import { render, screen } from '@testing-library/react';
import { tsFlowSchemes } from './tsFlow';

test('every tsFlow scheme renders an accessible svg', () => {
  expect(Object.keys(tsFlowSchemes)).toEqual([
    'tf-if-else-fork',
    'tf-switch-fallthrough',
    'tf-for-anatomy',
    'tf-loop-kinds',
  ]);
  for (const id of Object.keys(tsFlowSchemes)) {
    const { unmount } = render(<>{tsFlowSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tf-if-else-fork': ['ветка if', 'ветка else', 'снова сходятся в одну дорогу'],
    'tf-switch-fallthrough': ['вход сюда', 'выполнится тоже!', 'в консоли две строки:'],
    'tf-for-anatomy': ['1. начало', '2. проверка', 'условие ложно — выход из цикла'],
    'tf-loop-kinds': ['сам элемент', 'ключ, СТРОКА', 'считаешь сам'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsFlowSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
