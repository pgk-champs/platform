import { render, screen } from '@testing-library/react';
import { tsAsyncNetSchemes } from './tsAsyncNet';

test('every tsAsyncNet scheme renders an accessible svg', () => {
  expect(Object.keys(tsAsyncNetSchemes)).toEqual(['tan-two-errors', 'tan-serial-vs-parallel', 'tan-timeout-retry']);
  for (const id of Object.keys(tsAsyncNetSchemes)) {
    const { unmount } = render(<>{tsAsyncNetSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tan-two-errors': ['опечатка в имени метода — не сетевая ошибка: сеть сработала идеально, отказал узел', 'перехват не сработает — исключения нет'],
    'tan-serial-vs-parallel': ['клиент не стал быстрее — он перестал ждать: работу параллелит сервер', 'порядок результатов сохраняется — они идут как в списке, а не как пришли'],
    'tan-timeout-retry': ['таймаута по умолчанию нет вообще: скрипт без него висит, пока его не убьют', 'две первые — таймаут, третья успешна'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{tsAsyncNetSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
