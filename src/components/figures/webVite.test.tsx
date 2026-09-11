import { render, screen } from '@testing-library/react';
import { webViteSchemes } from './webVite';

test('every webVite scheme renders an accessible svg', () => {
  expect(Object.keys(webViteSchemes)).toEqual(['wv-pipeline', 'wv-type-gate', 'wv-env']);
  for (const id of Object.keys(webViteSchemes)) {
    const { unmount } = render(<>{webViteSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wv-pipeline': ['на сервер уезжает только правая колонка: обычные файлы, которые понимает любой браузер', 'случайные буквы в именах — чтобы браузер не показал старую версию из своего запаса'],
    'wv-type-gate': ['папка готовых файлов при этом не обновилась: сломанный код физически некуда выложить'],
    'wv-env': ['переменная с приставкой уезжает к пользователю в открытом виде: её видно в исходном коде страницы', '«спрятать ключ во фронтенде» невозможно в принципе: весь код страницы открыт'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webViteSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
