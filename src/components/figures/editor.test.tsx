import { render, screen } from '@testing-library/react';
import { editorSchemes } from './editor';

test('every editor scheme renders an accessible svg', () => {
  expect(Object.keys(editorSchemes)).toEqual([
    'ed-notepad-vs-editor',
    'ed-window-map',
    'ed-project-vs-file',
    'ed-secrets-boundary',
  ]);
  for (const id of Object.keys(editorSchemes)) {
    const { unmount } = render(<>{editorSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ed-notepad-vs-editor': ['блокнот', 'редактор кода', 'ожидается )', 'node.balanse(addr)'],
    'ed-window-map': ['дерево файлов', 'встроенный терминал', 'git / Version Control', 'панель проблем'],
    'ed-project-vs-file': ['открыт один файл', 'открыта папка проекта', 'нет панели git', 'package.json'],
    'ed-secrets-boundary': ['попадает в git', 'seed-фраза', '.env', '.gitignore'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{editorSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
