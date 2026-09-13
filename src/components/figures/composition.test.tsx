import { render, screen } from '@testing-library/react';
import { compositionSchemes } from './composition';

test('every composition scheme renders an accessible svg', () => {
  expect(Object.keys(compositionSchemes)).toEqual(['cmp-surface', 'cmp-copy', 'cmp-ownership']);
  for (const id of Object.keys(compositionSchemes)) {
    const { unmount } = render(<>{compositionSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'cmp-surface': ['наследование — это «я такой же»; композиция — «у меня внутри есть»', 'корзину можно очистить мимо вашего кода'],
    'cmp-copy': ['правка «копии» задела оригинал — в приложении это «изменил один товар, изменились все»', 'лечится неизменяемостью вложенного: val вместо var, List вместо MutableList'],
    'cmp-ownership': ['второй способ — начало внедрения зависимостей: объект не добывает себе части сам', 'но тогда за «каждому своё» отвечает тот, кто создаёт — а не сам класс'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{compositionSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
