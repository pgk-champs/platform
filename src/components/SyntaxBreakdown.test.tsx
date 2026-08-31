import { render, screen } from '@testing-library/react';
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
