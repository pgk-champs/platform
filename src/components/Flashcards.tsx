import React, { useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

export type Card = { term: string; translation: string; note?: string };

export default function Flashcards({ cards, chapterId }: { cards: Card[]; chapterId?: string }) {
  // Только нужно, когда звёздочка слова видна (chapterId задан) — но хук
  // должен звонить безусловно на каждый рендер, поэтому подписываемся
  // всегда; без chapterId это просто лишняя (и дешёвая) подписка.
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return <div className="fc">Нет карточек</div>;
  }

  const card = cards[i];
  const flip = () => setFlipped((f) => !f);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  };
  const go = (delta: number) => {
    setI((n) => n + delta);
    setFlipped(false);
  };

  const favId = chapterId ? `${chapterId}:word:${card.term}` : undefined;
  const isFav = favId ? store.favorites.isFavorite(favId) : false;
  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!favId || !chapterId) return;
    if (isFav) {
      store.favorites.remove(favId);
    } else {
      store.favorites.add({
        id: favId,
        type: 'word',
        chapterId,
        title: card.term,
        data: { kind: 'word', term: card.term, translation: card.translation, note: card.note },
      });
    }
  };

  return (
    <div className="fc">
      <div
        className="fc-card"
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        onClick={flip}
        onKeyDown={onKeyDown}
      >
        {favId ? (
          <button
            type="button"
            className={`fc-fav ${isFav ? 'fc-fav-on' : ''}`.trim()}
            onClick={toggleFav}
            aria-label={isFav ? 'Убрать слово из избранного' : 'Слово в избранное'}
            aria-pressed={isFav}
          >
            {isFav ? '★' : '☆'}
          </button>
        ) : null}
        {flipped ? (
          <>
            <div className="fc-translation">{card.translation}</div>
            {card.note ? <div className="fc-note">{card.note}</div> : null}
          </>
        ) : (
          <div className="fc-term">{card.term}</div>
        )}
      </div>
      <div className="fc-controls">
        <button onClick={() => go(-1)} disabled={i === 0}>
          Назад
        </button>
        <span className="fc-counter">
          {i + 1} / {cards.length}
        </span>
        <button onClick={() => go(1)} disabled={i === cards.length - 1}>
          Дальше
        </button>
      </div>
    </div>
  );
}
