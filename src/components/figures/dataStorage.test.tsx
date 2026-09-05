import { render, screen } from '@testing-library/react';
import { dataStorageSchemes } from './dataStorage';

test('every dataStorage scheme renders an accessible svg', () => {
  expect(Object.keys(dataStorageSchemes)).toEqual(['ds-survives', 'ds-prefs-vs-db', 'ds-flow']);
  for (const id of Object.keys(dataStorageSchemes)) {
    const { unmount } = render(<>{dataStorageSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ds-survives': ['«состояние сохраняется после перезапуска приложения» закрывается только нижней строкой', 'перезапуск — новый процесс: в памяти не остаётся ничего'],
    'ds-prefs-vs-db': ['искать и сортировать нечем — и не нужно', 'вопрос для выбора: это одно значение или набор однотипных записей?'],
    'ds-flow': ['записали в базу в одном месте — экран обновился сам, без повторного запроса', 'это тот самый Flow из главы про потоки, только источник — база, а не сеть'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{dataStorageSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
