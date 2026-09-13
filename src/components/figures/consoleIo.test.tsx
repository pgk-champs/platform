import { render, screen } from '@testing-library/react';
import { consoleIoSchemes } from './consoleIo';

test('every consoleIo scheme renders an accessible svg', () => {
  expect(Object.keys(consoleIoSchemes)).toEqual(['ci-what-comes', 'ci-parse', 'ci-layers']);
  for (const id of Object.keys(consoleIoSchemes)) {
    const { unmount } = render(<>{consoleIoSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ci-what-comes': ['«пусто» и «ввода больше нет» — разные вещи: первое это строка длиной ноль', 'только здесь бывает null'],
    'ci-parse': ['trim() перед разбором — не аккуратность, а условие работы: без него « 42 » не число', 'Int пробелов не прощает'],
    'ci-layers': ['такой класс переносится в приложение без единой правки: экран заменит собой main', 'класс, который печатает сам, придётся переписывать — печатать на экране Android нечем'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{consoleIoSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
