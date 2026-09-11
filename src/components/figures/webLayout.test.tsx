import { render, screen } from '@testing-library/react';
import { webLayoutSchemes } from './webLayout';

test('every webLayout scheme renders an accessible svg', () => {
  expect(Object.keys(webLayoutSchemes)).toEqual(['wl-flow-vs-flex', 'wl-justify', 'wl-autofit']);
  for (const id of Object.keys(webLayoutSchemes)) {
    const { unmount } = render(<>{webLayoutSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wl-flow-vs-flex': ['блочные элементы по своей природе занимают всю ширину; flex-контейнер отменяет это для своих потомков'],
    'wl-justify': ['числа — настоящие отступы слева, снятые с живой страницы', '«между» прижимает крайние к краям, «поровну» даёт одинаковые промежутки, включая внешние'],
    'wl-autofit': ['сетка сама решает, сколько колонок поместится: ни одного медиазапроса при этом не написано'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webLayoutSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
