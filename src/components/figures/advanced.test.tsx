import { render, screen } from '@testing-library/react';
import { advancedSchemes } from './advanced';

test('every advanced scheme renders an accessible svg', () => {
  expect(Object.keys(advancedSchemes)).toEqual([
    'merge-vs-rebase',
    'rebase-copies',
    'interactive-plan',
    'reflog-safety',
    'grep-line-scan',
    'regex-anatomy',
    'anchor-position',
    'char-class',
    'ssh-handshake',
    'ssh-key-locations',
    'ssh-agent-flow',
    'ssh-config-alias',
  ]);
  for (const id of Object.keys(advancedSchemes)) {
    const { unmount } = render(<>{advancedSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'merge-vs-rebase': ['merge', 'rebase', 'merge-коммит, два родителя'],
    'rebase-copies': ['было: main', 'после git rebase main'],
    'interactive-plan': ['pick a1f9c3d', 'fixup 4e21b77', 'добавил парсер'],
    'reflog-safety': ['rebase (start)', 'moving from main to feature'],
    'grep-line-scan': ['app.log', 'error: timeout'],
    'regex-anatomy': ['якорь', 'литерал'],
    'anchor-position': ['From: Alice', 'task done'],
    'char-class': ['любой один символ', 'буквально точка'],
    'ssh-handshake': ['твоя машина', 'сервер', 'authorized_keys'],
    'ssh-key-locations': ['id_ed25519', 'id_ed25519.pub', 'authorized_keys'],
    'ssh-agent-flow': ['ssh-add', 'агент держит ключ'],
    'ssh-config-alias': ['Host champ', 'Host github.com', 'IdentityFile'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{advancedSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
