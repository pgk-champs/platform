import { render, screen } from '@testing-library/react';
import { codeBasicsSchemes } from './codeBasics';

test('every codeBasics scheme renders an accessible svg', () => {
  expect(Object.keys(codeBasicsSchemes)).toEqual([
    'cb-tokens',
    'cb-dot',
    'cb-brackets',
    'cb-error-message',
  ]);
  for (const id of Object.keys(codeBasicsSchemes)) {
    const { unmount } = render(<>{codeBasicsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'cb-tokens': ['ключевое слово', 'score', 'литерал'],
    'cb-dot': ['player.name', 'player.attack()', 'свойство'],
    'cb-brackets': ['println("привет")', 'фигурные — блок кода', 'names[0]'],
    'cb-error-message': ['Main.kt:7:24', 'чего компилятору не хватило', 'на строку ВЫШЕ указанной'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{codeBasicsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
