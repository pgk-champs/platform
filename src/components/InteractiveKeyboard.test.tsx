import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveKeyboard, { charToKey } from './InteractiveKeyboard';

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

test('nextKey pulses the expected key and the status line names its finger', () => {
  render(<InteractiveKeyboard nextKey="F" />);
  const keyF = screen.getByRole('img', { name: 'клавиша F' });
  expect(keyF.getAttribute('class')).toContain('kb-key-next');
  const status = screen.getByRole('status');
  expect(status.textContent).toBe('следующая: F — указательный левой руки');
});

test('nextKey as [base, Shift-L] also lights the shift key and notes it in the caption', () => {
  render(<InteractiveKeyboard nextKey={['A', 'Shift-L']} />);
  const keyA = screen.getByRole('img', { name: 'клавиша A' });
  expect(keyA.getAttribute('class')).toContain('kb-key-next');
  // both Shift-L and Shift-R render label "Shift" — at least one must be lit
  const shiftKeys = screen.getAllByRole('img', { name: 'клавиша Shift' });
  expect(shiftKeys.some((k) => k.getAttribute('class')?.includes('kb-key-next'))).toBe(true);
  expect(screen.getByRole('status').textContent).toContain('следующая: A — мизинец левой руки (+ Shift)');
});

test('activeKey shows a success fill for ok and a danger fill for err', () => {
  const { rerender } = render(<InteractiveKeyboard activeKey="F" activeState="ok" />);
  expect(screen.getByRole('img', { name: 'клавиша F' }).getAttribute('class')).toContain('kb-key-active-ok');

  rerender(<InteractiveKeyboard activeKey="F" activeState="err" />);
  expect(screen.getByRole('img', { name: 'клавиша F' }).getAttribute('class')).toContain('kb-key-active-err');
});

test('dim mode fades keys that are neither next nor active', () => {
  render(<InteractiveKeyboard nextKey="F" dim />);
  expect(screen.getByRole('img', { name: 'клавиша F' }).getAttribute('class')).not.toContain('kb-key-dim');
  expect(screen.getByRole('img', { name: 'клавиша A' }).getAttribute('class')).toContain('kb-key-dim');
});

test('charToKey maps letters (with case = Shift), digits, space and shifted symbols', () => {
  expect(charToKey('a')).toEqual({ id: 'A', shift: false });
  expect(charToKey('A')).toEqual({ id: 'A', shift: true });
  expect(charToKey('1')).toEqual({ id: '1', shift: false });
  expect(charToKey('!')).toEqual({ id: '1', shift: true });
  expect(charToKey(' ')).toEqual({ id: 'Space', shift: false });
  expect(charToKey(';')).toEqual({ id: ';', shift: false });
  expect(charToKey(':')).toEqual({ id: ';', shift: true });
});
