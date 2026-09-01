import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Визуализатор val/var: две ячейки памяти. var переприсваивается с анимацией,
// val отвечает настоящей ошибкой компилятора, правильный путь — новая val поверх.

const Y_VALUES = [15, 42, 7, 99];
const XP = 25;
export const VAL_ERROR = "'val' cannot be reassigned.";

export default function MemoryViz({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них тренажёр работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [yClicks, setYClicks] = useState(0);
  const [valTries, setValTries] = useState(0);
  const [hasNewVal, setHasNewVal] = useState(false);
  const rewardedRef = useRef(false);

  const yValue = yClicks === 0 ? 0 : Y_VALUES[(yClicks - 1) % Y_VALUES.length];
  const done = yClicks > 0 && valTries > 0 && hasNewVal;

  useEffect(() => {
    if (done && !rewardedRef.current) {
      rewardedRef.current = true;
      if (chapterId && trainerId) {
        store.markTrainerDone(chapterId, trainerId, {
          varAssigned: true,
          valError: true,
          newVal: true,
        });
        store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
      }
    }
  }, [done, chapterId, trainerId]);

  return (
    <div className="mv">
      <div className="mv-cells">
        <div key={`val-${valTries}`} className={`mv-cell mv-cell-val ${valTries > 0 ? 'mv-flash' : ''}`.trim()}>
          <div className="mv-head">
            <code>val x</code>
            <span className="mv-tag">неизменяемая</span>
          </div>
          <div className="mv-value">5</div>
          <button type="button" className="mv-btn" onClick={() => setValTries((n) => n + 1)}>
            Присвоить новое значение
          </button>
        </div>

        <div className="mv-cell mv-cell-var">
          <div className="mv-head">
            <code>var y</code>
            <span className="mv-tag">изменяемая</span>
          </div>
          <div key={`var-${yClicks}`} className="mv-value mv-pop">{yValue}</div>
          <button type="button" className="mv-btn" onClick={() => setYClicks((n) => n + 1)}>
            Присвоить новое значение
          </button>
        </div>

        {hasNewVal ? (
          <div className="mv-cell mv-cell-new mv-pop">
            <div className="mv-head">
              <code>val newX</code>
              <span className="mv-tag">новая val</span>
            </div>
            <div className="mv-value">120</div>
            <div className="mv-note">Старую не трогаем — заводим новую</div>
          </div>
        ) : null}
      </div>

      {valTries > 0 ? (
        <div className="mv-error">
          <code>{VAL_ERROR}</code>
          <div>
            Компилятор не пустил: <code>x</code> объявлена как <code>val</code>, второе значение положить
            некуда. Правильный путь — создать новую <code>val</code> поверх.
          </div>
          {!hasNewVal ? (
            <button type="button" className="mv-btn mv-btn-new" onClick={() => setHasNewVal(true)}>
              Создать новую val поверх
            </button>
          ) : null}
        </div>
      ) : null}

      {done ? (
        <div className="mv-done">
          ✓ Выполнено! var меняется, val — нет, а новое значение живёт в новой val.
          {chapterId && trainerId ? ` +${XP} XP` : ''}
        </div>
      ) : null}
    </div>
  );
}
