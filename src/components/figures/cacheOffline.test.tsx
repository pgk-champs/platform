import { render, screen } from '@testing-library/react';
import { cacheOfflineSchemes } from './cacheOffline';

test('every cacheOffline scheme renders an accessible svg', () => {
  expect(Object.keys(cacheOfflineSchemes)).toEqual(['co-strategies', 'co-source-of-truth', 'co-three-empties']);
  for (const id of Object.keys(cacheOfflineSchemes)) {
    const { unmount } = render(<>{cacheOfflineSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'co-strategies': ['4 мс до первого содержимого вместо 906 — и в авиарежиме экран не пустеет', 'но при пустом кэше обе стратегии одинаково беспомощны: показывать нечего'],
    'co-source-of-truth': ['refresh() ничего не возвращает — и это правильно: экран узнаёт об обновлении от базы', 'если экран подписан на ответ сети, второй экран о правках не узнает'],
    'co-three-empties': ['rows.isEmpty() во всех трёх случаях: true', 'по одной пустоте состояние не определить — нужны флаг загрузки и признак ошибки'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{cacheOfflineSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
