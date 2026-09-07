import { render, screen } from '@testing-library/react';
import { tsErrorsSchemes } from './tsErrors';

test('every tsErrors scheme renders an accessible svg', () => {
  expect(Object.keys(tsErrorsSchemes)).toEqual(['te-revert-vs-crash', 'te-catch-unknown', 'te-throw-vs-result']);
  for (const id of Object.keys(tsErrorsSchemes)) {
    const { unmount } = render(<>{tsErrorsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'te-revert-vs-crash': ['скрипт, упавший на середине демонстрации, оставляет систему в половинчатом состоянии', 'отменять нечего и некому'],
    'te-catch-unknown': ['бросить можно что угодно — поэтому пойманное значение имеет тип «неизвестно» и требует проверки', 'стека нет'],
    'te-throw-vs-result': ['про забытое исключение компилятор не скажет ничего — про необработанный результат скажет всегда', 'обработать заставили до запуска'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsErrorsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
