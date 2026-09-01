import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveKeyboard from './InteractiveKeyboard';

test('renders every ANSI key with a base accessible label, no legend by default', () => {
  render(<InteractiveKeyboard />);
  expect(screen.getByRole('img', { name: 'клавиша F' })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'клавиша J' })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'клавиша Пробел' })).toBeTruthy();
  expect(screen.queryByText('мизинец левой руки')).toBeNull();
});

test('zones mode shows the finger legend and a hover/focus tooltip naming the finger', () => {
  render(<InteractiveKeyboard zones />);
  // legend lists all 8 finger zones
  expect(screen.getByText('мизинец левой руки')).toBeTruthy();
  expect(screen.getByText('мизинец правой руки')).toBeTruthy();
  expect(screen.getByText('указательный левой руки')).toBeTruthy();
  expect(screen.getByText('указательный правой руки')).toBeTruthy();

  const tooltip = screen.getByRole('status');
  const keyF = screen.getByRole('img', { name: /клавиша F/ });
  fireEvent.focus(keyF);
  expect(tooltip.textContent).toBe('клавиша F — палец: указательный левой руки');

  fireEvent.blur(keyF);
  expect(tooltip.textContent?.trim()).toBe('');

  const keyJ = screen.getByRole('img', { name: /клавиша J/ });
  fireEvent.mouseEnter(keyJ);
  expect(tooltip.textContent).toBe('клавиша J — палец: указательный правой руки');
  fireEvent.mouseLeave(keyJ);
  expect(tooltip.textContent?.trim()).toBe('');
});

test('highlight mode marks only the requested keys, case-insensitively', () => {
  const { container } = render(<InteractiveKeyboard highlight={['f', 'J']} />);
  const keyF = screen.getByRole('img', { name: 'клавиша F' });
  const keyJ = screen.getByRole('img', { name: 'клавиша J' });
  const keyA = screen.getByRole('img', { name: 'клавиша A' });
  expect(keyF.getAttribute('class')).toContain('kb-key-highlight');
  expect(keyJ.getAttribute('class')).toContain('kb-key-highlight');
  expect(keyA.getAttribute('class')).not.toContain('kb-key-highlight');
  // sanity: nothing else in the doc accidentally picked up the class
  expect(container.querySelectorAll('.kb-key-highlight')).toHaveLength(2);
});

test('symbols mode shows the shifted character above the base digit', () => {
  render(<InteractiveKeyboard symbols />);
  expect(screen.getByText('!')).toBeTruthy();
  expect(screen.getByText('@')).toBeTruthy();
  // digit '1' key still shows its base label too
  expect(screen.getByText('1')).toBeTruthy();
});

test('symbols are absent when the prop is off', () => {
  render(<InteractiveKeyboard />);
  expect(screen.queryByText('!')).toBeNull();
});
