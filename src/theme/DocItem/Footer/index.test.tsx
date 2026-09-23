/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FooterWrapper from './index';

test('футер главы: оригинал + «Предложить правку» + блок комментариев с заглушкой', () => {
  render(<FooterWrapper />);
  // Оригинальный футер Docusaurus (с «Редактировать страницу») сохранён.
  expect(screen.getByTestId('theme-original-footer')).toBeInTheDocument();
  // Кнопка «Предложить правку» указывает на issue-форму.
  const link = screen.getByRole('link', { name: /Предложить правку/ });
  expect(link.getAttribute('href')).toContain('issues/new');
  expect(link.getAttribute('href')).toContain('template=edit-suggestion.yml');
  // Комментарии: заголовок есть, но виджет — по нажатию, не сразу. Скрипт
  // giscus.app грузился на всех 137 главах безусловно, даже там, где
  // комментариев никогда не было — теперь страница не зовёт наружу сама.
  expect(screen.getByText('Комментарии')).toBeInTheDocument();
  expect(screen.getByText('Показать обсуждение главы')).toBeInTheDocument();
  expect(document.querySelector('script[src="https://giscus.app/client.js"]')).toBeNull();
});
