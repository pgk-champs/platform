import { render, screen } from '@testing-library/react';
import { lazyListsSchemes } from './lazyLists';

test('every lazyLists scheme renders an accessible svg', () => {
  expect(Object.keys(lazyListsSchemes)).toEqual([
    'll-eager-vs-lazy',
    'll-dsl-scope',
    'll-key-shift',
  ]);
  for (const id of Object.keys(lazyListsSchemes)) {
    const { unmount } = render(<>{lazyListsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'll-eager-vs-lazy': [
      'все 10 000 объектов созданы до первого кадра',
      'остальные 9 990 ещё не существуют — появятся при прокрутке',
      'разница не в скорости отрисовки, а в том, сколько объектов вообще создано',
    ],
    'll-dsl-scope': [
      'регистрирует 1 элемент',
      'регистрирует N элементов',
      'поэтому обычный for внутри работать не будет: он ничего не регистрирует',
    ],
    'll-key-shift': [
      'без key элемент опознаётся по номеру места, а место при удалении занимает сосед',
      'key = id привязывает состояние к самим данным, а не к позиции в списке',
      'то же касается анимации перестановки: без key список «моргает» вместо переезда',
    ],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{lazyListsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
