import { render, screen } from '@testing-library/react';
import { webReduxSchemes } from './webRedux';

test('every webRedux scheme renders an accessible svg', () => {
  expect(Object.keys(webReduxSchemes)).toEqual(['wrx-prop-drilling', 'wrx-store-flow', 'wrx-immutable']);
  for (const id of Object.keys(webReduxSchemes)) {
    const { unmount } = render(<>{webReduxSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wrx-prop-drilling': ['на экране в обоих случаях одно и то же; разница в том, сколько работы ради этого сделано'],
    'wrx-store-flow': ['состояние меняется только так: другого пути внутрь хранилища нет', 'React в этой схеме не участвует: хранилище работает и без него'],
    'wrx-immutable': ['запись «изменяем на месте» — обман зрения: библиотека отдаёт черновик и собирает из него новый объект', 'благодаря этому сравнение по ссылке работает — и React видит, что изменилось, не сверяя поля'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webReduxSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
