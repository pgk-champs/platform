import { render, screen } from '@testing-library/react';
import { repoAnatomySchemes } from './repoAnatomy';

test('every repo-anatomy scheme renders an accessible svg', () => {
  expect(Object.keys(repoAnatomySchemes)).toEqual([
    'repo-first-impression',
    'readme-skeleton',
    'gitignore-already-tracked',
    'repo-layout-tree',
  ]);
  for (const id of Object.keys(repoAnatomySchemes)) {
    const { unmount } = render(<>{repoAnatomySchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'repo-first-impression': ['свалка', 'собранный корень', 'README.md', '.gitignore'],
    'readme-skeleton': ['Как запустить', 'Стек и структура', 'Скриншот или пример вывода'],
    'gitignore-already-tracked': ['индекс git', 'история коммитов', 'rm --cached'],
    'repo-layout-tree': ['src/', 'tests/', 'docs/', 'LICENSE'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{repoAnatomySchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
