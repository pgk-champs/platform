import { render, screen } from '@testing-library/react';
import { store } from '../lib/store';
import GameBadge from './GameBadge';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('в шапке рисует плашку со счётом достижений', () => {
  const { container } = render(<GameBadge />);
  const link = container.querySelector('a.gb');
  expect(link).toBeTruthy();
  expect(link).toHaveAttribute('href', '/achievements');
  expect(container.querySelector('.gb-ach')?.textContent).toContain('43');
});

test('огонёк серии не рисуется, пока серии нет', () => {
  const { container } = render(<GameBadge />);
  expect(container.querySelector('.gb-streak')).toBeNull();
});

test('в бургере это пункт списка, а не плашка', () => {
  // Docusaurus рендерит пункт навбара второй раз внутри мобильного сайдбара
  // и передаёт mobile. Плашка там неуместна: вокруг список ссылок.
  const { container } = render(<GameBadge mobile />);
  expect(container.querySelector('a.gb')).toBeNull();
  const item = container.querySelector('li.menu__list-item a.menu__link');
  expect(item).toBeTruthy();
  expect(item).toHaveAttribute('href', '/achievements');
  expect(screen.getByText(/Достижения 0\/43/)).toBeTruthy();
});

test('переход в бургере закрывает сайдбар', () => {
  const onClick = vi.fn();
  const { container } = render(<GameBadge mobile onClick={onClick} />);
  (container.querySelector('a.menu__link') as HTMLElement).click();
  expect(onClick).toHaveBeenCalled();
});
