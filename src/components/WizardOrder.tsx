import React, { useState } from 'react';
import { store } from '../lib/store';
import { shuffledIndices } from './ComposeBuilder';
import './trainers.css';

// «Порядок шагов мастера»: карточки шагов создания проекта перетасованы,
// кликами выстраивается последовательность; проверка называет позиции,
// которые не на месте, после успеха — почему порядок именно такой.

const XP_SOLVE = 15;

export type WizardStep = {
  /** Текст шага. */
  text: string;
  /** Почему шаг стоит именно на этом месте. */
  why: string;
};

export default function WizardOrder({
  steps,
  chapterId,
  trainerId,
}: {
  /** Шаги в правильном порядке. */
  steps: WizardStep[];
  chapterId?: string;
  trainerId?: string;
}) {
  const [bank] = useState(() => shuffledIndices(steps.length, steps.map((s) => s.text).join('|')));
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [gotXp, setGotXp] = useState(false);

  if (steps.length === 0) return null;

  const full = picked.length === steps.length;
  // Позиции (с 1), где выбранная карточка стоит не на своём месте.
  const wrongPositions = picked
    .map((b, pos) => (bank[b] !== pos ? pos + 1 : 0))
    .filter((p) => p > 0);

  const pick = (i: number) => {
    if (solved || full || picked.includes(i)) return;
    setPicked([...picked, i]);
    setChecked(false);
  };

  const unpick = (pos: number) => {
    if (solved) return;
    setPicked(picked.filter((_, k) => k !== pos));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (wrongPositions.length === 0) {
      setSolved(true);
      if (chapterId && trainerId) {
        const first = !store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { solved: true, total: steps.length });
        if (first) {
          store.addXp(XP_SOLVE, `trainer:${chapterId}:${trainerId}`);
          setGotXp(true);
        }
      }
    }
  };

  if (solved) {
    return (
      <div className="wzo">
        <div className="wzo-done">
          Выполнено! Все {steps.length} шагов мастера в правильном порядке.
          {gotXp ? ` +${XP_SOLVE} XP` : ''}
        </div>
        <p className="wzo-why-head">Почему такой порядок:</p>
        <ol className="wzo-explain">
          {steps.map((s) => (
            <li key={s.text}>
              <strong>{s.text}</strong> — {s.why}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="wzo">
      <div className="wzo-seq" aria-label="Твой порядок шагов">
        {picked.length === 0 ? (
          <span className="wzo-placeholder">
            Клик по карточке внизу добавляет её сюда — выстрой шаги мастера по порядку
          </span>
        ) : (
          picked.map((i, pos) => (
            <button
              key={i}
              type="button"
              className={`wzo-card wzo-card-picked${
                checked && bank[i] !== pos ? ' wzo-card-wrong' : ''
              }`}
              onClick={() => unpick(pos)}
              title="Вернуть карточку"
            >
              <span className="wzo-num">{pos + 1}</span>
              {steps[bank[i]].text}
            </button>
          ))
        )}
      </div>

      {checked && wrongPositions.length > 0 ? (
        <p className="wzo-no">
          {/* в полной перестановке сбитых позиций всегда минимум две — единственное число не нужно */}
          Не на своём месте: позиции {wrongPositions.join(', ')}. Клик по карточке в собранном
          списке возвращает её вниз — переставь и проверь снова.
        </p>
      ) : null}

      <div className="wzo-bank" aria-label="Карточки шагов">
        {bank.map((_, i) => (
          <button
            key={i}
            type="button"
            className="wzo-card"
            onClick={() => pick(i)}
            disabled={picked.includes(i)}
          >
            {steps[bank[i]].text}
          </button>
        ))}
      </div>

      <button type="button" className="wzo-check" onClick={check} disabled={!full}>
        Проверить порядок
      </button>
    </div>
  );
}
