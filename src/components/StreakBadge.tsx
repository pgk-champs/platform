import React from 'react';
import { plural } from '../lib/plural';
import './vessels.css';

// Серия вызовов дня. Раньше это была строка с эмодзи-огоньками; теперь — неделя
// ячеек, которые заполняются так же, как сосуды глав, и красятся теми же
// переменными темы. Скин задаёт --st-*, разметка одна на все оформления.
//
// Ячеек ровно семь: это шкала серии, а не календарь. Истории по дням store не
// хранит, и делать вид, что это прошедшая неделя, было бы враньём.
export const PIPS = 7;

export default function StreakBadge({
  streak,
  multiplier,
}: {
  streak: number;
  multiplier: number;
}): React.ReactElement {
  const lit = Math.max(0, Math.min(streak, PIPS));

  return (
    <div className="st" role="group" aria-label={`Серия: ${streak}`}>
      <div className="st-pips" aria-hidden="true">
        {Array.from({ length: PIPS }, (_, i) => (
          <i key={i} className={i < lit ? 'st-pip on' : 'st-pip'} />
        ))}
      </div>

      {streak > 0 ? (
        <span className="st-count">
          <b>{streak}</b>{' '}
          <span data-testid="streak-word">{plural(streak, 'день', 'дня', 'дней')} подряд</span>
        </span>
      ) : (
        <span className="st-count st-empty">Начни серию</span>
      )}

      {multiplier > 1 && (
        <span
          className="st-mult"
          title="Бонус к XP за серию вызовов дня — действует на любое начисление"
        >
          ×{multiplier.toFixed(2).replace(/\.?0+$/, '')} XP
        </span>
      )}
    </div>
  );
}
