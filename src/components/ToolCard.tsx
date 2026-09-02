import React, { useState } from 'react';
import './trainers.css';

// embeddable (цикл 5): сервисы без X-Frame-Options/CSP (explainshell,
// cmdchallenge, play.kotlinlang.org) можно встроить — кнопка «Открыть здесь»
// монтирует iframe по клику, состояние по умолчанию false и одинаково на
// сервере и клиенте, так что гидратация не расходится (SSR-safe без эффектов).
// Сервисы с X-Frame-Options (regex101, regexone) остаются как раньше —
// целая карточка это ссылка, embeddable не передаётся.
// Ревью цикла 5: iframe встраивал чужой JS без единого ограничения — сервис
// мог перекинуть top-level страницу (редирект-угон) или скачать файл без
// подтверждения. sandbox разрешает то, что реально нужно тренажёрам
// (скрипты, свой origin для localStorage, формы explainshell, всплывашки/
// модалки), но не top-navigation и не downloads.
export default function ToolCard({
  name,
  url,
  desc,
  embeddable = false,
}: {
  name: string;
  url: string;
  desc: string;
  embeddable?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!embeddable) {
    return (
      <a className="tc" href={url} target="_blank" rel="noreferrer noopener">
        <div className="tc-name">{name}</div>
        <div className="tc-desc">{desc}</div>
      </a>
    );
  }

  return (
    <div className="tc tc-embeddable">
      <div className="tc-name">{name}</div>
      <div className="tc-desc">{desc}</div>
      <div className="tc-actions">
        <button
          type="button"
          className="button button--sm button--primary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Скрыть' : 'Открыть здесь'}
        </button>
        <a
          className="button button--sm button--secondary"
          href={url}
          target="_blank"
          rel="noreferrer noopener"
        >
          Открыть в новой вкладке
        </a>
      </div>
      {open ? (
        <iframe
          className="tc-frame"
          src={url}
          title={name}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      ) : null}
    </div>
  );
}
