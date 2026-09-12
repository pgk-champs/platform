import { render, screen } from '@testing-library/react';
import { auditToolsSchemes } from './auditTools';

test('every auditTools scheme renders an accessible svg', () => {
  expect(Object.keys(auditToolsSchemes)).toEqual(['at-pipeline', 'at-slither', 'at-noise']);
  for (const id of Object.keys(auditToolsSchemes)) {
    const { unmount } = render(<>{auditToolsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'at-pipeline': ['первые три знают, как выглядят типовые ошибки; последнее знает, чего вы хотели', 'ни одно из сит не заменяет чтение кода глазами'],
    'at-slither': ['анализатор ищет схемы, а не замысел: пропущенная проверка прав для него — обычный код'],
    'at-noise': ['инструмент, который выдаёт 83 предупреждения на четыре файла, быстро становится фоном', 'настроить его — часть работы, а не признак лени'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{auditToolsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
