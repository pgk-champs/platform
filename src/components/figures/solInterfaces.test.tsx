import { render, screen } from '@testing-library/react';
import { solInterfacesSchemes } from './solInterfaces';

test('every solInterfaces scheme renders an accessible svg', () => {
  expect(Object.keys(solInterfacesSchemes)).toEqual(['sif-approve-flow', 'sif-wrong-address', 'sif-rules']);
  for (const id of Object.keys(solInterfacesSchemes)) {
    const { unmount } = render(<>{solInterfacesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sif-approve-flow': ['allowance: 1000 → 400 — разрешение расходуется', '700 на балансе, 600 в записи'],
    'sif-wrong-address': ['ни у одного отката нет причины: данные пустые, текста нет — интерфейс ничего не проверяет заранее', 'селектор совпал, перевод внутри прошёл, но ответ не той длины откатил всё'],
    'sif-rules': ['приведение IERC20(addr) ничего не проверяет в сети: это обещание компилятору, а не сети', 'переменные состояния'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solInterfacesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
