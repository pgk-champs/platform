import { render, screen } from '@testing-library/react';
import { shopFailuresSchemes } from './shopFailures';

test('every shopFailures scheme renders an accessible svg', () => {
  expect(Object.keys(shopFailuresSchemes)).toEqual(['sx-classify', 'sx-retry', 'sx-logout']);
  for (const id of Object.keys(shopFailuresSchemes)) {
    const { unmount } = render(<>{shopFailuresSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sx-classify': ['экран знает про четыре исхода — не про исключения OkHttp и не про коды HTTP'],
    'sx-retry': ['повтор POST опасен вдвойне: заказ может оформиться дважды', 'пауза удваивается: 300 · 600 · 1200 мс'],
    'sx-logout': ['настоящий выход — стереть токен с устройства; сервер его не отзывает', 'токен останется годным до своего exp — пять суток с момента выдачи'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{shopFailuresSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
