import React from 'react';
import { useLocation } from '@docusaurus/router';
import './trainers.css';

// «Предложить правку» — путь попроще, чем карандаш→PR: открывает в GitHub
// предзаполненную issue-форму (.github/ISSUE_TEMPLATE/edit-suggestion.yml),
// глава подставляется из URL страницы. Рендерится в футере каждой главы
// через обёртку src/theme/DocItem/Footer.

export const REPO = 'pgk-champs/platform';

/** Собирает URL предзаполненной issue-формы для страницы pathname. */
export function buildSuggestEditUrl(pathname: string): string {
  const params = new URLSearchParams({
    template: 'edit-suggestion.yml',
    chapter: pathname,
    title: `Правка: ${pathname}`,
  });
  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}

export default function SuggestEdit() {
  const { pathname } = useLocation();
  return (
    <a
      className="se-link"
      href={buildSuggestEditUrl(pathname)}
      target="_blank"
      rel="noopener noreferrer"
      title="Открыть форму предложения правки на GitHub"
    >
      <svg
        className="se-pencil"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
      Предложить правку
    </a>
  );
}
