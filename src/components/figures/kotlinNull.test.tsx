import { render, screen } from '@testing-library/react';
import { kotlinNullSchemes } from './kotlinNull';

test('every kotlinNull scheme renders an accessible svg', () => {
  expect(Object.keys(kotlinNullSchemes)).toEqual([
    'kn-two-types',
    'kn-operators',
    'kn-npe-sources',
    'kn-platform',
  ]);
  for (const id of Object.keys(kotlinNullSchemes)) {
    const { unmount } = render(<>{kotlinNullSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'kn-two-types': ['внутри всегда есть текст', 'внутри текст ИЛИ пустота', 'знак ? в типе — это не «необязательно», а «здесь может лежать пустота»'],
    'kn-operators': ['вызывает, только если слева не null', 'вернёт то, что справа', 'бросит NPE'],
    'kn-npe-sources': ['lateinit до присваивания', 'все пять проверены живьём на Kotlin 2.4.10', 'компилятор убирает не сам NPE, а возможность получить его нечаянно'],
    'kn-platform': ['платформенный тип', 'компилятор молчит', 'правило простое — всё, что пришло снаружи, сразу объявляй как nullable'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{kotlinNullSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
