import { render, screen } from '@testing-library/react';
import { finalSchemes } from './final';

test('every final scheme renders an accessible svg', () => {
  expect(Object.keys(finalSchemes)).toEqual([
    'final-day-timeline',
    'final-error-anatomy',
    'final-ssh-clone-push',
    'final-hotkey-map',
  ]);
  for (const id of Object.keys(finalSchemes)) {
    const { unmount } = render(<>{finalSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'final-day-timeline': ['git pull', 'ssh на сервер', 'клавиатура'],
    'final-error-anatomy': ['Permission denied', '(publickey)', 'remote repository'],
    'final-ssh-clone-push': ['ssh-keygen', 'id_ed25519.pub', 'git clone git@…'],
    'final-hotkey-map': ['Ctrl+R', 'найти команду в истории', 'Ctrl+P'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{finalSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
