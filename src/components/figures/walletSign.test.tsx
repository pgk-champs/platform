import { render, screen } from '@testing-library/react';
import { walletSignSchemes } from './walletSign';

test('every walletSign scheme renders an accessible svg', () => {
  expect(Object.keys(walletSignSchemes)).toEqual(['wls-recover', 'wls-712', 'wls-onchain']);
  for (const id of Object.keys(walletSignSchemes)) {
    const { unmount } = render(<>{walletSignSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wls-recover': ['проверка — это всегда сравнение: восстановили адрес и сверили с тем, кого ждали', '65 байт подписи: две половины по 32 байта и один байт-признак'],
    'wls-712': ['домен отвечает на вопрос «где эта подпись действительна»: другая сеть или другой контракт — уже нет', 'проверено: тот же подписанный текст в сети 1 вместо 1337 восстановил чужой адрес'],
    'wls-onchain': ['подпись, сделанную в браузере, контракт проверяет сам — и не тратит на это ни одной транзакции'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{walletSignSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
