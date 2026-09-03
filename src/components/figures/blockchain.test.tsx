import { render, screen } from '@testing-library/react';
import { blockchainSchemes } from './blockchain';

// jsdom не считает реальный layout (getBBox недоступен), поэтому ширина
// текста здесь — оценка с запасом, откалиброванная по трём случаям
// обрезания, пойманным живым браузером (getBBox): ~0.51 px на символ на
// единицу fontSize, здесь взято 0.55 — с запасом, чтобы не пропустить.
const centeredTextOverflow = (text: string, x: number, fontSize: number, viewBoxWidth: number) => {
  const half = (text.length * fontSize * 0.55) / 2;
  return Math.max(0, half - x) + Math.max(0, x + half - viewBoxWidth);
};

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

test('contract-tx-flow: подпись снизу умещается в viewBox (была 895px при ширине 800)', () => {
  const { container, unmount } = render(<>{blockchainSchemes['contract-tx-flow']('схема')}</>);
  const svg = container.querySelector('svg')!;
  const viewBoxWidth = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const texts = [...container.querySelectorAll('text[text-anchor="middle"]')];
  expect(texts.length).toBeGreaterThan(0);
  for (const t of texts) {
    const overflow = centeredTextOverflow(
      t.textContent || '',
      Number(t.getAttribute('x')),
      Number(t.getAttribute('font-size')),
      viewBoxWidth,
    );
    expect(overflow).toBe(0);
  }
  unmount();
});
