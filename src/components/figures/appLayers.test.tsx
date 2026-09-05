import { render, screen } from '@testing-library/react';
import { appLayersSchemes } from './appLayers';

test('every appLayers scheme renders an accessible svg', () => {
  expect(Object.keys(appLayersSchemes)).toEqual(['al-direction', 'al-repository', 'al-models']);
  for (const id of Object.keys(appLayersSchemes)) {
    const { unmount } = render(<>{appLayersSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'al-direction': ['если Composable импортировал Retrofit — стрелка пошла в обратную сторону, слои сломаны', '«Минимальное разделение на DOMAIN, PRESENTATION, DATA» — формулировка из задания'],
    'al-repository': ['«Экран Главная» и «Экран Главная (Network)» — это замена одной реализации', 'если репозитория нет, второй спринт превращается в переписывание экрана'],
    'al-models': ['пустота с сервера разбирается в мапперe: null превращается в 0 и пустую строку', 'переименовали поле на сервере — правится один маппер, а не весь проект'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{appLayersSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
