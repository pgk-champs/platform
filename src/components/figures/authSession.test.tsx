import { render, screen } from '@testing-library/react';
import { authSessionSchemes } from './authSession';

test('every authSession scheme renders an accessible svg', () => {
  expect(Object.keys(authSessionSchemes)).toEqual(['as-what-is-login', 'as-start-screen', 'as-refresh-lock']);
  for (const id of Object.keys(authSessionSchemes)) {
    const { unmount } = render(<>{authSessionSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'as-what-is-login': ['пароль на устройстве не хранят никогда — только токен, который протухает и отзывается', 'каждый следующий запрос несёт токен в заголовке — так сервер узнаёт, кто пришёл'],
    'as-start-screen': ['токен есть, но протух — это «токена нет»: иначе главный экран откроется и первый же запрос вернёт 401', 'третий исход нужен, потому что чтение с диска асинхронно — доля секунды, но её видно'],
    'as-refresh-lock': ['под замком: первый обновляет, остальные ждут его результата', 'старый refresh-токен одноразовый: второй вызов с ним — уже отказ, и пользователя выкидывает на ровном месте'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{authSessionSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
