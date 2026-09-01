import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import '../../../components/trainers.css';

// Кастомная 404 в стиле терминала: переопределяет @theme/NotFound/Content
// (обёртка NotFound из theme-classic сама даёт Layout и метаданные страницы).
export default function NotFoundContent({ className }: { className?: string }) {
  const { pathname } = useLocation();
  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className="nf-terminal">
        <div className="nf-titlebar">
          <span className="nf-dot nf-dot-r" />
          <span className="nf-dot nf-dot-y" />
          <span className="nf-dot nf-dot-g" />
          <span className="nf-titlebar-text">bash — 404</span>
        </div>
        <pre className="nf-screen">
          <span className="nf-prompt">$ </span>cd {pathname}
          {'\n'}bash: страница: No such file or directory
          {'\n'}
          {'\n'}
          <span className="nf-comment"># Такой страницы нет: ссылка устарела или в адресе опечатка.</span>
          {'\n'}
          <span className="nf-comment"># Подсказка: из любого незнакомого места дорога одна — cd /</span>
          {'\n'}
          {'\n'}
          <span className="nf-prompt">$ </span>cd /<span className="nf-cursor" aria-hidden="true" />
        </pre>
      </div>
      <div className="nf-actions">
        <Link className="button button--primary button--lg" to="/">
          cd / — на главную
        </Link>
      </div>
    </main>
  );
}
