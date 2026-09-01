import { render, screen } from '@testing-library/react';
import UnderHood from './UnderHood';

test('renders collapsed details with the standard summary and content', () => {
  const { container } = render(<UnderHood>Внутри — обычный JSON.</UnderHood>);
  const details = container.querySelector('details.under-hood') as HTMLDetailsElement;
  expect(details).toBeTruthy();
  expect(details.open).toBe(false);
  expect(screen.getByText('Как это устроено под капотом')).toBeTruthy();
  expect(screen.getByText('Внутри — обычный JSON.')).toBeTruthy();
});
