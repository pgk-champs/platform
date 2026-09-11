import { render, screen } from '@testing-library/react';
import { webReactSchemes } from './webReact';

test('every webReact scheme renders an accessible svg', () => {
  expect(Object.keys(webReactSchemes)).toEqual(['wr-jsx-compile', 'wr-props-flow', 'wr-react-vs-manual']);
  for (const id of Object.keys(webReactSchemes)) {
    const { unmount } = render(<>{webReactSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wr-jsx-compile': ['в браузер уезжают обычные вызовы функций: никакой разметки в готовом коде нет', 'результат вызова — обычный объект-описание, а не элемент страницы'],
    'wr-props-flow': ['потомок получает данные свойствами и не может их менять — только позвать функцию, которую ему дали', 'поэтому по нарисованному интерфейсу всегда видно, откуда взялось каждое число'],
    'wr-react-vs-manual': ['«перерисовка» в React — это пересчёт описания, а не пересоздание страницы', 'библиотека сравнивает новое описание со старым и трогает только то, что действительно изменилось'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webReactSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
