import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Визуализатор val/var: две ячейки памяти. var переприсваивается с анимацией,
// val отвечает настоящей ошибкой компилятора, правильный путь — новая val поверх.

const Y_VALUES = [15, 42, 7, 99];
const XP = 25;
export const VAL_ERROR = "'val' cannot be reassigned.";

// Секция «значение vs ссылка»: имена, которые add добавляет в общий MutableList.
const REF_EXTRA = ['Соня', 'Тимур', 'Ринат', 'Диана'];
const REF_START = ['Алиса', 'Богдан'];

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

  // Секция «значение vs ссылка»: val a и val b указывают на ОДИН MutableList.
  const [refItems, setRefItems] = useState<string[]>(REF_START);
  const [lastVia, setLastVia] = useState<'a' | 'b' | null>(null);
  const nextName = REF_EXTRA[refItems.length - REF_START.length];
  const addVia = (via: 'a' | 'b') => {
    if (!nextName) return;
    setRefItems((prev) => [...prev, nextName]);
    setLastVia(via);
  };

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

      <div className="mv2">
        <div className="mv2-title">Значение vs ссылка</div>
        <div className="mv2-lead">
          Переменных две — <code>val a</code> и <code>val b</code>, — а объект <code>MutableList</code> в памяти{' '}
          <strong>один</strong>: обе стрелки ведут к нему. Добавь элемент через любую из них.
        </div>
        <div className="mv2-scene">
          <div className="mv2-vars">
            <div className="mv-cell">
              <div className="mv-head">
                <code>val a</code>
                <span className="mv-tag">ссылка</span>
              </div>
              <button type="button" className="mv-btn" disabled={!nextName} onClick={() => addVia('a')}>
                {nextName ? `a.add("${nextName}")` : 'список полон'}
              </button>
            </div>
            <div className="mv-cell">
              <div className="mv-head">
                <code>val b</code>
                <span className="mv-tag">ссылка</span>
              </div>
              <button type="button" className="mv-btn" disabled={!nextName} onClick={() => addVia('b')}>
                {nextName ? `b.add("${nextName}")` : 'список полон'}
              </button>
            </div>
          </div>
          <svg
            className="mv2-arrows"
            key={`${lastVia ?? 'нет'}-${refItems.length}`}
            viewBox="0 0 60 170"
            width="60"
            height="170"
            role="img"
            aria-label="Две стрелки от переменных a и b к одному объекту MutableList"
          >
            <path
              className={`mv2-arrow${lastVia === 'a' ? ' mv2-arrow-active' : ''}`}
              d="M 2 40 C 28 40 40 70 52 82"
            />
            <polygon
              className={`mv2-arrowhead${lastVia === 'a' ? ' mv2-arrowhead-active' : ''}`}
              points="52,82 44,80 48,74"
            />
            <path
              className={`mv2-arrow${lastVia === 'b' ? ' mv2-arrow-active' : ''}`}
              d="M 2 130 C 28 130 40 100 52 88"
            />
            <polygon
              className={`mv2-arrowhead${lastVia === 'b' ? ' mv2-arrowhead-active' : ''}`}
              points="52,88 48,96 44,90"
            />
          </svg>
          <div className="mv-cell mv2-obj" key={`obj-${refItems.length}`}>
            <div className="mv-head">
              <code>MutableList</code>
              <span className="mv-tag">один объект</span>
            </div>
            <div className={`mv2-items${lastVia ? ' mv-pop' : ''}`}>
              {refItems.map((n) => (
                <span key={n} className="mv2-item">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
        {lastVia ? (
          <div className="mv2-note">
            Добавили через <code>{lastVia}</code> — и через{' '}
            <code>{lastVia === 'a' ? 'b' : 'a'}</code> видно то же самое: объект-то один.
          </div>
        ) : null}
        <div className="mv2-moral">
          <code>val</code> здесь прибивает гвоздями <strong>стрелку</strong>, а не коробку: перенаправить{' '}
          <code>a</code> на другой список нельзя, а вот содержимое — живёт. Коробка прибита, содержимое меняется.
        </div>
      </div>
    </div>
  );
}
