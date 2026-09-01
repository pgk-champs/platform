import React, { useMemo, useState } from 'react';
import './trainers.css';

// Витринный виджет главы печати: ANSI-раскладка, пять рядов. Пропсы-режимы
// можно комбинировать: zones красит клавиши по зонам пальцев (легенда снизу,
// тултип по hover/фокусу), highlight подсвечивает конкретные клавиши
// (например ['F','J'] для «найди на ощупь»), symbols показывает верхний
// регистр Shift поверх базового символа, nextKey/activeKey — live-режим
// (см. CodeTyping: связка тренажёра печати с клавиатурой).

type Finger =
  | 'l-pinky'
  | 'l-ring'
  | 'l-middle'
  | 'l-index'
  | 'r-index'
  | 'r-middle'
  | 'r-ring'
  | 'r-pinky'
  | 'thumb';

type KeyDef = { id: string; label: string; shiftLabel?: string; w: number; finger: Finger };

const FINGER_LABEL: Record<Finger, string> = {
  'l-pinky': 'мизинец левой руки',
  'l-ring': 'безымянный левой руки',
  'l-middle': 'средний левой руки',
  'l-index': 'указательный левой руки',
  'r-index': 'указательный правой руки',
  'r-middle': 'средний правой руки',
  'r-ring': 'безымянный правой руки',
  'r-pinky': 'мизинец правой руки',
  thumb: 'большой палец',
};

// Порядок легенды соответствует kb-f1..kb-f8 в trainers.css.
const LEGEND_ORDER: Finger[] = [
  'l-pinky',
  'l-ring',
  'l-middle',
  'l-index',
  'r-index',
  'r-middle',
  'r-ring',
  'r-pinky',
];

const FINGER_CLASS: Record<Finger, string> = {
  'l-pinky': 'kb-f1',
  'l-ring': 'kb-f2',
  'l-middle': 'kb-f3',
  'l-index': 'kb-f4',
  'r-index': 'kb-f5',
  'r-middle': 'kb-f6',
  'r-ring': 'kb-f7',
  'r-pinky': 'kb-f8',
  thumb: 'kb-f-thumb',
};

// Ряды и зоны пальцев — по той же схеме, что в таблице «домашний ряд» главы печати.
const ROWS: KeyDef[][] = [
  [
    { id: '`', label: '`', shiftLabel: '~', w: 1, finger: 'l-pinky' },
    { id: '1', label: '1', shiftLabel: '!', w: 1, finger: 'l-pinky' },
    { id: '2', label: '2', shiftLabel: '@', w: 1, finger: 'l-ring' },
    { id: '3', label: '3', shiftLabel: '#', w: 1, finger: 'l-middle' },
    { id: '4', label: '4', shiftLabel: '$', w: 1, finger: 'l-index' },
    { id: '5', label: '5', shiftLabel: '%', w: 1, finger: 'l-index' },
    { id: '6', label: '6', shiftLabel: '^', w: 1, finger: 'r-index' },
    { id: '7', label: '7', shiftLabel: '&', w: 1, finger: 'r-index' },
    { id: '8', label: '8', shiftLabel: '*', w: 1, finger: 'r-middle' },
    { id: '9', label: '9', shiftLabel: '(', w: 1, finger: 'r-ring' },
    { id: '0', label: '0', shiftLabel: ')', w: 1, finger: 'r-pinky' },
    { id: '-', label: '-', shiftLabel: '_', w: 1, finger: 'r-pinky' },
    { id: '=', label: '=', shiftLabel: '+', w: 1, finger: 'r-pinky' },
    { id: 'Backspace', label: '⌫', w: 2, finger: 'r-pinky' },
  ],
  [
    { id: 'Tab', label: 'Tab', w: 1.5, finger: 'l-pinky' },
    { id: 'Q', label: 'Q', w: 1, finger: 'l-pinky' },
    { id: 'W', label: 'W', w: 1, finger: 'l-ring' },
    { id: 'E', label: 'E', w: 1, finger: 'l-middle' },
    { id: 'R', label: 'R', w: 1, finger: 'l-index' },
    { id: 'T', label: 'T', w: 1, finger: 'l-index' },
    { id: 'Y', label: 'Y', w: 1, finger: 'r-index' },
    { id: 'U', label: 'U', w: 1, finger: 'r-index' },
    { id: 'I', label: 'I', w: 1, finger: 'r-middle' },
    { id: 'O', label: 'O', w: 1, finger: 'r-ring' },
    { id: 'P', label: 'P', w: 1, finger: 'r-pinky' },
    { id: '[', label: '[', shiftLabel: '{', w: 1, finger: 'r-pinky' },
    { id: ']', label: ']', shiftLabel: '}', w: 1, finger: 'r-pinky' },
    { id: '\\', label: '\\', shiftLabel: '|', w: 1.5, finger: 'r-pinky' },
  ],
  [
    { id: 'CapsLock', label: 'Caps Lock', w: 1.75, finger: 'l-pinky' },
    { id: 'A', label: 'A', w: 1, finger: 'l-pinky' },
    { id: 'S', label: 'S', w: 1, finger: 'l-ring' },
    { id: 'D', label: 'D', w: 1, finger: 'l-middle' },
    { id: 'F', label: 'F', w: 1, finger: 'l-index' },
    { id: 'G', label: 'G', w: 1, finger: 'l-index' },
    { id: 'H', label: 'H', w: 1, finger: 'r-index' },
    { id: 'J', label: 'J', w: 1, finger: 'r-index' },
    { id: 'K', label: 'K', w: 1, finger: 'r-middle' },
    { id: 'L', label: 'L', w: 1, finger: 'r-ring' },
    { id: ';', label: ';', shiftLabel: ':', w: 1, finger: 'r-pinky' },
    { id: "'", label: "'", shiftLabel: '"', w: 1, finger: 'r-pinky' },
    { id: 'Enter', label: 'Enter', w: 2.25, finger: 'r-pinky' },
  ],
  [
    { id: 'Shift-L', label: 'Shift', w: 2.25, finger: 'l-pinky' },
    { id: 'Z', label: 'Z', w: 1, finger: 'l-pinky' },
    { id: 'X', label: 'X', w: 1, finger: 'l-ring' },
    { id: 'C', label: 'C', w: 1, finger: 'l-middle' },
    { id: 'V', label: 'V', w: 1, finger: 'l-index' },
    { id: 'B', label: 'B', w: 1, finger: 'l-index' },
    { id: 'N', label: 'N', w: 1, finger: 'r-index' },
    { id: 'M', label: 'M', w: 1, finger: 'r-index' },
    { id: ',', label: ',', shiftLabel: '<', w: 1, finger: 'r-middle' },
    { id: '.', label: '.', shiftLabel: '>', w: 1, finger: 'r-ring' },
    { id: '/', label: '/', shiftLabel: '?', w: 1, finger: 'r-pinky' },
    { id: 'Shift-R', label: 'Shift', w: 2.75, finger: 'r-pinky' },
  ],
  [
    { id: 'Ctrl-L', label: 'Ctrl', w: 1.25, finger: 'l-pinky' },
    { id: 'Win-L', label: 'Win', w: 1.25, finger: 'thumb' },
    { id: 'Alt-L', label: 'Alt', w: 1.25, finger: 'thumb' },
    { id: 'Space', label: 'Пробел', w: 6.25, finger: 'thumb' },
    { id: 'Alt-R', label: 'Alt', w: 1.25, finger: 'thumb' },
    { id: 'Win-R', label: 'Win', w: 1.25, finger: 'thumb' },
    { id: 'Menu', label: 'Menu', w: 1.25, finger: 'thumb' },
    { id: 'Ctrl-R', label: 'Ctrl', w: 1.25, finger: 'r-pinky' },
  ],
];

const UNIT = 50;
const GAP = 6;
const PAD = 12;

// Символ → базовая клавиша (+ нужен ли Shift). Буквы и пробел — особые
// случаи (нет отдельной «строчной» клавиши на схеме), остальное ищем по
// label/shiftLabel самих клавиш. Используется live-режимом (CodeTyping).
export function charToKey(ch: string): { id: string; shift: boolean } | null {
  if (ch === ' ') return { id: 'Space', shift: false };
  if (/[a-z]/.test(ch)) return { id: ch.toUpperCase(), shift: false };
  if (/[A-Z]/.test(ch)) return { id: ch, shift: true };
  for (const row of ROWS) {
    for (const key of row) {
      if (key.label === ch) return { id: key.id, shift: false };
      if (key.shiftLabel === ch) return { id: key.id, shift: true };
    }
  }
  return null;
}

export type InteractiveKeyboardProps = {
  /** Красит клавиши по зонам пальцев + легенда снизу + тултип с именем пальца. */
  zones?: boolean;
  /** Подсвечивает переданные id клавиш (регистронезависимо), например ['F', 'J']. */
  highlight?: string[];
  /** Показывает верхний символ Shift маленькой подписью над основным. */
  symbols?: boolean;
  /** Live-режим: id клавиши, ожидаемой следующей (можно передать пару — базовая клавиша + Shift-L/Shift-R). Пульсирующая рамка. */
  nextKey?: string | string[];
  /** Затемняет остальные клавиши, пока задан nextKey. */
  dim?: boolean;
  /** Live-режим: клавиша последнего нажатия. */
  activeKey?: string;
  /** Верно ('ok') или неверно ('err') был нажат activeKey — красит «вдавленную» заливку. */
  activeState?: 'ok' | 'err';
};

export default function InteractiveKeyboard({
  zones = false,
  highlight,
  symbols = false,
  nextKey,
  dim = false,
  activeKey,
  activeState,
}: InteractiveKeyboardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const highlightSet = useMemo(() => new Set((highlight ?? []).map((h) => h.toUpperCase())), [highlight]);
  const nextIds = useMemo(
    () => (Array.isArray(nextKey) ? nextKey : nextKey ? [nextKey] : []).map((id) => id.toUpperCase()),
    [nextKey],
  );
  const nextSet = useMemo(() => new Set(nextIds), [nextIds]);
  const activeKeyId = activeKey?.toUpperCase();

  // x-координата в рендере ниже добавляет GAP ПОСЛЕ каждой клавиши (включая
  // последнюю в ряду), поэтому реальный правый край ряда шире простой суммы
  // w*UNIT на GAP*(n-1). Без этой поправки viewBox был у́же фактической
  // раскладки, и крайние правые клавиши (Backspace, Enter, Shift, Ctrl)
  // обрезались самим svg — на любой ширине контейнера, не только на узких.
  const width = Math.max(
    ...ROWS.map((row) => PAD * 2 + row.reduce((sum, k) => sum + k.w * UNIT, 0) + GAP * (row.length - 1)),
  );
  const height = ROWS.length * UNIT + (ROWS.length - 1) * GAP + PAD * 2;

  const describe = (key: KeyDef): string =>
    zones ? `клавиша ${key.label} — палец: ${FINGER_LABEL[key.finger]}` : `клавиша ${key.label}`;

  const allKeys = ROWS.flat();
  const active = activeId ? allKeys.find((k) => k.id === activeId) ?? null : null;

  // Основная (не-Shift) следующая клавиша — для подписи пальца в статус-строке.
  const primaryNextId = nextIds.find((id) => id !== 'SHIFT-L' && id !== 'SHIFT-R');
  const primaryNextKey = primaryNextId ? allKeys.find((k) => k.id.toUpperCase() === primaryNextId) : undefined;
  const nextHasShift = nextIds.includes('SHIFT-L') || nextIds.includes('SHIFT-R');
  const nextCaption = primaryNextKey
    ? `следующая: ${primaryNextKey.label} — ${FINGER_LABEL[primaryNextKey.finger]}${nextHasShift ? ' (+ Shift)' : ''}`
    : null;

  return (
    <div className="kb">
      <div className="kb-wrap">
        <svg
          className="kb-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Интерактивная клавиатура: наведите или сфокусируйте клавишу для подсказки"
        >
          {ROWS.map((row, ri) => {
            let x = PAD;
            const y = PAD + ri * (UNIT + GAP);
            return (
              <g key={ri}>
                {row.map((key) => {
                  const kx = x;
                  const kw = key.w * UNIT;
                  x += kw + GAP;
                  const idUpper = key.id.toUpperCase();
                  const isHighlighted = highlightSet.has(idUpper);
                  const isNext = nextSet.has(idUpper);
                  const isActive = !!activeKeyId && activeKeyId === idUpper;
                  const isDimmed = dim && nextSet.size > 0 && !isNext && !isActive;
                  const cls = [
                    'kb-key',
                    zones ? FINGER_CLASS[key.finger] : '',
                    isHighlighted ? 'kb-key-highlight' : '',
                    isNext ? 'kb-key-next' : '',
                    isActive && activeState === 'err' ? 'kb-key-active-err' : '',
                    isActive && activeState !== 'err' ? 'kb-key-active-ok' : '',
                    isDimmed ? 'kb-key-dim' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  const showShift = symbols && !!key.shiftLabel;
                  const mainY = showShift ? y + UNIT - 10 : y + UNIT / 2 + 5;
                  return (
                    <g
                      key={key.id}
                      className={cls}
                      tabIndex={0}
                      role="img"
                      aria-label={describe(key)}
                      onMouseEnter={() => setActiveId(key.id)}
                      onMouseLeave={() => setActiveId((cur) => (cur === key.id ? null : cur))}
                      onFocus={() => setActiveId(key.id)}
                      onBlur={() => setActiveId((cur) => (cur === key.id ? null : cur))}
                    >
                      <title>{describe(key)}</title>
                      <rect x={kx} y={y} width={kw} height={UNIT} rx={6} />
                      {showShift ? (
                        <text x={kx + 8} y={y + 16} className="kb-key-shift">
                          {key.shiftLabel}
                        </text>
                      ) : null}
                      <text x={kx + kw / 2} y={mainY} textAnchor="middle" className="kb-key-label">
                        {key.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="kb-tooltip" role="status" aria-live="polite">
        {active ? describe(active) : (nextCaption ?? ' ')}
      </div>

      {zones ? (
        <ul className="kb-legend">
          {LEGEND_ORDER.map((f) => (
            <li key={f} className="kb-legend-item">
              <span className={`kb-legend-swatch ${FINGER_CLASS[f]}`} aria-hidden="true" />
              {FINGER_LABEL[f]}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
