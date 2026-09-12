import { render, screen } from '@testing-library/react';
import { webRouterSchemes } from './webRouter';

test('every webRouter scheme renders an accessible svg', () => {
  expect(Object.keys(webRouterSchemes)).toEqual(['wro-pushstate', 'wro-routes', 'wro-refresh']);
  for (const id of Object.keys(webRouterSchemes)) {
    const { unmount } = render(<>{webRouterSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wro-pushstate': ['браузер умеет менять адрес и историю, не перезагружая страницу — на этом стоит вся навигация', 'вместе с адресом можно сохранить состояние шага: при возврате оно приходит обратно'],
    'wro-routes': ['адрес становится частью состояния: его можно послать другому человеку, и он увидит то же самое', 'обычная ссылка перезагрузила бы страницу — для переходов внутри приложения берут особую'],
    'wro-refresh': ['переходы внутри приложения работают, а обновление и ссылка из чата — нет: это ловят в последний момент', 'лечение: сервер на любой неизвестный адрес отдаёт ту же главную страницу, дальше разбирается приложение'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webRouterSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
