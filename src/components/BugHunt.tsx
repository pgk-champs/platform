import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// «Кликни строку с ошибкой»: раунды-сниппеты, в каждом ровно одна строка
// не пройдёт компиляцию. Верный клик показывает настоящее сообщение компилятора.

export type BugRound = {
  lines: string[];
  /** Индекс строки с ошибкой (с нуля). */
  bugLine: number;
  /** Точное сообщение компилятора. */
  error: string;
  why: string;
};

const PERFECT_XP = 25;

export default function BugHunt({
  rounds,
  chapterId,
  trainerId,
}: {
  rounds: BugRound[];
  /** Опциональны: без них тренажёр работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);
  const rewardedRef = useRef(false);

  const total = rounds.length;
  if (total === 0) return null;

  const r = rounds[idx];

  const pick = (i: number) => {
    if (solved) return;
    if (i === r.bugLine) {
      setSolved(true);
      setWrongPick(null);
      if (!missedThisRound) setFirstTry((n) => n + 1);
    } else {
      setWrongPick(i);
      setMissedThisRound(true);
    }
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setSolved(false);
      setWrongPick(null);
      setMissedThisRound(false);
      return;
    }
    setFinished(true);
    if (chapterId && trainerId) {
      store.markTrainerDone(chapterId, trainerId, { firstTry, total });
      if (firstTry === total && !rewardedRef.current) {
        rewardedRef.current = true;
        store.addXp(PERFECT_XP, `trainer:${chapterId}:${trainerId}`);
      }
    }
  };

  const retry = () => {
    setIdx(0);
    setSolved(false);
    setWrongPick(null);
    setMissedThisRound(false);
    setFirstTry(0);
    setFinished(false);
  };

  if (finished) {
    const perfect = firstTry === total;
    return (
      <div className="bh">
        <div className={`bh-final ${perfect ? 'bh-final-perfect' : ''}`.trim()}>
          ✓ Выполнено! С первого клика найдено {firstTry} из {total}.
          {perfect && chapterId && trainerId ? ` +${PERFECT_XP} XP` : ''}
        </div>
        {!perfect ? (
          <button type="button" className="bh-next" onClick={retry}>
            Пройти ещё раз
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bh">
      <div className="bh-progress">
        Раунд {idx + 1} из {total} — кликни строку, на которую заругается компилятор
      </div>

      <div className="bh-code">
        {r.lines.map((line, i) => {
          const cls =
            solved && i === r.bugLine ? 'bh-right' : !solved && i === wrongPick ? 'bh-wrong' : '';
          return (
            <button
              key={i}
              type="button"
              className={`bh-line ${cls}`.trim()}
              disabled={solved}
              onClick={() => pick(i)}
            >
              <span className="bh-num">{i + 1}</span>
              <code>{line}</code>
            </button>
          );
        })}
      </div>

      {!solved && wrongPick !== null ? (
        <div className="bh-feedback bh-no">
          В строке {wrongPick + 1} всё в порядке — ищи дальше.
        </div>
      ) : null}

      {solved ? (
        <div className="bh-feedback bh-ok">
          <b>Верно!</b> Компилятор скажет: <code className="bh-error">{r.error}</code>
          <div>{r.why}</div>
          <div>
            <button type="button" className="bh-next" onClick={next}>
              {idx + 1 < total ? 'Дальше →' : 'Показать результат'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
