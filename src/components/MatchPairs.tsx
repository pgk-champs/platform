import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

const XP_SOLVE = 10;
const MISMATCH_MS = 900;

export type Pair = { term: string; translation: string };

export type MatchPairsProps = {
  /** 8 пар для поля 4×4; работает и с меньшим числом пар. */
  pairs: Pair[];
  /** Вместе включают запись прогресса и XP. */
  chapterId?: string;
  trainerId?: string;
};

type CardT = { pair: number; text: string };

// Детерминированное перемешивание (сид из текстов карточек): SSR-рендер
// Docusaurus и клиентская гидрация дают одинаковый порядок, Math.random нельзя.
function seededShuffle(items: CardT[]): CardT[] {
  let seed = 0;
  const key = items.map((c) => c.text).join(' ');
  for (let i = 0; i < key.length; i += 1) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

// «Найди пары»: поле карточек слово↔перевод. Клик по двум — совпали
// (остаются открытыми, зелёные) или закрылись. Таймер и счёт ходов.
export default function MatchPairs({ pairs, chapterId, trainerId }: MatchPairsProps) {
  const [cards] = useState<CardT[]>(() =>
    seededShuffle(pairs.flatMap((p, i) => [
      { pair: i, text: p.term },
      { pair: i, text: p.translation },
    ])),
  );
  const [matched, setMatched] = useState<number[]>([]); // индексы карточек
  const [open, setOpen] = useState<number[]>([]); // 0..2 открытых, ещё не совпавших
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [gotXp, setGotXp] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = pairs.length > 0 && matched.length === cards.length;

  useEffect(() => {
    if (!started || done) return undefined;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);

  if (pairs.length === 0) return <div className="mp">Нет пар для игры</div>;

  const click = (i: number) => {
    if (done || matched.includes(i) || open.includes(i)) return;
    if (!started) setStarted(true);

    // Две несовпавшие уже открыты — закрываем их и открываем нажатую.
    if (open.length === 2) {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
      closeTimer.current = null;
      setOpen([i]);
      return;
    }

    if (open.length === 0) {
      setOpen([i]);
      return;
    }

    // Вторая карточка хода.
    const first = open[0];
    setMoves((m) => m + 1);
    if (cards[first].pair === cards[i].pair) {
      const nextMatched = [...matched, first, i];
      setMatched(nextMatched);
      setOpen([]);
      if (nextMatched.length === cards.length && chapterId && trainerId) {
        const firstSolve = !store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { moves: moves + 1, seconds });
        if (firstSolve) {
          store.addXp(XP_SOLVE, `matchpairs:${chapterId}:${trainerId}`);
          setGotXp(true);
        }
      }
    } else {
      setOpen([first, i]);
      closeTimer.current = setTimeout(() => {
        closeTimer.current = null;
        setOpen([]);
      }, MISMATCH_MS);
    }
  };

  return (
    <div className="mp">
      <div className="mp-status" role="status">
        <span>Время {fmt(seconds)}</span>
        <span className="mp-sep" aria-hidden="true">·</span>
        <span>Ходы {moves}</span>
        <span className="mp-sep" aria-hidden="true">·</span>
        <span>
          Пары {matched.length / 2}/{pairs.length}
        </span>
      </div>
      <div className="mp-grid" aria-label="Поле карточек">
        {cards.map((c, i) => {
          const isMatched = matched.includes(i);
          const isOpen = isMatched || open.includes(i);
          return (
            <button
              key={i}
              type="button"
              className={`mp-card${isOpen ? ' mp-open' : ''}${isMatched ? ' mp-matched' : ''}`}
              onClick={() => click(i)}
              disabled={isMatched}
              aria-pressed={isOpen}
            >
              {isOpen ? c.text : '?'}
            </button>
          );
        })}
      </div>
      {done ? (
        <p className="mp-ok">
          {`Все пары найдены! 🎉 ${fmt(seconds)}, ходов: ${moves}${gotXp ? ' · +10 XP' : ''}`}
        </p>
      ) : null}
    </div>
  );
}
