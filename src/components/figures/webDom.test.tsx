import { render, screen } from '@testing-library/react';
import { webDomSchemes } from './webDom';

test('every webDom scheme renders an accessible svg', () => {
  expect(Object.keys(webDomSchemes)).toEqual(['wd-text-vs-html', 'wd-delegation', 'wd-rerender-cost']);
  for (const id of Object.keys(webDomSchemes)) {
    const { unmount } = render(<>{webDomSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wd-text-vs-html': ['всё, что пришло от пользователя или из сети, вставляют текстом — это не осторожность, а правило', 'адрес кошелька, имя, комментарий: любое из этого может оказаться разметкой с кодом внутри'],
    'wd-delegation': ['один обработчик на контейнере ловит нажатия и на тех кнопках, которых в момент навешивания не было', 'кого именно нажали — видно из события; так делают списки, где строки появляются и исчезают'],
    'wd-rerender-cost': ['делать точечно — быстро и безопасно, но вручную это десятки мест, которые надо не забыть обновить'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webDomSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
