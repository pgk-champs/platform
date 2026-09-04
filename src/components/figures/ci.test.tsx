import { render, screen } from '@testing-library/react';
import { ciSchemes } from './ci';

test('every ci scheme renders an accessible svg', () => {
  expect(Object.keys(ciSchemes)).toEqual([
    'ci-workflow-anatomy',
    'ci-checkout-empty',
    'ci-jobs-artifact',
    'ci-red-log',
  ]);
  for (const id of Object.keys(ciSchemes)) {
    const { unmount } = render(<>{ciSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ci-workflow-anatomy': ['.github/workflows/ci.yml', 'runs-on: ubuntu-latest', 'своя команда в shell'],
    'ci-checkout-empty': ['без checkout', 'ENOENT', 'package.json'],
    'ci-jobs-artifact': ['job: build', 'needs: build', 'артефакт'],
    'ci-red-log': ['npm test', 'FAIL tests/cart.test.js', 'expected 200, received 500'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{ciSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
