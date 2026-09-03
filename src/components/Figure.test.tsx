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
    'ubuntu-windows',
    'webstorm-project-tree',
    'branch-tree',
    'rwx-bits',
    'memory-boxes',
    'lambda-box',
    'collections-shelf',
    'state-flow',
    'error-anatomy',
    'android-studio-panels',
    'compose-preview',
    'dp-vs-sp',
    'aar-vs-jar',
  ]);
  for (const id of SCHEME_IDS) {
    const { unmount } = render(<Figure scheme={id} caption={`схема ${id}`} />);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('новые схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'branch-tree': ['master', 'feature'],
    'rwx-bits': ['Владелец', 'Группа', 'Остальные'],
    'memory-boxes': ['val x', 'var y'],
    'lambda-box': ['square(x)', 'x -> x * x'],
    'collections-shelf': ['List', 'Map', 'Set'],
    'state-flow': ['Event', 'State', 'Recomposition'],
    'error-anatomy': ['источник', 'виновник', 'суть'],
    'android-studio-panels': ['Project', 'Редактор', 'Gradle', 'Terminal', 'Logcat'],
    'compose-preview': ['GreetingPreview', '@Preview'],
    'dp-vs-sp': ['16.dp', '16.sp'],
    'aar-vs-jar': ['.aar', '.jar'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<Figure scheme={id} caption={`схема ${id}`} />);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
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
