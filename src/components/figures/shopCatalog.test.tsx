import { render, screen } from '@testing-library/react';
import { shopCatalogSchemes } from './shopCatalog';

test('every shopCatalog scheme renders an accessible svg', () => {
  expect(Object.keys(shopCatalogSchemes)).toEqual(['sc-envelope', 'sc-request-path', 'sc-paging']);
  for (const id of Object.keys(shopCatalogSchemes)) {
    const { unmount } = render(<>{shopCatalogSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sc-envelope': ['totalItems — сколько всего, а не сколько пришло', 'PageResponse<ProductDto>'],
    'sc-request-path': ['весь этот путь описан аннотациями — руками не собирается ни строка адреса, ни разбор тела', 'ошибка в имени поля DTO компилятор не поймает: она всплывёт при первом запуске'],
    'sc-paging': ['page=9 → 200 OK · items: [] · totalItems: 12 · totalPages: 3', 'страница за пределом — не ошибка: код 200 и пустой список, проверять нужно totalPages'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{shopCatalogSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
