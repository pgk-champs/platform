import { render, screen, fireEvent } from '@testing-library/react';
import SelfCheck from './SelfCheck';

const questions = [
  {
    q: 'Сколько будет 2 + 2?',
    options: ['3', '4', '5'],
    correct: 1,
    why: 'Базовая арифметика.',
  },
  {
    q: 'Столица России?',
    options: ['Киев', 'Москва', 'Минск'],
    correct: 1,
  },
];

test('renders questions and options', () => {
  render(<SelfCheck questions={questions} />);
  expect(screen.getByText('Сколько будет 2 + 2?')).toBeTruthy();
  expect(screen.getByText('Столица России?')).toBeTruthy();
  expect(screen.getByText('3')).toBeTruthy();
  expect(screen.getByText('4')).toBeTruthy();
  expect(screen.getByText('Москва')).toBeTruthy();
});

test('correct answer shows "Верно!" with why and locks options', () => {
  render(<SelfCheck questions={questions} />);
  const right = screen.getByText('4');
  fireEvent.click(right);
  expect(right.className).toContain('sc-right');
  expect(screen.getByText('Верно!')).toBeTruthy();
  expect(screen.getByText('Базовая арифметика.')).toBeTruthy();
  expect(screen.getByText('3')).toBeDisabled();
  expect(right).toBeDisabled();
});

test('wrong answer shows hint and allows clicking correct one after', () => {
  render(<SelfCheck questions={questions} />);
  const wrong = screen.getByText('3');
  fireEvent.click(wrong);
  expect(wrong.className).toContain('sc-wrong');
  expect(screen.getByText('Не совсем — подумай ещё')).toBeTruthy();
  expect(screen.getByText('4')).not.toBeDisabled();

  const right = screen.getByText('4');
  fireEvent.click(right);
  expect(right.className).toContain('sc-right');
  expect(screen.getByText('Верно!')).toBeTruthy();
});

test('counter updates as questions get answered correctly', () => {
  render(<SelfCheck questions={questions} />);
  expect(screen.getByText('Отвечено верно: 0 из 2')).toBeTruthy();

  fireEvent.click(screen.getByText('4'));
  expect(screen.getByText('Отвечено верно: 1 из 2')).toBeTruthy();

  fireEvent.click(screen.getByText('Москва'));
  expect(screen.getByText('Отвечено верно: 2 из 2')).toBeTruthy();
});

test('empty questions renders without crashing', () => {
  render(<SelfCheck questions={[]} />);
  expect(screen.getByText('Отвечено верно: 0 из 0')).toBeTruthy();
});
