import React, { useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { store, type FavoriteItem } from '../lib/store';
import knowledgeMap from '../data/knowledge-map.json';
import '../components/trainers.css';

const CHAPTER_TITLES: Record<string, string> = Object.fromEntries(
  (knowledgeMap as { id: string; title: string }[]).map((e) => [e.id, e.title]),
);

function groupByChapter(items: FavoriteItem[]): Map<string, FavoriteItem[]> {
  const grouped = new Map<string, FavoriteItem[]>();
  for (const item of items) {
    const list = grouped.get(item.chapterId) ?? [];
    list.push(item);
    grouped.set(item.chapterId, list);
  }
  return grouped;
}

function RemoveButton({ item }: { item: FavoriteItem }) {
  return (
    <button
      type="button"
      className="fav-remove"
      onClick={() => store.favorites.remove(item.id)}
      aria-label={`Убрать «${item.title}» из избранного`}
    >
      ✕
    </button>
  );
}

// Содержимое избранного рендерится по форме data.kind: шпаргалка —
// таблицей, ссылка — ссылкой с описанием, слово — карточкой термина.
// Всё остальное (нет data, или незнакомый kind) — старым способом:
// заголовок и ссылка-якорь на сам блок в главе.
function FavoriteRow({ item }: { item: FavoriteItem }) {
  const data = item.data;

  if (data?.kind === 'table') {
    return (
      <li className="fav-item fav-item-table">
        <div className="fav-item-row">
          <span className="fav-item-title">{item.title}</span>
          <RemoveButton item={item} />
        </div>
        <table className="rl-matrix">
          <thead>
            <tr>
              {data.head.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </li>
    );
  }

  if (data?.kind === 'link') {
    return (
      <li className="fav-item">
        <div className="fav-item-row">
          <span className="fav-item-title">
            <a href={data.url} target="_blank" rel="noreferrer">
              {item.title}
            </a>
          </span>
          <RemoveButton item={item} />
        </div>
        {data.desc ? <div className="fc-note">{data.desc}</div> : null}
      </li>
    );
  }

  if (data?.kind === 'word') {
    return (
      <li className="fav-item fav-item-word">
        <div className="fav-item-row">
          <span className="fav-item-title fc-term">{data.term}</span>
          <RemoveButton item={item} />
        </div>
        <div className="fc-translation">{data.translation}</div>
        {data.note ? <div className="fc-note">{data.note}</div> : null}
      </li>
    );
  }

  return (
    <li className="fav-item">
      <div className="fav-item-row">
        <span className="fav-item-title">{item.url ? <Link to={item.url}>{item.title}</Link> : item.title}</span>
        <RemoveButton item={item} />
      </div>
    </li>
  );
}

export default function Favorites() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const items = store.favorites.list();

  return (
    <Layout title="Избранное" description="Сохранённые тренажёры, квизы и материалы платформы">
      <main className="container margin-vert--lg">
        <h1>Избранное</h1>
        {items.length === 0 ? (
          <p className="fav-empty">
            Пока пусто. Отмечайте звёздочкой ★ тренажёры, квизы и другие блоки на страницах глав — здесь
            появится ваша подборка.
          </p>
        ) : (
          [...groupByChapter(items).entries()].map(([chapterId, chapterItems]) => (
            <section key={chapterId} className="fav-group">
              <h2>{CHAPTER_TITLES[chapterId] ?? chapterId}</h2>
              <ul className="fav-list">
                {chapterItems.map((item) => (
                  <FavoriteRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </Layout>
  );
}
