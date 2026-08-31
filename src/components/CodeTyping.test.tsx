import { render, screen, fireEvent } from '@testing-library/react';
import CodeTyping from './CodeTyping';
test('shows accuracy after typing full snippet', () => {
  render(<CodeTyping snippet="ab" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'ax' } });
  expect(screen.getByText(/Точность: 50%/)).toBeTruthy();
});
