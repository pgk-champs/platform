import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { store, type BlockKind, type FavPayload } from '../lib/store';
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
  /** Содержимое, сохраняемое в избранное вместе со ссылкой (см. FavPayload). */
  favPayload?: FavPayload;
  children: React.ReactNode;
};

export default function Block({ kind, title, chapterId, blockId, favPayload, children }: BlockProps) {
  // Перерисовываемся при изменениях в store (например, избранное убрали со
  // страницы «Избранное» в другой вкладке того же приложения, или блок
  // свернули/развернули на другой странице с тем же blockId).
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  // store поднимает localStorage ещё при импорте на клиенте, поэтому «избранное»
  // и «свёрнутость» читаем только после монтирования — иначе первый клиентский
  // рендер разойдётся с серверным (пустым) и React выдаст hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const meta = KIND_META[kind];
  const favId = chapterId && blockId ? `${chapterId}:${blockId}` : undefined;
  const isFav = mounted && favId ? store.favorites.isFavorite(favId) : false;

  // Без blockId сворачивание работает, но не переживает перезагрузку —
  // персистить в store нечем ключевать. С blockId (плюс chapterId, если
  // есть — избегает коллизий одинаковых blockId в разных главах) состояние
  // запоминается per-blockId, по умолчанию развёрнуто.
  const collapseKey = favId ?? blockId;
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = collapseKey ? (mounted ? store.block.isCollapsed(collapseKey) : false) : localCollapsed;
  const toggleCollapsed = () => {
    if (collapseKey) {
      store.block.setCollapsed(collapseKey, !collapsed);
    } else {
      setLocalCollapsed((c) => !c);
    }
  };

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
        url: typeof window !== 'undefined' ? `${window.location.pathname}#${blockId}` : undefined,
        data: favPayload,
      });
    }
  };

  return (
    <div className={`block block-${kind}`} id={blockId}>
      <div className="block-header">
        <button
          type="button"
          className="block-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Развернуть блок' : 'Свернуть блок'}
        >
          <span className={`block-arrow ${collapsed ? '' : 'block-arrow-open'}`.trim()} aria-hidden="true">
            ▶
          </span>
          <span className="block-icon" aria-hidden="true">
            {meta.icon}
          </span>
          <span className="block-badge">{meta.label}</span>
          <span className="block-title">{title}</span>
        </button>
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
      {/* Схлопывание анимируется треком грида 1fr → 0fr: высота содержимого
          заранее неизвестна, а так переход работает без замеров в JS.
          Свёрнутое содержимое убирается из фокуса и с чтения экранным
          диктором через inert — раньше это делал атрибут hidden. */}
      <div className={`block-body ${collapsed ? 'block-body--collapsed' : ''}`.trim()}>
        <div className="block-body-inner" inert={collapsed}>
          {children}
        </div>
      </div>
    </div>
  );
}
