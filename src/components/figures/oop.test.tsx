import { render, screen } from '@testing-library/react';
import { oopSchemes } from './oop';

test('every oop scheme renders an accessible svg', () => {
  expect(Object.keys(oopSchemes)).toEqual([
    'oop-class-vs-instance',
    'oop-encapsulation',
    'oop-inheritance-tree',
    'oop-interface-contract',
  ]);
  for (const id of Object.keys(oopSchemes)) {
    const { unmount } = render(<>{oopSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'oop-class-vs-instance': ['class Student', 'экземпляр #1', 'group: String'],
    'oop-encapsulation': ['private balance', 'deposit(sum)', 'объект Wallet'],
    'oop-inheritance-tree': ['RobotDog', 'val barker: Barker', 'композиция'],
    'oop-interface-contract': ['interface Payment', 'CryptoPayment', 'pay(sum): Boolean'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{oopSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
