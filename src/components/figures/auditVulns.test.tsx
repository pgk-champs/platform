import { render, screen } from '@testing-library/react';
import { auditVulnsSchemes } from './auditVulns';

test('every auditVulns scheme renders an accessible svg', () => {
  expect(Object.keys(auditVulnsSchemes)).toEqual(['av-reentrancy', 'av-cei', 'av-storage']);
  for (const id of Object.keys(auditVulnsSchemes)) {
    const { unmount } = render(<>{auditVulnsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'av-reentrancy': ['на счету нападающего оказалось 5 ETH при взносе 1: четыре эфира — чужие вклады', 'исправленная версия того же банка сорвала нападение на первом же повторном входе'],
    'av-cei': ['порядок один и тот же всегда: сначала проверки, потом запись в хранилище, и только потом вызовы наружу', 'любой перевод эфира — это вызов чужого кода: у получателя может быть своя функция приёма'],
    'av-storage': ['хранилище контракта читает кто угодно одним запросом к узлу: слово private прячет данные только от других контрактов', 'секрета в сети быть не может; хранят только хеш, а само значение раскрывают, когда оно уже не тайна'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{auditVulnsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
