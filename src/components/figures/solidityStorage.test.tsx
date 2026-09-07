import { render, screen } from '@testing-library/react';
import { solidityStorageSchemes } from './solidityStorage';

test('every solidityStorage scheme renders an accessible svg', () => {
  expect(Object.keys(solidityStorageSchemes)).toEqual(['ss-delete-hole', 'ss-storage-cost', 'ss-events-vs-history']);
  for (const id of Object.keys(solidityStorageSchemes)) {
    const { unmount } = render(<>{solidityStorageSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ss-delete-hole': ['дыра выглядит как заявка', 'swap-and-pop даёт длину 2, но переставляет последний элемент на место удалённого'],
    'ss-storage-cost': ['новая ячейка дороже перезаписи на 17 100 — цена превращения нуля в не-ноль', 'в 9,8 раза дороже'],
    'ss-events-vs-history': ['журнал дешевле хранилища на 86 786 газа за операцию', 'но сам контракт свои события прочитать не может: журнал — для внешнего мира'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solidityStorageSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
