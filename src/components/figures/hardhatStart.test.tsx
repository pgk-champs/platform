import { render, screen } from '@testing-library/react';
import { hardhatStartSchemes } from './hardhatStart';

test('every hardhatStart scheme renders an accessible svg', () => {
  expect(Object.keys(hardhatStartSchemes)).toEqual(['hs-where-is-command', 'hs-project-tree', 'hs-lock-vs-range']);
  for (const id of Object.keys(hardhatStartSchemes)) {
    const { unmount } = render(<>{hardhatStartSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'hs-where-is-command': ['npx ищет команду в node_modules/.bin текущей папки, потом выше — и только потом в сети', 'поэтому версия инструмента — свойство папки, а не компьютера: два проекта рядом живут на разных'],
    'hs-project-tree': ['всё, что человек написал, весит 204 КБ; всё, что скачано, — 188 МБ'],
    'hs-lock-vs-range': ['на чужой машине проект ставят через npm ci: он не пересобирает замок и не подсунет другую версию', 'эта ошибка означает, что кто-то правил список зависимостей руками и не обновил замок'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{hardhatStartSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
