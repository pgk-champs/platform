import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Тренажёр выделения текста мышью на нативном Selection API
// (window.getSelection() — Baseline с 2015: developer.mozilla.org/docs/Web/API/Window/getSelection).
// Движок не сам решает, что выделено, — это делает браузер (двойной клик =
// слово, тройной = абзац, Shift+клик = продлить, протяжка = произвольный
// диапазон). Мы только читаем результат на mouseup/keyup и сверяем с целью.

export type SelectionMission = {
  id: string;
  /** Что делать — какой жест использовать. */
  instruction: string;
  /** Текст, внутри которого тренируются (рендерится в отдельном <p>). */
  text: string;
  /** Точное совпадение (после normalize). Не нужно при kind: 'freeform'. */
  expected?: string;
  /**
   * Протяжка: границы диапазона — где угодно, не только по словам.
   * Проверяем не текст, а что диапазон реально пересекает границы слов
   * (сосед снаружи и первый/последний символ внутри — буквы), а не
   * конкретную фразу — иначе никто не попадёт пиксель в пиксель.
   */
  kind?: 'freeform';
};

const DEFAULT_MISSIONS: SelectionMission[] = [
  {
    id: 'word',
    instruction: 'Дважды кликни по слову «домашнего» — двойной клик выделяет слово целиком.',
    text: 'Слепая печать начинается с домашнего ряда клавиатуры.',
    expected: 'домашнего',
  },
  {
    id: 'line',
    instruction: 'Кликни трижды подряд в любом месте этого предложения — тройной клик выделяет его целиком.',
    text: 'Тренируйся печатать каждый день хотя бы по десять минут.',
    expected: 'Тренируйся печатать каждый день хотя бы по десять минут.',
  },
  {
    id: 'extend',
    instruction:
      'Дважды кликни по слову «точность», затем, удерживая Shift, кликни по слову «скорость» — выделение продлится между ними.',
    text: 'Сначала точность, потом скорость, а награда придёт сама.',
    expected: 'точность, потом скорость',
  },
  {
    id: 'drag',
    instruction:
      'Зажми левую кнопку мыши в середине слова «Перетаскивание» и, не отпуская, веди курсор до середины слова «выделяет» — так, как двойной клик не смог бы: без привязки к границам слов.',
    text: 'Перетаскивание мышью выделяет любой произвольный кусок текста.',
    kind: 'freeform',
  },
];

const FIRST_XP = 10;
const FLAWLESS_XP = 15;
const MIN_FREEFORM_LEN = 6;

function normalize(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[.,!?;:"'«»()\-–—]+|[.,!?;:"'«»()\-–—]+$/g, '')
    .toLowerCase();
}

const LETTER = /[а-яёa-z]/i;

export function isFreeformValid(missionText: string, rawSelected: string): boolean {
  const selected = rawSelected.trim();
  if (selected.length < MIN_FREEFORM_LEN) return false;
  const idx = missionText.indexOf(selected);
  if (idx === -1) return false;
  const before = missionText[idx - 1];
  const after = missionText[idx + selected.length];
  return (
    idx > 0 &&
    after !== undefined &&
    LETTER.test(before ?? '') &&
    LETTER.test(after) &&
    LETTER.test(selected[0]) &&
    LETTER.test(selected[selected.length - 1])
  );
}

export function missionSolved(mission: SelectionMission, rawSelected: string): boolean {
  if (!rawSelected.trim()) return false;
  if (mission.kind === 'freeform') return isFreeformValid(mission.text, rawSelected);
  return normalize(rawSelected) === normalize(mission.expected ?? '');
}

export type SelectionSandboxProps = {
  missions?: SelectionMission[];
  chapterId?: string;
  trainerId?: string;
};

export default function SelectionSandbox({ missions = DEFAULT_MISSIONS, chapterId, trainerId }: SelectionSandboxProps) {
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastSelected, setLastSelected] = useState('');
  const [flash, setFlash] = useState<'ok' | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const rewardedRef = useRef(false);

  if (missions.length === 0) return null;

  const done = index >= missions.length;
  const current = done ? null : missions[index];

  const complete = (finalAttempts: number) => {
    if (!chapterId || !trainerId) return;
    const prev = store.getProgress().trainers[chapterId]?.[trainerId];
    const prevAttempts = (prev?.result as { attempts?: number } | undefined)?.attempts;
    const flawless = finalAttempts === missions.length;
    if (prevAttempts === undefined || finalAttempts < prevAttempts) {
      store.markTrainerDone(chapterId, trainerId, { total: missions.length, attempts: finalAttempts });
    }
    if (!prev) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    if (flawless && prevAttempts !== missions.length) {
      store.addXp(FLAWLESS_XP, `trainer-goal:${chapterId}:${trainerId}`);
    }
  };

  const checkSelection = () => {
    if (!current || typeof window === 'undefined') return;
    const sel = window.getSelection();
    const raw = sel ? sel.toString() : '';
    if (!raw.trim()) return; // простой клик без протяжки — не ошибка, просто игнорируем
    const anchor = sel?.anchorNode;
    if (!anchor || !zoneRef.current || !zoneRef.current.contains(anchor)) return;
    setLastSelected(raw);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (missionSolved(current, raw)) {
      setFlash('ok');
      setLastSelected('');
      window.getSelection()?.removeAllRanges();
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setHintShown(false);
      if (nextIndex >= missions.length) complete(nextAttempts);
    }
  };

  const reset = () => {
    setIndex(0);
    setAttempts(0);
    setLastSelected('');
    setFlash(null);
    setHintShown(false);
  };

  return (
    <div className="selsb">
      <div className="selsb-progress" aria-hidden="true">
        {missions.map((_, i) => (
          <span
            key={i}
            className={`selsb-dot ${i < index ? 'selsb-dot-done' : ''} ${i === index ? 'selsb-dot-current' : ''}`.trim()}
          />
        ))}
      </div>
      <p className="selsb-score">
        Выполнено: {index} из {missions.length}
      </p>

      {done ? (
        <div className="selsb-result" role="status">
          <span className="selsb-result-check" aria-hidden="true">✓</span>
          <p className="selsb-result-title">Готово! Выделение текста опробовано со всех сторон.</p>
          <button type="button" className="selsb-btn" onClick={reset}>
            Ещё раз
          </button>
        </div>
      ) : (
        <>
          <p className="selsb-task">{current!.instruction}</p>
          <div
            ref={zoneRef}
            className={`selsb-zone ${flash === 'ok' ? 'selsb-zone-ok' : ''}`.trim()}
            onMouseUp={checkSelection}
            onKeyUp={checkSelection}
          >
            <p className="selsb-text">{current!.text}</p>
          </div>

          {lastSelected ? (
            <p className="selsb-feedback" role="status">
              Сейчас выделено: <kbd className="keys-kbd">{lastSelected}</kbd>
            </p>
          ) : null}

          {hintShown ? (
            <p className="selsb-hint">
              Подсказка: {current!.kind === 'freeform'
                ? 'начни и закончи выделение прямо внутри слов, не на пробеле.'
                : `нужно выделить именно «${current!.expected}»`}
            </p>
          ) : (
            <button type="button" className="selsb-btn selsb-btn-ghost" onClick={() => setHintShown(true)}>
              Показать подсказку
            </button>
          )}
        </>
      )}
    </div>
  );
}
