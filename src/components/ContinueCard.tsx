import React, { useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { fillOf } from '../lib/chapterFill';
import './vessels.css';

// Первое, что видно на Маршруте: какую главу читать и насколько она пройдена.
// Проценты здесь и уровень в сосуде — одна и та же величина, считается в одном
// месте, поэтому разойтись не могут.

export type ContinueChapter = { id: string; title: string; path: string };

export default function ContinueCard({
  chapter,
}: {
  chapter: ContinueChapter | null;
}): React.ReactElement {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  if (!chapter) {
    return (
      <section className="vs-now">
        <span className="vs-now-k">Готово</span>
        <span className="vs-now-t">Трек пройден</span>
      </section>
    );
  }

  const pct = Math.round(fillOf(chapter.id) * 100);

  return (
    <section className="vs-now">
      <span className="vs-now-k">Продолжить</span>
      <span className="vs-now-t">{chapter.title}</span>
      <div className="vs-now-line">
        <span className="vs-now-track">
          <i className="vs-now-fill" style={{ width: pct + '%' }} />
        </span>
        <span className="vs-now-pc">{pct}%</span>
      </div>
      <Link className="button button--primary" to={`/docs/${chapter.path.replace(/\.mdx?$/, '')}`}>
        Читать дальше
      </Link>
    </section>
  );
}
