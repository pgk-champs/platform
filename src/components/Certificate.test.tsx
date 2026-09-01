import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import Certificate from './Certificate';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('shows progress until every chapter is passed', () => {
  render(<Certificate track="мобилка" total={5} passed={3} />);
  expect(screen.getByText(/Пройдено 3 из 5 глав до сертификата/)).toBeTruthy();
  expect(screen.queryByText('Получить сертификат')).toBeNull();
});

test('all chapters passed: button opens the certificate dialog', () => {
  render(<Certificate track="мобилка" total={5} passed={5} />);
  fireEvent.click(screen.getByText('Получить сертификат'));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByText('Скачать PNG')).toBeTruthy();
});

test('name input is remembered in store.prefs and preloaded next time', () => {
  const { unmount } = render(<Certificate track="мобилка" total={2} passed={2} />);
  fireEvent.click(screen.getByText('Получить сертификат'));
  fireEvent.change(screen.getByPlaceholderText('Иван Иванов'), { target: { value: 'Олег К.' } });
  expect(store.prefs.getName()).toBe('Олег К.');
  unmount();

  render(<Certificate track="мобилка" total={2} passed={2} />);
  fireEvent.click(screen.getByText('Получить сертификат'));
  expect((screen.getByPlaceholderText('Иван Иванов') as HTMLInputElement).value).toBe('Олег К.');
});

test('close button hides the dialog', () => {
  render(<Certificate track="мобилка" total={1} passed={1} />);
  fireEvent.click(screen.getByText('Получить сертификат'));
  fireEvent.click(screen.getByLabelText('Закрыть'));
  expect(screen.queryByRole('dialog')).toBeNull();
});
