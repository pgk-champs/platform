import { render, screen } from '@testing-library/react';
import { tsNullSchemes } from './tsNull';

test('every tsNull scheme renders an accessible svg', () => {
  expect(Object.keys(tsNullSchemes)).toEqual(['tn-two-empties', 'tn-nullish-vs-or', 'tn-bang-cost']);
  for (const id of Object.keys(tsNullSchemes)) {
    const { unmount } = render(<>{tsNullSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tn-two-empties': ['поэтому проверка «если значение есть» отвергает настоящий нулевой баланс и пустую строку', 'ошибка языка, которой тридцать лет'],
    'tn-nullish-vs-or': ['на четырнадцати значениях они разошлись на шести: 0, −0, 0n, пустая строка, NaN и false', '?? подставляет запасное только вместо настоящей пустоты — для сумм и ставок нужен именно он'],
    'tn-bang-cost': ['весь файл прошёл строгую проверку без единой ошибки: про восклицательный знак компилятор молчит', 'в готовом коде от него не остаётся ничего — это обещание компилятору, а не проверка'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsNullSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
