import { render, screen } from '@testing-library/react';
import { solidityTypesSchemes } from './solidityTypes';

test('every solidityTypes scheme renders an accessible svg', () => {
  expect(Object.keys(solidityTypesSchemes)).toEqual(['st-overflow', 'st-integer-div', 'st-units']);
  for (const id of Object.keys(solidityTypesSchemes)) {
    const { unmount } = render(<>{solidityTypesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'st-overflow': ['ОТКАТ · panic code 0x11', 'цена проверки измерена: 22 403 против 22 143 газа — 260 газа за операцию'],
    'st-integer-div': ['7 → 0 · 30 / 100 уже ноль', '5000,999999999999 токена'],
    'st-units': ['750 000 000 000 000 wei', 'суффикс всегда во множественном числе: 1 minutes, не 1 minute — иначе компилятор не поймёт'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solidityTypesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
