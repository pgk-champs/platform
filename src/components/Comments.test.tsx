import { render, screen, fireEvent } from '@testing-library/react';
import Comments from './Comments';

// Скрипт giscus.app — чужой домен, iframe и запрос к GitHub. Раньше он
// грузился безусловно на каждой из 137 глав, даже там, где комментариев
// никогда не было. Страж держит «по нажатию», а не «сразу».

afterEach(() => {
  document.querySelectorAll('script[src="https://giscus.app/client.js"]').forEach((s) => s.remove());
});

test('скрипт стороннего домена не грузится, пока не попросили', () => {
  render(<Comments />);
  expect(document.querySelector('script[src="https://giscus.app/client.js"]')).toBeNull();
  expect(screen.getByText('Показать обсуждение главы')).toBeTruthy();
});

test('нажатие грузит скрипт ровно один раз', () => {
  render(<Comments />);
  fireEvent.click(screen.getByText('Показать обсуждение главы'));
  expect(document.querySelectorAll('script[src="https://giscus.app/client.js"]')).toHaveLength(1);
});

test('до нажатия объясняет, почему кнопка, а не сразу виджет', () => {
  render(<Comments />);
  expect(screen.getByText(/чужого домена/)).toBeTruthy();
});
