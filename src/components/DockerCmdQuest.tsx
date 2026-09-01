import React, { useState } from 'react';
import { store } from '../lib/store';
import { shuffledIndices } from './ComposeBuilder';
import './trainers.css';

// Порядок команд запуска сети: карточки перетасованы, кликами выстраивается
// последовательность, проверка — с объяснением каждого шага.

const XP_SOLVE = 15;

export type CmdStep = {
  cmd: string;
  why: string;
};

export default function DockerCmdQuest({
  steps,
  chapterId,
  trainerId,
}: {
  /** Шаги в правильном порядке. */
  steps: CmdStep[];
  chapterId?: string;
  trainerId?: string;
}) {
  const [bank] = useState(() => shuffledIndices(steps.length, steps.map((s) => s.cmd).join('|')));
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [gotXp, setGotXp] = useState(false);

  if (steps.length === 0) return null;

  const full = picked.length === steps.length;
  const firstWrong = picked.findIndex((b, pos) => bank[b] !== pos);

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
    if (firstWrong === -1) {
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
      <div className="dcq">
        <div className="dcq-done">Выполнено! Порядок верный.{gotXp ? ` +${XP_SOLVE} XP` : ''}</div>
        <ol className="dcq-explain">
          {steps.map((s) => (
            <li key={s.cmd}>
              <code>{s.cmd}</code> — {s.why}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="dcq">
      <div className="dcq-seq" aria-label="Твой порядок команд">
        {picked.length === 0 ? (
          <span className="dcq-placeholder">
            Выстрой команды в порядке работы с сетью: клик по карточке внизу добавляет её сюда
          </span>
        ) : (
          picked.map((i, pos) => (
            <button
              key={i}
              type="button"
              className="dcq-card dcq-card-picked"
              onClick={() => unpick(pos)}
              title="Вернуть карточку"
            >
              <span className="dcq-num">{pos + 1}</span>
              <code>{steps[bank[i]].cmd}</code>
            </button>
          ))
        )}
      </div>

      {checked && firstWrong !== -1 ? (
        <p className="dcq-no">
          Шаг {firstWrong + 1} не на своём месте. Подсказка: сначала у нод должны появиться
          конфиги и ключи, останавливают сеть в самом конце.
        </p>
      ) : null}

      <div className="dcq-bank" aria-label="Карточки команд">
        {bank.map((_, i) => (
          <button
            key={i}
            type="button"
            className="dcq-card"
            onClick={() => pick(i)}
            disabled={picked.includes(i)}
          >
            <code>{steps[bank[i]].cmd}</code>
          </button>
        ))}
      </div>

      <button type="button" className="dcq-check" onClick={check} disabled={!full}>
        Проверить порядок
      </button>
    </div>
  );
}
