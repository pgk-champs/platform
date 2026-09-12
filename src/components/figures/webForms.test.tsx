import { render, screen } from '@testing-library/react';
import { webFormsSchemes } from './webForms';

test('every webForms scheme renders an accessible svg', () => {
  expect(Object.keys(webFormsSchemes)).toEqual(['wfo-number-input', 'wfo-parse-amount', 'wfo-checksum']);
  for (const id of Object.keys(webFormsSchemes)) {
    const { unmount } = render(<>{webFormsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wfo-number-input': ['запятая и буквы не попадают в значение вовсе: пользователь печатает, а поле остаётся пустым', 'показательная строка — 1e5: браузер её принял, а библиотека сумм отвергла'],
    'wfo-parse-amount': ['суммы не хранят дробными числами: между строкой поля и транзакцией стоит перевод в целые вей', 'отрицательную сумму библиотека пропустит — проверять знак придётся самим'],
    'wfo-checksum': ['адрес в смешанном регистре сам себя проверяет: опечатка в одном символе поймана до отправки', 'адрес целиком строчными проходит всегда — контрольной суммы в нём просто нет'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webFormsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
