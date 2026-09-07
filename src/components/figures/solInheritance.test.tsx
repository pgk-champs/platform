import { render, screen } from '@testing-library/react';
import { solInheritanceSchemes } from './solInheritance';

test('every solInheritance scheme renders an accessible svg', () => {
  expect(Object.keys(solInheritanceSchemes)).toEqual(['si-virtual-call', 'si-linearization', 'si-errors']);
  for (const id of Object.keys(solInheritanceSchemes)) {
    const { unmount } = render(<>{solInheritanceSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'si-virtual-call': ['код _mint один и тот же — число разное: decimals() подменил наследник, даже вызванный из конструктора базы', 'доставит в 12-значном токене миллион вместо одного'],
    'si-linearization': ['super — «следующий в очереди», а не «мой родитель»: в C он уходит в B, хотя в коде C написано только is A', 'общий предок выполняется ровно один раз'],
    'si-errors': ['Trying to override non-virtual function', 'Linearization of inheritance graph impossible'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solInheritanceSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
