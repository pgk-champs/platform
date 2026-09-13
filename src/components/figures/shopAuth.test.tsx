import { render, screen } from '@testing-library/react';
import { shopAuthSchemes } from './shopAuth';

test('every shopAuth scheme renders an accessible svg', () => {
  expect(Object.keys(shopAuthSchemes)).toEqual(['sa-field-errors', 'sa-token-life', 'sa-404-mask']);
  for (const id of Object.keys(shopAuthSchemes)) {
    const { unmount } = render(<>{shopAuthSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sa-field-errors': ['показать «Failed to create record.» под формой — потерять балл: пользователь не узнал, что чинить', 'из data достаётся, что пароли не совпали — и подпись встаёт под нужным полем'],
    'sa-token-life': ['224 символа · живёт 5 суток · подделать нельзя, прочитать — можно', 'заголовок вешается в одном месте — иначе его забудут ровно в том запросе, который проверяет эксперт'],
    'sa-404-mask': ['PocketBase не признаётся, что запись есть, но не твоя', 'по коду ответа отличить «не вошёл» от «нет такого» нельзя — решает наличие токена на устройстве'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{shopAuthSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
