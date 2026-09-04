import { render, screen } from '@testing-library/react';
import { kotlinFlowSchemes } from './kotlinFlow';

test('every kotlinFlow scheme renders an accessible svg', () => {
  expect(Object.keys(kotlinFlowSchemes)).toEqual([
    'kf-if-expression',
    'kf-when-branches',
    'kf-ranges',
    'kf-null-chain',
  ]);
  for (const id of Object.keys(kotlinFlowSchemes)) {
    const { unmount } = render(<>{kotlinFlowSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'kf-if-expression': ['переменная какое-то время живёт пустой', 'ветка отдаёт значение — его сразу забирает val', 'компилятор потребует вторую ветку'],
    'kf-when-branches': ['совпало: только эта ветка', 'уже не проверяется', 'никакого break нет'],
    'kf-ranges': ['обе границы включены', 'правая граница НЕ включена', 'через шаг'],
    'kf-null-chain': ['вызов пропускается, дальше идёт null', 'подставляется запасное значение', 'падение прямо здесь и сейчас'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{kotlinFlowSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
