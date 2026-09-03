import { render, screen } from '@testing-library/react';
import { blockchainSchemes } from './blockchain';

test('every blockchain scheme renders an accessible svg', () => {
  expect(Object.keys(blockchainSchemes)).toEqual([
    'hash-avalanche',
    'signature-keys',
    'mining-nonce',
    'node-network',
    'contract-anatomy',
    'contract-tx-flow',
  ]);
  for (const id of Object.keys(blockchainSchemes)) {
    const { unmount } = render(<>{blockchainSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'hash-avalanche': ['SHA-256', '7c1366a3…'],
    'signature-keys': ['закрытый ключ', 'открытый ключ', 'VERIFY → OK'],
    'mining-nonce': ['nonce: 41', 'nonce: 44'],
    'node-network': ['node-0', 'node-1', 'node-2'],
    'contract-anatomy': ['@Contract()', '@State()', '@Action()'],
    'contract-tx-flow': ['CreateContractTx', 'CallContractTx'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{blockchainSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
