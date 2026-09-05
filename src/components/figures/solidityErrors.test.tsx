import { render, screen } from '@testing-library/react';
import { solidityErrorsSchemes } from './solidityErrors';

test('every solidityErrors scheme renders an accessible svg', () => {
  expect(Object.keys(solidityErrorsSchemes)).toEqual(['se-revert-all', 'se-string-vs-error', 'se-inverted-check']);
  for (const id of Object.keys(solidityErrorsSchemes)) {
    const { unmount } = render(<>{solidityErrorsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'se-revert-all': ['данные вернулись как были — работа машины оплачена: 0,00007 ETH за отклонённую транзакцию', 'промежуточного «половина записалась» не бывает: статус 1 или статус 0'],
    'se-string-vs-error': ['откат стоит одинаково — экономия в байткоде: текст сообщения в него не зашит', 'InsufficientBalance(5, 10)'],
    'se-inverted-check': ['сломанный контракт владельца пропускает — автор решает «работает» и идёт дальше', 'компилятор молчит: с точки зрения языка обе записи одинаково правильны'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solidityErrorsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
