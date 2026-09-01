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
                  <li key={item.id} className="fav-item">
                    <span className="fav-item-title">
                      {item.url ? <Link to={item.url}>{item.title}</Link> : item.title}
                    </span>
                    <button
                      type="button"
                      className="fav-remove"
                      onClick={() => store.favorites.remove(item.id)}
                      aria-label={`Убрать «${item.title}» из избранного`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </Layout>
  );
}
