import { render, screen } from '@testing-library/react';
import { shopCartSchemes } from './shopCart';

test('every shopCart scheme renders an accessible svg', () => {
  expect(Object.keys(shopCartSchemes)).toEqual(['sk-thin-row', 'sk-join', 'sk-no-checks']);
  for (const id of Object.keys(shopCartSchemes)) {
    const { unmount } = render(<>{shopCartSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sk-thin-row': ['итог корзины считает приложение — сервер про деньги не знает вообще', 'названия, цены и суммы на сервере нет'],
    'sk-join': ['expand здесь не поможет: product_id — обычная строка, а не связь между коллекциями', 'запрос на каждую строку корзины — это N+1: три товара, четыре похода в сеть'],
    'sk-no-checks': ['проверки — забота приложения: сервер задания это хранилище строк, а не магазин', 'две отдельные строки, дубль не склеился'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{shopCartSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
