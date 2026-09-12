import { render, screen } from '@testing-library/react';
import { walletConnectSchemes } from './walletConnect';

test('every walletConnect scheme renders an accessible svg', () => {
  expect(Object.keys(walletConnectSchemes)).toEqual(['wlc-provider', 'wlc-connect-flow', 'wlc-discovery']);
  for (const id of Object.keys(walletConnectSchemes)) {
    const { unmount } = render(<>{walletConnectSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wlc-provider': ['приватный ключ не покидает кошелёк: страница может только просить, а подписывает человек', 'библиотеке всё равно, кто перед ней — важен только этот интерфейс'],
    'wlc-connect-flow': ['пользователь отказался', 'просим чужую сеть'],
    'wlc-discovery': ['у каждого кошелька есть имя, значок и обратное доменное имя — по нему их и различают', 'старое поле никуда не делось и работает: новый способ добавили рядом, не ломая прежний'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{walletConnectSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
