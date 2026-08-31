import React, { useState } from 'react';
import './trainers.css';

export type Card = { term: string; translation: string; note?: string };

export default function Flashcards({ cards }: { cards: Card[] }) {
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
