import { render, screen } from '@testing-library/react';
import { dappFullSchemes } from './dappFull';

test('every dappFull scheme renders an accessible svg', () => {
  expect(Object.keys(dappFullSchemes)).toEqual(['dap-read-write', 'dap-lifecycle', 'dap-events']);
  for (const id of Object.keys(dappFullSchemes)) {
    const { unmount } = render(<>{dappFullSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'dap-read-write': ['интерфейс показывает данные сразу, до подключения кошелька: читать может кто угодно', 'кнопка «подключить» нужна ровно тогда, когда пользователь собрался что-то изменить'],
    'dap-lifecycle': ['оценка газа оказалась чуть больше факта: 68 332 против 67 481 — запас закладывается нарочно'],
    'dap-events': ['список операций собирают из истории при загрузке и дополняют подпиской по ходу работы', 'подписка по обычному соединению — это опрос узла, а не push: узел спрашивают раз в несколько секунд'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{dappFullSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
