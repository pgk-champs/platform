import { render, screen } from '@testing-library/react';
import { tsOopSchemes } from './tsOop';

test('every tsOop scheme renders an accessible svg', () => {
  expect(Object.keys(tsOopSchemes)).toEqual([
    'to-blueprint-instances',
    'to-this-binding',
    'to-inheritance',
    'to-interface-erasure',
  ]);
  for (const id of Object.keys(tsOopSchemes)) {
    const { unmount } = render(<>{tsOopSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'to-blueprint-instances': ['это чертёж, не объект', 'лежит в прототипе класса'],
    'to-this-binding': ['точки нет — связь потеряна', 'TypeError при чтении поля', 'приклеен навсегда'],
    'to-inheritance': ['унаследовано без изменений', 'переопределено своим', 'до this'],
    'to-interface-erasure': ['исчезли без следа', 'настоящая стена, она остаётся'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsOopSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
