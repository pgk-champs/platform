import { render, screen } from '@testing-library/react';
import { cleanCodeSchemes } from './cleanCode';

test('every cleanCode scheme renders an accessible svg', () => {
  expect(Object.keys(cleanCodeSchemes)).toEqual(['cc-multiplier', 'cc-recomposition', 'cc-log-format']);
  for (const id of Object.keys(cleanCodeSchemes)) {
    const { unmount } = render(<>{cleanCodeSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'cc-multiplier': ['101 аспект с оговоркой «половина оценки»', 'двадцать шапок по полминуты — десять минут набора, которые спасают 43 балла'],
    'cc-recomposition': ['30 проходов фильтра · 900 созданных объектов форматтера', '«логика не в разметке» — не вкусовщина, а разница в девятьсот раз'],
    'cc-log-format': ['компонент неизвестен · причины нет', 'слева это не найти в принципе — не из чего; справа читается механически'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{cleanCodeSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
