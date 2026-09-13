import { render, screen } from '@testing-library/react';
import { shopDaySchemes } from './shopDay';

test('every shopDay scheme renders an accessible svg', () => {
  expect(Object.keys(shopDaySchemes)).toEqual(['sday-order', 'sday-slice', 'sday-checklist']);
  for (const id of Object.keys(shopDaySchemes)) {
    const { unmount } = render(<>{shopDaySchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sday-order': ['вход раньше каталога — потому что без токена половина запросов вернёт 404', 'красивый экран без данных не стоит ничего: критерии смотрят на работу, а не на вёрстку'],
    'sday-slice': ['если день кончится раньше плана, во втором случае есть что показать, а в первом нет', 'эксперт оценивает работающее поведение, а не количество написанных классов'],
    'sday-checklist': ['Пройдено: 15 из 15', 'прогон занимает секунды и ловит то, что глазами по экранам не поймать'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{shopDaySchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
