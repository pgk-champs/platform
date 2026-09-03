import React, { useState } from 'react';
import { store } from '../lib/store';
import type { Card } from './Flashcards';
import './trainers.css';

const XP_PERFECT = 10;
const OPTIONS = 4;

export type ReverseQuizProps = {
  /** Те же данные, что у Flashcards: term (англ.) / translation (рус.) / note. */
  cards: Card[];
  /** Вместе включают запись прогресса и XP. */
  chapterId?: string;
  trainerId?: string;
};

// Детерминированное перемешивание (сид из строки): SSR-рендер Docusaurus
// и клиентская гидрация дают одинаковый порядок, Math.random нельзя.
function seededShuffle(items: string[], key: string): string[] {
  let seed = 0;
  for (let i = 0; i < key.length; i += 1) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function optionsFor(cards: Card[], qi: number): string[] {
  const opts: string[] = [];
  for (let k = 0; k < Math.min(OPTIONS, cards.length); k += 1) {
    opts.push(cards[(qi + k) % cards.length].term);
  }
  return seededShuffle(opts, cards[qi].term);
}

// Обратный квиз: показывается русское слово, 4 варианта английских —
// направление, обратное Flashcards (рус → англ).
export default function ReverseQuiz({ cards, chapterId, trainerId }: ReverseQuizProps) {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [gotXp, setGotXp] = useState(false);

  if (cards.length < OPTIONS) return <div className="rq">Нужно минимум 4 слова</div>;

  const card = cards[qi];
  const opts = optionsFor(cards, qi);
  const last = qi === cards.length - 1;

  const pick = (term: string) => {
    if (picked !== null || done) return;
    setPicked(term);
    if (term === card.term) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (picked === null) return;
    if (!last) {
      setQi(qi + 1);
      setPicked(null);
      return;
    }
    setDone(true);
    const total = cards.length;
    const finalCorrect = correctCount;
    if (chapterId && trainerId) {
      const first = !store.getProgress().trainers[chapterId]?.[trainerId];
      store.markTrainerDone(chapterId, trainerId, { correct: finalCorrect, total });
      if (first && finalCorrect === total) {
        store.addXp(XP_PERFECT, `reversequiz:${chapterId}:${trainerId}`);
        setGotXp(true);
      }
    }
  };

  const restart = () => {
    setQi(0);
    setPicked(null);
    setCorrectCount(0);
    setDone(false);
    // Без сброса «+10 XP» осталась бы висеть на каждом следующем итоге,
    // хотя XP даётся только за первый безошибочный круг.
    setGotXp(false);
  };

  if (done) {
    return (
      <div className="rq">
        <p className="rq-result" role="status">
          {`Верно ${correctCount} из ${cards.length}${gotXp ? ' · +10 XP' : ''}`}
        </p>
        <button type="button" className="rq-restart" onClick={restart}>
          Пройти ещё раз
        </button>
      </div>
    );
  }

  return (
    <div className="rq">
      <div className="rq-counter">
        Слово {qi + 1} / {cards.length}
      </div>
      <div className="rq-question">
        Как по-английски: <b>«{card.translation}»</b>?
      </div>
      <div className="rq-options">
        {opts.map((term) => {
          let cls = 'rq-option';
          if (picked !== null) {
            if (term === card.term) cls += ' rq-right';
            else if (term === picked) cls += ' rq-wrong';
          }
          return (
            <button key={term} type="button" className={cls} onClick={() => pick(term)} disabled={picked !== null}>
              {term}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <div className="rq-feedback" aria-live="polite">
          {picked === card.term ? (
            <span className="rq-ok">Верно! ✅</span>
          ) : (
            <span className="rq-no">
              Правильный ответ — <b>{card.term}</b>
            </span>
          )}
          {card.note ? <span className="rq-note"> · {card.note}</span> : null}
        </div>
      ) : null}
      <button type="button" className="rq-next" onClick={next} disabled={picked === null}>
        {last ? 'Показать результат' : 'Дальше'}
      </button>
    </div>
  );
}
