import { render, screen } from '@testing-library/react';
import { solContractsOopSchemes } from './solContractsOop';

test('every solContractsOop scheme renders an accessible svg', () => {
  expect(Object.keys(solContractsOopSchemes)).toEqual(['sco-two-instances', 'sco-enum-numbers', 'sco-access-table']);
  for (const id of Object.keys(solContractsOopSchemes)) {
    const { unmount } = render(<>{solContractsOopSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sco-two-instances': ['газ развёртывания одинаков — 257 464: байткод один. Различаются адрес и память', 'owner дочернего — адрес контракта-создателя, а не человека'],
    'sco-enum-numbers': ['panic code 0x21 — значение вне диапазона', 'нулевой вариант должен быть самым безопасным — гость, а не владелец'],
    'sco-access-table': ['диагональ: каждый — в свою функцию', 'в перевёрнутом варианте единственный отказ получает сам владелец, а посторонний проходит везде'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solContractsOopSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
