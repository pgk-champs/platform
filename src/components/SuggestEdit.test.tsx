/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SuggestEdit, { buildSuggestEditUrl } from './SuggestEdit';

test('URL ведёт на issue-форму с шаблоном и главой из pathname', () => {
  const url = buildSuggestEditUrl('/platform/docs/foundation/05-git-first-commit');
  const parsed = new URL(url);
  expect(parsed.origin + parsed.pathname).toBe(
    'https://github.com/pgk-champs/platform/issues/new',
  );
  expect(parsed.searchParams.get('template')).toBe('edit-suggestion.yml');
  expect(parsed.searchParams.get('chapter')).toBe(
    '/platform/docs/foundation/05-git-first-commit',
  );
  expect(parsed.searchParams.get('title')).toBe(
    'Правка: /platform/docs/foundation/05-git-first-commit',
  );
});

test('кириллица и спецсимволы в pathname кодируются', () => {
  const url = buildSuggestEditUrl('/docs/глава?x');
  expect(url).not.toContain('глава');
  expect(new URL(url).searchParams.get('chapter')).toBe('/docs/глава?x');
});

test('рендерит ссылку «Предложить правку» с pathname текущей страницы', () => {
  render(<SuggestEdit />);
  const link = screen.getByRole('link', { name: /Предложить правку/ });
  expect(link).toHaveAttribute(
    'href',
    buildSuggestEditUrl('/platform/docs/foundation/05-git-first-commit'),
  );
  expect(link).toHaveAttribute('target', '_blank');
});
