import { render, screen } from '@testing-library/react';
import { solidityFlowSchemes } from './solidityFlow';

test('every solidityFlow scheme renders an accessible svg', () => {
  expect(Object.keys(solidityFlowSchemes)).toEqual(['sf-phase-boundary', 'sf-loop-gas', 'sf-array-vs-mapping']);
  for (const id of Object.keys(solidityFlowSchemes)) {
    const { unmount } = render(<>{solidityFlowSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sf-phase-boundary': ['300 → ещё seed', 'ветка public недостижима, компилятор молчит'],
    'sf-loop-gas': ['газ ≈ 48 626 + 2 514 × длина очереди — прямая, а не «немного медленнее»', 'функция мертва навсегда'],
    'sf-array-vs-mapping': ['в худшем случае разница в 105 раз — а ответ обе функции дают одинаковый', 'отображение — для вопроса «есть ли», массив — только чтобы показать список на экране'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solidityFlowSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
