import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import VesselStrip from './VesselStrip';

const chapters = Array.from({ length: 12 }, (_, i) => ({
  id: 'ch' + i,
  title: 'Глава ' + i,
  path: 'mobile/ch' + i + '.mdx',
}));

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('в окне ровно пять сосудов', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  expect(screen.getAllByTestId('vessel')).toHaveLength(5);
});

test('окно встаёт вокруг текущей главы', () => {
  render(<VesselStrip chapters={chapters} currentId="ch6" />);
  const caps = screen.getAllByTestId('cap').map((n) => n.textContent);
  expect(caps).toEqual(['Глава 4', 'Глава 5', 'Глава 6', 'Глава 7', 'Глава 8']);
});

test('у начала окно не уезжает в минус', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  expect(screen.getAllByTestId('cap')[0].textContent).toBe('Глава 0');
});

test('у конца окно упирается, а не вылезает за список', () => {
  render(<VesselStrip chapters={chapters} currentId="ch11" />);
  const caps = screen.getAllByTestId('cap').map((n) => n.textContent);
  expect(caps).toEqual(['Глава 7', 'Глава 8', 'Глава 9', 'Глава 10', 'Глава 11']);
});

test('листание вперёд сдвигает окно и гасит стрелку в конце', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  const next = screen.getByLabelText('Следующие главы');
  fireEvent.click(next);
  expect(screen.getAllByTestId('cap')[0].textContent).toBe('Глава 5');
  fireEvent.click(next);
  expect(screen.getAllByTestId('cap')[4].textContent).toBe('Глава 11');
  expect(next).toBeDisabled();
});

test('рамка видоискателя занимает долю окна от всего трека', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  expect(screen.getByTestId('view').style.width).toBe((5 / 12) * 100 + '%');
});

test('сосуд ссылается на главу без расширения файла', () => {
  render(<VesselStrip chapters={chapters} currentId="ch0" />);
  expect(screen.getAllByTestId('vessel')[0]).toHaveAttribute('href', '/docs/mobile/ch0');
});

test('глав меньше пяти — показываются все, стрелки погашены', () => {
  render(<VesselStrip chapters={chapters.slice(0, 3)} currentId="ch1" />);
  expect(screen.getAllByTestId('vessel')).toHaveLength(3);
  expect(screen.getByLabelText('Следующие главы')).toBeDisabled();
  expect(screen.getByLabelText('Предыдущие главы')).toBeDisabled();
});
