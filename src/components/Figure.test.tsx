import { render, screen } from '@testing-library/react';
import Figure, { SCHEME_IDS } from './Figure';

test('renders caption and source line', () => {
  render(
    <Figure
      scheme="git-three-zones"
      caption="Три зоны Git"
      source="Фото: Pexels — свободная лицензия"
    />,
  );
  expect(screen.getByText(/Три зоны Git/)).toBeTruthy();
  expect(screen.getByText('Фото: Pexels — свободная лицензия')).toBeTruthy();
});

test('every scheme renders an svg with the caption as accessible name', () => {
  expect(SCHEME_IDS).toEqual([
    'git-three-zones',
    'git-local-remote',
    'linux-fs-tree',
    'blockchain-chain',
    'compose-layout',
    'ui-kit-modules',
  ]);
  for (const id of SCHEME_IDS) {
    const { unmount } = render(<Figure scheme={id} caption={`схема ${id}`} />);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('renders a photo with alt and lazy loading', () => {
  render(
    <Figure
      img="/img/photos/typing-keyboard.jpg"
      alt="Руки на клавиатуре"
      caption="Слепая печать"
    />,
  );
  const img = screen.getByAltText('Руки на клавиатуре') as HTMLImageElement;
  expect(img.getAttribute('src')).toBe('/img/photos/typing-keyboard.jpg');
  expect(img.getAttribute('loading')).toBe('lazy');
});

test('unknown scheme renders nothing but keeps the caption', () => {
  const { container } = render(<Figure scheme="nope" caption="подпись" />);
  expect(container.querySelector('.fig-media svg')).toBeNull();
  expect(screen.getByText('подпись')).toBeTruthy();
});
