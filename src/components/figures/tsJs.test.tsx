import { render, screen } from '@testing-library/react';
import { tsJsSchemes } from './tsJs';

test('every tsJs scheme renders an accessible svg', () => {
  expect(Object.keys(tsJsSchemes)).toEqual([
    'tj-compile-away',
    'tj-type-catches',
    'tj-any-hole',
    'tj-api-response',
  ]);
  for (const id of Object.keys(tsJsSchemes)) {
    const { unmount } = render(<>{tsJsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tj-compile-away': ['contract.ts', 'contract.js', 'ни одной аннотации'],
    'tj-type-catches': ['ловит tsc до запуска', 'не ловит никто', 'забытый await у Promise'],
    'tj-any-hole': ['данные как any', 'unknown — «сначала проверь»', 'any заразен'],
    'tj-api-response': ['localhost:6862', 'GET /blocks/height', 'BlockHeight'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsJsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
