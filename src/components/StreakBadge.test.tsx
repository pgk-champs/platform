import { render, screen } from '@testing-library/react';
import StreakBadge, { PIPS } from './StreakBadge';

test('нулевая серия: приглашение начать, ни одной зажжённой ячейки', () => {
  const { container } = render(<StreakBadge streak={0} multiplier={1} />);
  expect(screen.getByText('Начни серию')).toBeTruthy();
  expect(container.querySelectorAll('.st-pip.on')).toHaveLength(0);
  expect(container.querySelectorAll('.st-pip')).toHaveLength(PIPS);
});

test('серия короче недели: зажжено ровно столько ячеек', () => {
  const { container } = render(<StreakBadge streak={3} multiplier={1} />);
  expect(container.querySelectorAll('.st-pip.on')).toHaveLength(3);
});

test('серия длиннее недели: все ячейки зажжены, число настоящее', () => {
  const { container } = render(<StreakBadge streak={12} multiplier={1} />);
  expect(container.querySelectorAll('.st-pip.on')).toHaveLength(PIPS);
  expect(screen.getByText('12')).toBeTruthy();
});

test('склонение по числу, а не «дней» на всё подряд', () => {
  const day = (n: number) => {
    const { unmount } = render(<StreakBadge streak={n} multiplier={1} />);
    const text = screen.getByTestId('streak-word').textContent;
    unmount();
    return text;
  };
  expect(day(1)).toBe('день подряд');
  expect(day(2)).toBe('дня подряд');
  expect(day(5)).toBe('дней подряд');
  expect(day(11)).toBe('дней подряд');
  expect(day(21)).toBe('день подряд');
});

test('множитель показывается только когда он есть', () => {
  const { rerender } = render(<StreakBadge streak={5} multiplier={1} />);
  expect(screen.queryByTitle(/Бонус к XP/)).toBeNull();
  rerender(<StreakBadge streak={5} multiplier={1.25} />);
  expect(screen.getByText('×1.25 XP')).toBeTruthy();
});

test('хвостовые нули у множителя не показываются', () => {
  render(<StreakBadge streak={5} multiplier={1.5} />);
  expect(screen.getByText('×1.5 XP')).toBeTruthy();
});
