import React, { useSyncExternalStore } from 'react';
import { store, type BlockKind } from '../lib/store';
import './trainers.css';

const KIND_META: Record<BlockKind, { label: string; icon: string }> = {
  trainer: { label: 'Тренажёр', icon: '🏋️' },
  quiz: { label: 'Квиз', icon: '📝' },
  breakdown: { label: 'Разбор по составу', icon: '🧩' },
  vocab: { label: 'Словарь', icon: '📚' },
  cheatsheet: { label: 'Шпаргалка', icon: '🗒️' },
  fact: { label: 'Интересный факт', icon: '💡' },
};

export type BlockProps = {
  kind: BlockKind;
  title: string;
  /** Нужны вместе, чтобы блок можно было добавить в избранное. */
  chapterId?: string;
  blockId?: string;
  children: React.ReactNode;
};

export default function Block({ kind, title, chapterId, blockId, children }: BlockProps) {
  // Перерисовываемся при изменениях в store (например, избранное убрали со
  // страницы «Избранное» в другой вкладке того же приложения).
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const meta = KIND_META[kind];
  const favId = chapterId && blockId ? `${chapterId}:${blockId}` : undefined;
  const isFav = favId ? store.favorites.isFavorite(favId) : false;

  const toggleFav = () => {
    if (!favId || !chapterId) return;
    if (isFav) {
      store.favorites.remove(favId);
    } else {
      store.favorites.add({
        id: favId,
        type: kind,
        chapterId,
        title,
        url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      });
    }
  };

  return (
    <div className={`block block-${kind}`}>
      <div className="block-header">
        <span className="block-icon" aria-hidden="true">
          {meta.icon}
        </span>
        <span className="block-badge">{meta.label}</span>
        <span className="block-title">{title}</span>
        {favId ? (
          <button
            type="button"
            className={`block-fav ${isFav ? 'block-fav-on' : ''}`.trim()}
            onClick={toggleFav}
            aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
            aria-pressed={isFav}
          >
            {isFav ? '★' : '☆'}
          </button>
        ) : null}
      </div>
      <div className="block-body">{children}</div>
    </div>
  );
}
