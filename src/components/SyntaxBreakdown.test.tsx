import { render, screen, fireEvent } from '@testing-library/react';
import SyntaxBreakdown from './SyntaxBreakdown';

const parts = [
  { text: 'val', label: 'ключевое слово', note: 'неизменяемая переменная' },
  { text: ' x', label: 'имя', note: 'идентификатор' },
];

test('renders each part with its role', () => {
  render(<SyntaxBreakdown parts={parts} />);
  expect(screen.getByText('val')).toHaveAttribute('aria-label', 'ключевое слово');
  expect(screen.getByLabelText('имя')).toBeTruthy();
});

test('click opens the toggletip (not hover-only) and hover alone does nothing', () => {
  render(<SyntaxBreakdown parts={parts} />);
  fireEvent.mouseEnter(screen.getByLabelText('ключевое слово'));
  expect(screen.queryByText('неизменяемая переменная', { exact: false })).toBeNull();
  fireEvent.click(screen.getByLabelText('ключевое слово'));
  expect(screen.getByRole('status')).toHaveTextContent('ключевое слово');
  expect(screen.getByRole('status')).toHaveTextContent('неизменяемая переменная');
});

test('clicking the same part again closes the toggletip (dismissible)', () => {
  render(<SyntaxBreakdown parts={parts} />);
  const trigger = screen.getByLabelText('ключевое слово');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('status')).toHaveTextContent('Нажми на часть выражения');
});

test('Escape closes the open toggletip', () => {
  render(<SyntaxBreakdown parts={parts} />);
  fireEvent.click(screen.getByLabelText('имя'));
  expect(screen.getByRole('status')).toHaveTextContent('идентификатор');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('status')).toHaveTextContent('Нажми на часть выражения');
});

test('clicking outside closes the open toggletip (persists until dismissed, not until mouse leaves)', () => {
  render(
    <div>
      <SyntaxBreakdown parts={parts} />
      <button type="button">снаружи</button>
    </div>,
  );
  fireEvent.click(screen.getByLabelText('имя'));
  expect(screen.getByRole('status')).toHaveTextContent('идентификатор');
  fireEvent.mouseDown(screen.getByText('снаружи'));
  expect(screen.getByRole('status')).toHaveTextContent('Нажми на часть выражения');
});
