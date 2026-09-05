import { render, screen } from '@testing-library/react';
import { networkLayerSchemes } from './networkLayer';

test('every networkLayer scheme renders an accessible svg', () => {
  expect(Object.keys(networkLayerSchemes)).toEqual(['nl-request', 'nl-interface', 'nl-path']);
  for (const id of Object.keys(networkLayerSchemes)) {
    const { unmount } = render(<>{networkLayerSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'nl-request': ['метод — что делаем', 'тело — что передаём', '401 — токен протух'],
    'nl-interface': ['Retrofit сам собирает запрос по описанию и сам разбирает ответ в объект', 'ваше дело — правильно описать, а не правильно склеить строку'],
    'nl-path': ['границы слоёв — это места, где данные меняют форму', 'дальше DTO не проходит: экран не должен знать, как поле называлось на сервере'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{networkLayerSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
