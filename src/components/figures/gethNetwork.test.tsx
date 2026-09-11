import { render, screen } from '@testing-library/react';
import { gethNetworkSchemes } from './gethNetwork';

test('every gethNetwork scheme renders an accessible svg', () => {
  expect(Object.keys(gethNetworkSchemes)).toEqual(['gn-node-parts', 'gn-genesis-to-block', 'gn-who-signs']);
  for (const id of Object.keys(gethNetworkSchemes)) {
    const { unmount } = render(<>{gethNetworkSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'gn-node-parts': ['папка datadir — это и есть вся сеть: удалили её — удалили цепочку, счета и историю', 'порт 8545 — единственная дверь снаружи: вопрос по HTTP, ответ в JSON'],
    'gn-genesis-to-block': ['хеш блока 0 — отпечаток всего файла: изменили одну цифру в alloc — получили другую сеть', 'поэтому узлы с разным genesis не договорятся никогда, даже если chainId у них совпал'],
    'gn-who-signs': ['в подпись входит chainId: та же транзакция для другой сети не годится', 'это и есть защита от переноса подписанной транзакции в чужую сеть'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{gethNetworkSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
