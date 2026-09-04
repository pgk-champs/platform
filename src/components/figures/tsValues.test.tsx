import { render, screen } from '@testing-library/react';
import { tsValuesSchemes } from './tsValues';

test('every tsValues scheme renders an accessible svg', () => {
  expect(Object.keys(tsValuesSchemes)).toEqual([
    'tv-value-vs-var',
    'tv-number-precision',
    'tv-falsy-ladder',
    'tv-null-undefined',
  ]);
  for (const id of Object.keys(tsValuesSchemes)) {
    const { unmount } = render(<>{tsValuesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tv-value-vs-var': ['как кажется', 'как на самом деле', 'два ярлыка на одном значении'],
    'tv-number-precision': ['number = IEEE 754 double', '0.30000000000000004', 'шаг через одно'],
    'tv-falsy-ladder': ['falsy — условие ложно', 'truthy — условие истинно', 'здесь и ломается интуиция'],
    'tv-null-undefined': ['возникает само собой', 'кладут руками', 'null == undefined → true'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsValuesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
