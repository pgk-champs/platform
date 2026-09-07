import { render, screen } from '@testing-library/react';
import { proxyUpgradeSchemes } from './proxyUpgrade';

test('every proxyUpgrade scheme renders an accessible svg', () => {
  expect(Object.keys(proxyUpgradeSchemes)).toEqual(['pu-call-vs-delegate', 'pu-proxy-upgrade', 'pu-storage-shift']);
  for (const id of Object.keys(proxyUpgradeSchemes)) {
    const { unmount } = render(<>{proxyUpgradeSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'pu-call-vs-delegate': ['delegatecall выполняет чужой код в своём хранилище — и эфир при этом никуда не уходит', 'на этом и стоит прокси: код меняется, память остаётся'],
    'pu-proxy-upgrade': ['адрес прокси до и после обновления один и тот же; ставка и вклады пережили подмену кода', 'у самой реализации владелец нулевой, а ставка 0: её конструктор в память прокси не попадает'],
    'pu-storage-shift': ['у новой версии поля объявлены в другом порядке — адрес читается как число, число как адрес', 'новые поля добавляют только в конец: вставка в середину сдвигает всё, что за ней'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{proxyUpgradeSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
