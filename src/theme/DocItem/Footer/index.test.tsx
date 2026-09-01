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
  // Комментарии: заголовок и заглушка до ответа giscus.
  expect(screen.getByText('Комментарии')).toBeInTheDocument();
  expect(screen.getByText(/Комментарии появятся после настройки/)).toBeInTheDocument();
});
