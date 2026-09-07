import { render, screen } from '@testing-library/react';
import { erc4626Schemes } from './erc4626';

test('every erc4626 scheme renders an accessible svg', () => {
  expect(Object.keys(erc4626Schemes)).toEqual(['ev-share-price', 'ev-inflation-attack', 'ev-rounding']);
  for (const id of Object.keys(erc4626Schemes)) {
    const { unmount } = render(<>{erc4626Schemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ev-share-price': ['число долей у вкладчика не меняется — меняется их цена: 1.000000 → 1.300000 → 1.469565 → 1.592028', 'первый вкладчик получает доли один к одному: делить ещё не на что'],
    'ev-inflation-attack': ['получает 0 долей', 'с виртуальными долями жертва получает 1 999 999 долей и теряет 0.000249 USDC вместо тысячи'],
    'ev-rounding': ['круговой рейс без паузы: внесли 1000.000000, забрали 999.999999 — минус одна единица', '200 таких рейсов оставили в хранилище 200 единиц: цена доли выросла без всякого дохода'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{erc4626Schemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
