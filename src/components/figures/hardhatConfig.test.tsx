import { render, screen } from '@testing-library/react';
import { hardhatConfigSchemes } from './hardhatConfig';

test('every hardhatConfig scheme renders an accessible svg', () => {
  expect(Object.keys(hardhatConfigSchemes)).toEqual(['hc-config-map', 'hc-compile-output', 'hc-two-networks']);
  for (const id of Object.keys(hardhatConfigSchemes)) {
    const { unmount } = render(<>{hardhatConfigSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'hc-config-map': ['файл настроек — единственное, что отличает папку с пакетом от проекта', 'без него любая команда упирается в HHE3, с ним — работает всё остальное'],
    'hc-compile-output': ['в сеть уезжает только байт-код: ни имён, ни комментариев, ни названий переменных там нет', 'оптимизатор ужал тело контракта с 2253 до 1115 байт — вдвое, при том же поведении'],
    'hc-two-networks': ['счета в симуляторе даёт он сам; в своей сети — ровно те ключи, что вы вписали в настройки', 'отсюда «почему getSigners вернул один адрес вместо двадцати»: вы уже не в симуляторе'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{hardhatConfigSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
