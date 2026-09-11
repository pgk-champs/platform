import { render, screen } from '@testing-library/react';
import { hardhatTestSchemes } from './hardhatTest';

test('every hardhatTest scheme renders an accessible svg', () => {
  expect(Object.keys(hardhatTestSchemes)).toEqual(['ht-two-kinds', 'ht-fixture', 'ht-gas-coverage']);
  for (const id of Object.keys(hardhatTestSchemes)) {
    const { unmount } = render(<>{hardhatTestSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ht-two-kinds': ['одна команда запускает оба набора: 5 тестов на Solidity и 8 на TypeScript', 'логику контракта удобнее проверять первым видом, сценарий целиком — вторым'],
    'ht-fixture': ['фикстура выполняется один раз, дальше сеть просто откатывается к снимку — это быстрее развёртывания', 'тест, который проходит только вторым по счёту, — не тест, а совпадение'],
    'ht-gas-coverage': ['газ показывает, что дорого; покрытие — до чего тесты не дотянулись ни разу', 'сто процентов покрытия не означают, что логика верна: означают лишь, что каждая строка исполнялась'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{hardhatTestSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
