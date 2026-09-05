import { render, screen } from '@testing-library/react';
import { networkErrorsSchemes } from './networkErrors';

test('every networkErrors scheme renders an accessible svg', () => {
  expect(Object.keys(networkErrorsSchemes)).toEqual(['ne-three-kinds', 'ne-ui-states', 'ne-retry']);
  for (const id of Object.keys(networkErrorsSchemes)) {
    const { unmount } = render(<>{networkErrorsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ne-three-kinds': ['один catch на всё выдаёт одинаковое «Ошибка загрузки» во всех трёх случаях', 'а пользователю нужно знать, чинить ли ему связь, ждать или входить заново'],
    'ne-ui-states': ['пустой список и ошибка — разные экраны: «ничего не найдено» против «не удалось загрузить»', '«отобразить экран, указанный в макете» — отдельный критерий в каждом спринте'],
    'ne-retry': ['сервер и так лежит — добиваем его пачкой запросов', 'повторяют только то, что имеет смысл повторять: 401 повтором не лечится'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{networkErrorsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
