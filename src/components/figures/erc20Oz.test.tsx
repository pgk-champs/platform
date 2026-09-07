import { render, screen } from '@testing-library/react';
import { erc20OzSchemes } from './erc20Oz';

test('every erc20Oz scheme renders an accessible svg', () => {
  expect(Object.keys(erc20OzSchemes)).toEqual(['eo-hand-vs-lib', 'eo-update-door', 'eo-safe-transfer']);
  for (const id of Object.keys(erc20OzSchemes)) {
    const { unmount } = render(<>{erc20OzSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'eo-hand-vs-lib': ['243 байта из 306 съедали тексты сообщений: свои ошибки короче строк', 'развёртывание: 1 019 899 газа против 966 009; перевод дешевле на 229'],
    'eo-update-door': ['выпуск отличается нулевым адресом отправителя, сжигание — нулевым получателем', 'защита, повешенная на один transfer, выглядит рабочей — и обходится вторым способом перевода'],
    'eo-safe-transfer': ['строка «ок, доехало 0» — токен соврал, а вызывающий записал себе успешную выплату', 'на обычном токене безопасный перевод не просто надёжнее — он ещё и дешевле ручной проверки'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{erc20OzSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
