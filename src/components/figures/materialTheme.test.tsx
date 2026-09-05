import { render, screen } from '@testing-library/react';
import { materialThemeSchemes } from './materialTheme';

test('every materialTheme scheme renders an accessible svg', () => {
  expect(Object.keys(materialThemeSchemes)).toEqual([
    'mt-three-files',
    'mt-roles',
    'mt-provide',
  ]);
  for (const id of Object.keys(materialThemeSchemes)) {
    const { unmount } = render(<>{materialThemeSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'mt-three-files': [
      'собирает три части в MaterialTheme',
      'Android Studio создала их в первый день — и до этой главы они стояли без дела',
    ],
    'mt-roles': [
      'в тёмной теме останется белым — и выбьется из экрана',
      'значение подставит тема, разметка не меняется',
      'поэтому цвет в Material называется ролью, а не именем: не «фиолетовый», а «главный»',
    ],
    'mt-provide': [
      'ничего про тему не знает и не принимает',
      'значение достаётся из окружения в момент отрисовки — как переменная среды',
      'вложенная тема переопределяет её только внутри своего блока',
    ],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{materialThemeSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
