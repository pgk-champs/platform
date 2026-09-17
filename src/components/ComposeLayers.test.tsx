import { render, screen } from '@testing-library/react';
import ComposeLayers from './ComposeLayers';

test('слои видны и подписаны без всякого движения', () => {
  const { container } = render(<ComposeLayers />);
  expect(container.querySelectorAll('.cl-layer')).toHaveLength(6);
  expect(screen.getByText('LazyColumn')).toBeTruthy();
});

test('ничего не спрятано за opacity:0 в ожидании прокрутки', () => {
  const { container } = render(<ComposeLayers />);
  container.querySelectorAll('.cl-layer').forEach((el) => {
    expect((el as HTMLElement).style.opacity).not.toBe('0');
  });
});

test('братья лежат на одной глубине, а не цепочкой', () => {
  // Главная проверка правдивости: TopAppBar и LazyColumn — оба дети Scaffold.
  // Линейная стопка читалась бы как «TopAppBar, внутри него LazyColumn».
  const { container } = render(<ComposeLayers />);
  const depth = (id: string) =>
    (container.querySelector(`[data-layer="${id}"]`) as HTMLElement).style.getPropertyValue('--d');
  expect(depth('topbar')).toBe(depth('lazy'));
  expect(depth('scaffold')).toBe('0');
  expect(Number(depth('card'))).toBeGreaterThan(Number(depth('lazy')));
  expect(Number(depth('text'))).toBeGreaterThan(Number(depth('row')));
});

test('дерево подписей повторяет ту же вложенность', () => {
  const { container } = render(<ComposeLayers />);
  const items = [...container.querySelectorAll('.cl-tree-item')] as HTMLElement[];
  expect(items).toHaveLength(6);
  const d = items.map((i) => i.style.getPropertyValue('--d'));
  expect(d).toEqual(['0', '1', '1', '2', '3', '4']);
});

test('каркас и собранный экран берут одну геометрию', () => {
  // Карточки на каркасе Card обязаны стоять там же, где на собранном экране:
  // проценты заданы один раз и переиспользуются, разъехаться не могут.
  const { container } = render(<ComposeLayers />);
  const solid = container.querySelector('[data-layer="scaffold"]')!;
  const frame = container.querySelector('[data-layer="card"]')!;
  const tops = (root: Element) =>
    [...root.querySelectorAll('.cl-card')].map((e) => (e as HTMLElement).style.top);
  expect(tops(frame)).toEqual(tops(solid));
  expect(tops(frame).length).toBe(3);
});
