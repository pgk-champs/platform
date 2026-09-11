import { render, screen } from '@testing-library/react';
import { webCssSchemes } from './webCss';

test('every webCss scheme renders an accessible svg', () => {
  expect(Object.keys(webCssSchemes)).toEqual(['wc-box-model', 'wc-specificity', 'wc-units']);
  for (const id of Object.keys(webCssSchemes)) {
    const { unmount } = render(<>{webCssSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wc-box-model': ['по умолчанию 200 означает «текст 200, а всего сколько получится» — отсюда съехавшие колонки', 'поэтому первой строкой оформления почти всегда пишут второй способ счёта для всего сразу'],
    'wc-specificity': ['при равном весе побеждает то правило, что записано ниже: порядок решает только ничью'],
    'wc-units': ['размеры шрифта берут в rem: он считается от одного места и не накапливается по вложенности', 'em внутри em умножается: три уровня по 1.5 дают не 1.5, а 3.375 от исходного'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webCssSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
