import { render, screen } from '@testing-library/react';
import { tsTypesSchemes } from './tsTypes';

test('every tsTypes scheme renders an accessible svg', () => {
  expect(Object.keys(tsTypesSchemes)).toEqual(['tt-any-vs-unknown', 'tt-tagged-union', 'tt-generics']);
  for (const id of Object.keys(tsTypesSchemes)) {
    const { unmount } = render(<>{tsTypesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tt-any-vs-unknown': ['разбор ответа из сети всегда начинают с unknown: что придёт на самом деле, программа не знает', 'падение увидит пользователь'],
    'tt-tagged-union': ['компилятор сам сужает тип после проверки метки: в успешной ветке есть данные, в другой — причина', 'связи между ok и data в типе нет'],
    'tt-generics': ['обобщение — это параметр не для значения, а для типа: чем накормили, то и вернётся', 'опечатка в имени поля прошла молча'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsTypesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
