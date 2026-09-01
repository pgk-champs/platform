import { render, screen, fireEvent } from '@testing-library/react';
import TrainingSchedule from './TrainingSchedule';

let clicked: { download: string }[];

beforeEach(() => {
  clicked = [];
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clicked.push({ download: this.download });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('кнопка заблокирована, пока не выбран ни один день', () => {
  render(<TrainingSchedule />);
  expect(screen.getByRole('button', { name: 'В календарь (.ics)' })).toBeDisabled();
  expect(screen.getByText('Отметьте хотя бы один день')).toBeTruthy();
});

test('после выбора дня клик скачивает .ics', () => {
  render(<TrainingSchedule />);
  fireEvent.click(screen.getByLabelText('Пн'));
  const btn = screen.getByRole('button', { name: 'В календарь (.ics)' });
  expect(btn).toBeEnabled();
  fireEvent.click(btn);
  expect(clicked).toHaveLength(1);
  expect(clicked[0].download).toBe('pgk-training.ics');
});
