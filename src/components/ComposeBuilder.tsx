import React, { useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// «Собери docker-compose.yml»: строки файла (с готовыми отступами) перемешаны,
// кликами выстраиваются в правильный порядок и вложенность.

const XP_SOLVE = 10;

/** Детерминированное перемешивание: SSR и гидрация дают одинаковый порядок. */
export function seededShuffle<T>(items: T[], key: string): T[] {
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

/** Перемешать индексы 0..n-1 так, чтобы не выпал сразу готовый ответ. */
export function shuffledIndices(n: number, key: string): number[] {
  let idx = seededShuffle(Array.from({ length: n }, (_, i) => i), key);
  if (n > 1 && idx.every((v, i) => v === i)) idx = [...idx.slice(1), idx[0]];
  return idx;
}

export default function ComposeBuilder({
  lines,
  chapterId,
  trainerId,
}: {
  /** Строки файла в правильном порядке, отступы — прямо в строках. */
  lines: string[];
  chapterId?: string;
  trainerId?: string;
}) {
  const [bank] = useState(() => shuffledIndices(lines.length, lines.join('\n')));
  const [picked, setPicked] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [gotXp, setGotXp] = useState(false);

  if (lines.length === 0) return null;

  const full = picked.length === lines.length;
  const firstWrong = full ? picked.findIndex((b, i) => bank[b] !== i) : -1;
  const wrong = full && !solved;

  const pick = (i: number) => {
    if (solved || full || picked.includes(i)) return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === lines.length && next.every((b, pos) => bank[b] === pos)) {
      setSolved(true);
      if (chapterId && trainerId) {
        const first = !store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { solved: true });
        if (first) {
          store.addXp(XP_SOLVE, `trainer:${chapterId}:${trainerId}`);
          setGotXp(true);
        }
      }
    }
  };

  const unpick = (pos: number) => {
    if (!solved) setPicked(picked.filter((_, k) => k !== pos));
  };

  return (
    <div className="cb">
      <div className="cb-file" aria-label="Твой docker-compose.yml">
        {picked.length === 0 ? (
          <span className="cb-placeholder">
            Нажимай строки внизу по порядку — отступы уже проставлены, следи за вложенностью
          </span>
        ) : (
          picked.map((i, pos) => (
            <button
              key={i}
              type="button"
              className="cb-line cb-line-picked"
              onClick={() => unpick(pos)}
              disabled={solved}
              title="Вернуть строку"
            >
              {lines[bank[i]]}
            </button>
          ))
        )}
      </div>

      {solved ? <p className="cb-ok">Выполнено! Файл собран правильно.{gotXp ? ` +${XP_SOLVE} XP` : ''}</p> : null}
      {wrong ? (
        <p className="cb-no">
          Строка {firstWrong + 1} не на своём месте. Вспомни: вложенность в YAML задаётся
          отступами — что глубже вложено, то правее. Нажми на строку, чтобы вернуть её вниз.
        </p>
      ) : null}

      <div className="cb-bank" aria-label="Строки файла">
        {bank.map((_, i) => (
          <button
            key={i}
            type="button"
            className="cb-line"
            onClick={() => pick(i)}
            disabled={solved || picked.includes(i)}
          >
            {lines[bank[i]]}
          </button>
        ))}
      </div>

      {picked.length > 0 && !solved ? (
        <button type="button" className="cb-reset" onClick={() => setPicked([])}>
          Сбросить
        </button>
      ) : null}
    </div>
  );
}
