import { render, screen, fireEvent } from '@testing-library/react';
import Fold from './Fold';

test('renders title and keeps content hidden until expanded', () => {
  render(<Fold title="Заголовок">Скрытый текст</Fold>);
  expect(screen.getByText('Заголовок')).toBeTruthy();
  expect(screen.getByText('Скрытый текст')).not.toBeVisible();
});

test('reveals content on click', () => {
  render(<Fold title="Заголовок">Скрытый текст</Fold>);
  fireEvent.click(screen.getByText('Заголовок'));
  expect(screen.getByText('Скрытый текст')).toBeVisible();
});
