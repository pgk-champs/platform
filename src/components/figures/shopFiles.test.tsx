import { render, screen } from '@testing-library/react';
import { shopFilesSchemes } from './shopFiles';

test('every shopFiles scheme renders an accessible svg', () => {
  expect(Object.keys(shopFilesSchemes)).toEqual(['sf-file-url', 'sf-multipart', 'sf-thumb']);
  for (const id of Object.keys(shopFilesSchemes)) {
    const { unmount } = render(<>{shopFilesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sf-file-url': ['подставить это имя в тег картинки напрямую нельзя — адрес собирается из трёх частей', 'картинки каталога и акций отдаются без токена — они публичные'],
    'sf-multipart': ['имя в скобках у файла — частая ошибка: часть уедет дважды и сервер её не примет', 'обычные поля и файл едут вместе, каждое своей частью'],
    'sf-thumb': ['незаявленный размер не даёт ошибки — молча приходит файл целиком', 'надёжнее просить оригинал и уменьшать на устройстве: Coil делает это сам'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{shopFilesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
