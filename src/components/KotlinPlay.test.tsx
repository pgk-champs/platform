import { render } from '@testing-library/react';
import KotlinPlay from './KotlinPlay';

const code = 'fun main() { println("hi") }';

beforeEach(() => {
  delete (window as { __kotlinPlayLoadPromise?: Promise<void> }).__kotlinPlayLoadPromise;
  document.querySelectorAll('script[src*="kotlin-playground"]').forEach((el) => el.remove());
});

test('renders code inside code.kotlin-playground', () => {
  const { container } = render(<KotlinPlay code={code} />);
  expect(container.querySelector('code.kotlin-playground')?.textContent).toBe(code);
});

test('mounting twice adds the loader script only once', () => {
  const { unmount } = render(<KotlinPlay code={code} />);
  unmount();
  render(<KotlinPlay code={code} />);
  expect(document.querySelectorAll('script[src*="kotlin-playground"]').length).toBe(1);
});
