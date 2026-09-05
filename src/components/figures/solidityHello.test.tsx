import { render, screen } from '@testing-library/react';
import { solidityHelloSchemes } from './solidityHello';

test('every solidityHello scheme renders an accessible svg', () => {
  expect(Object.keys(solidityHelloSchemes)).toEqual(['sh-text-to-bytes', 'sh-view-vs-tx', 'sh-error-anatomy']);
  for (const id of Object.keys(solidityHelloSchemes)) {
    const { unmount } = render(<>{solidityHelloSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sh-text-to-bytes': ['364 байта на развёртывание · 333 останутся в сети', 'имени inc в байткоде нет — вместо него 4 байта селектора 0x371303c0'],
    'sh-view-vs-tx': ['новых блоков: 0', 'второй inc(): 26 410 — ячейка уже занята'],
    'sh-error-anatomy': ['пропуск в строке 5, а ошибка указывает на строку 7 — компилятор показывает, где споткнулся', 'чинить сверху вниз и компилировать после каждой правки'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solidityHelloSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
