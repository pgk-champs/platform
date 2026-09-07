import { render, screen } from '@testing-library/react';
import { solLibrariesSchemes } from './solLibraries';

test('every solLibraries scheme renders an accessible svg', () => {
  expect(Object.keys(solLibrariesSchemes)).toEqual(['sl-lib-cost', 'sl-hash-collision', 'sl-pin-crack']);
  for (const id of Object.keys(solLibrariesSchemes)) {
    const { unmount } = render(<>{solLibrariesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sl-lib-cost': ['internal встраивается в байткод — разница с формулой 63 газа; external живёт отдельным контрактом', '+4 121 газа на каждый вызов'],
    'sl-hash-collision': ['правило: хешируете больше одного аргумента — берите abi.encode', 'хеши равны: true'],
    'sl-pin-crack': ['после этого чужой аккаунт открывает замок: opened = true', 'слово private прячет данные от других контрактов, а не от людей: хранилище читается снаружи целиком'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solLibrariesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
