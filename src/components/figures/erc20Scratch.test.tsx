import { render, screen } from '@testing-library/react';
import { erc20ScratchSchemes } from './erc20Scratch';

test('every erc20Scratch scheme renders an accessible svg', () => {
  expect(Object.keys(erc20ScratchSchemes)).toEqual(['es-standard-parts', 'es-events-truth', 'es-gas-table']);
  for (const id of Object.keys(erc20ScratchSchemes)) {
    const { unmount } = render(<>{erc20ScratchSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'es-standard-parts': ['кошелёк и биржа понимают любой токен потому, что заранее знают эти подписи', 'вызывающий не должен на них рассчитывать'],
    'es-events-truth': ['по журналу переведено 50,', 'перевод нуля тоже даёт событие — стандарт требует считать его обычным переводом'],
    'es-gas-table': ['разница в обоих случаях ровно 17 100 — цена превращения нулевой ячейки в ненулевую', 'два события стоят 1 953 газа за перевод и 518 байт кода'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{erc20ScratchSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
