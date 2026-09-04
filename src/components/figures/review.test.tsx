import { render, screen } from '@testing-library/react';
import { reviewSchemes } from './review';

test('every review scheme renders an accessible svg', () => {
  expect(Object.keys(reviewSchemes)).toEqual([
    'commit-atom',
    'pr-anatomy',
    'main-protection',
    'release-pipeline',
  ]);
  for (const id of Object.keys(reviewSchemes)) {
    const { unmount } = render(<>{reviewSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'commit-atom': ['фикс', 'git add -p', 'fix(parser): пустая строка'],
    'pr-anatomy': ['Что', 'Зачем', 'Как проверить', 'Closes #12'],
    'main-protection': ['git push main', 'required checks', 'main'],
    'release-pipeline': ['CHANGELOG.md', 'Added', 'Fixed', '2.0.0', 'git tag -a v2.0.0'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{reviewSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
