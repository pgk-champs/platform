import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Глазомер по макету: SVG-карточка товара из главы нарисована в масштабе
// 1px = 1dp; клик по пронумерованному маркеру → «сколько dp/sp?» → допуск ±4.

type EyeTarget = {
  id: string;
  label: string;
  unit: 'dp' | 'sp';
  answer: number;
  /** Откуда правильное значение в главе. */
  source: string;
};

const TARGETS: EyeTarget[] = [
  { id: 'padding', label: 'Отступ карточки', unit: 'dp', answer: 12, source: 'Dimens.CardPadding' },
  { id: 'gap', label: 'Зазор между строками карточки', unit: 'dp', answer: 8, source: 'Arrangement.spacedBy(8.dp)' },
  { id: 'price', label: 'Размер шрифта цены', unit: 'sp', answer: 18, source: 'Dimens.PriceFontSize' },
  { id: 'radius', label: 'Скругление углов карточки', unit: 'dp', answer: 8, source: 'радиус скругления с макета' },
];

const TOLERANCE = 4;
const PERFECT_XP = 25;

type Answered = Record<string, { given: number; ok: boolean }>;

// Геометрия SVG, 1px = 1dp: карточка 300×210, отступ 12, изображение 120,
// зазоры между строками 8, скругление 8.
const MARKERS: Record<string, { cx: number; cy: number }> = {
  padding: { cx: 16, cy: 82 },
  gap: { cx: 160, cy: 146 },
  price: { cx: 96, cy: 188 },
  radius: { cx: 310, cy: 10 },
};

export default function EyeDp({ chapterId, trainerId }: { chapterId?: string; trainerId?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState<Answered>({});
  const rewardedRef = useRef(false);

  const total = TARGETS.length;
  const doneCount = Object.keys(answered).length;
  const correctCount = Object.values(answered).filter((a) => a.ok).length;
  const finished = doneCount === total;
  const perfect = finished && correctCount === total;
  const activeTarget = active ? TARGETS.find((t) => t.id === active) ?? null : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTarget || answered[activeTarget.id]) return;
    const given = Number(value);
    if (!value.trim() || Number.isNaN(given)) return;
    const ok = Math.abs(given - activeTarget.answer) <= TOLERANCE;
    const next = { ...answered, [activeTarget.id]: { given, ok } };
    setAnswered(next);
    setValue('');
    setActive(null);
    if (Object.keys(next).length === total && chapterId && trainerId) {
      const correct = Object.values(next).filter((a) => a.ok).length;
      store.markTrainerDone(chapterId, trainerId, { correct, total });
      if (correct === total && !rewardedRef.current) {
        rewardedRef.current = true;
        store.addXp(PERFECT_XP, `trainer:${chapterId}:${trainerId}`);
      }
    }
  };

  const retry = () => {
    setAnswered({});
    setActive(null);
    setValue('');
  };

  const pick = (id: string) => {
    if (answered[id] || finished) return;
    setActive(id);
    setValue('');
  };

  return (
    <div className="edp">
      <div className="edp-hint">
        Карточка нарисована в масштабе 1px = 1dp. Кликни по маркеру и прикинь размер на глаз — допуск ±{TOLERANCE}.
      </div>

      <svg viewBox="0 0 340 234" className="edp-svg" role="img" aria-label="Макет карточки товара">
        {/* карточка */}
        <rect x="10" y="10" width="300" height="212" rx="8" className="edp-card" />
        {/* изображение (отступ карточки 12) */}
        <rect x="22" y="22" width="276" height="120" className="edp-image" />
        {/* бейдж скидки */}
        <rect x="254" y="22" width="44" height="20" className="edp-badge" />
        <text x="276" y="36" textAnchor="middle" className="edp-badge-text" fontSize="12">
          -20%
        </text>
        {/* заголовок: зазор 8 под изображением */}
        <text x="22" y="163" className="edp-text" fontSize="16">
          Кроссовки беговые
        </text>
        {/* ряд цены: зазор 8 под заголовком */}
        <text x="22" y="194" className="edp-text edp-price" fontSize="18">
          1 990 ₽
        </text>
        <rect x="212" y="176" width="86" height="28" rx="6" className="edp-btn" />
        <text x="255" y="194" textAnchor="middle" className="edp-btn-text" fontSize="12">
          В корзину
        </text>

        {TARGETS.map((t, i) => {
          const m = MARKERS[t.id];
          const a = answered[t.id];
          const cls = a ? (a.ok ? 'edp-marker-ok' : 'edp-marker-bad') : active === t.id ? 'edp-marker-active' : '';
          return (
            <g
              key={t.id}
              role="button"
              tabIndex={0}
              aria-label={t.label}
              className={`edp-marker ${cls}`.trim()}
              onClick={() => pick(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') pick(t.id);
              }}
            >
              <circle cx={m.cx} cy={m.cy} r="11" />
              <text x={m.cx} y={m.cy + 4} textAnchor="middle" fontSize="11">
                {a ? (a.ok ? '✓' : '✗') : i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {activeTarget && !finished ? (
        <form className="edp-form" onSubmit={submit}>
          <span>
            {activeTarget.label}: сколько {activeTarget.unit}?
          </span>
          <input
            type="number"
            aria-label="Твой ответ"
            className="edp-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className="edp-check">
            Проверить
          </button>
        </form>
      ) : null}

      {doneCount > 0 ? (
        <ul className="edp-results">
          {TARGETS.filter((t) => answered[t.id]).map((t) => {
            const a = answered[t.id];
            return (
              <li key={t.id} className={a.ok ? 'edp-res-ok' : 'edp-res-bad'}>
                {a.ok
                  ? `Верно! ${t.label} — ${t.answer}${t.unit} (${t.source})`
                  : `Не совсем: ${t.label} — не ${a.given}, а ${t.answer}${t.unit} (${t.source})`}
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="edp-progress">Найдено размеров: {correctCount} из {total}</div>

      {finished ? (
        perfect ? (
          <div className="edp-done">
            Выполнено! Глазомер {correctCount} из {total}.{chapterId && trainerId ? ` +${PERFECT_XP} XP` : ''}
          </div>
        ) : (
          <div className="edp-final">
            Верно {correctCount} из {total}. Сверься с Dimens главы — и попробуй ещё раз.
            <div>
              <button type="button" className="edp-check" onClick={retry}>
                Попробовать ещё раз
              </button>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
