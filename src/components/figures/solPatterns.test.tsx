import { render, screen } from '@testing-library/react';
import { solPatternsSchemes } from './solPatterns';

test('every solPatterns scheme renders an accessible svg', () => {
  expect(Object.keys(solPatternsSchemes)).toEqual(['sp-reentrancy', 'sp-push-vs-pull', 'sp-ownership']);
  for (const id of Object.keys(solPatternsSchemes)) {
    const { unmount } = render(<>{solPatternsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sp-reentrancy': ['внешний вызов отдаёт управление чужому коду — и тот заходит обратно, пока запись ещё не сделана', 'запись есть, денег нет: anna получает откат'],
    'sp-push-vs-pull': ['транзакция атомарна: один отказ останавливает всех', 'получатель, который пишет к себе в хранилище, при transfer откатывает всю транзакцию'],
    'sp-ownership': ['отказ от владения необратим: в казне остались заперты 5 ETH, снять их не может уже никто', 'owner = 0x000…000'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solPatternsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
