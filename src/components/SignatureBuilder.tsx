import React, { useMemo, useState } from 'react';
import { store } from '../lib/store';
import { shuffledIndices } from './ComposeBuilder';
import './trainers.css';

// Сборка сигнатуры функции из чипов-кусочков: клик по чипу в банке добавляет
// его в конец, клик по собранному чипу возвращает обратно. Несколько заданий
// нарастающей сложности; проверка — сравнение собранной строки с целевой,
// поэтому одинаковые чипы (два String) взаимозаменяемы.

const XP_SOLVE = 20;

export type SigTask = {
  /** Текст задания. */
  brief: string;
  /** Кусочки сигнатуры в правильном порядке (с пробелами); цель — их конкатенация. */
  pieces: string[];
};

export default function SignatureBuilder({
  tasks,
  chapterId,
  trainerId,
}: {
  tasks: SigTask[];
  chapterId?: string;
  trainerId?: string;
}) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [taskSolved, setTaskSolved] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [gotXp, setGotXp] = useState(false);

  const task = tasks[taskIdx];
  const bank = useMemo(
    () => (task ? shuffledIndices(task.pieces.length, task.pieces.join('|')) : []),
    [task],
  );

  if (!task) return null;

  const target = task.pieces.join('');
  const assembled = picked.map((i) => task.pieces[bank[i]]).join('');
  const full = picked.length === task.pieces.length;
  const isLast = taskIdx === tasks.length - 1;

  const pick = (i: number) => {
    if (taskSolved || full || picked.includes(i)) return;
    setPicked([...picked, i]);
    setChecked(false);
  };

  const unpick = (pos: number) => {
    if (taskSolved) return;
    setPicked(picked.filter((_, k) => k !== pos));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (assembled !== target) return;
    setTaskSolved(true);
    if (isLast) {
      setAllDone(true);
      if (chapterId && trainerId) {
        const first = !store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { solved: true, tasks: tasks.length });
        if (first) {
          store.addXp(XP_SOLVE, `trainer:${chapterId}:${trainerId}`);
          setGotXp(true);
        }
      }
    }
  };

  const next = () => {
    setTaskIdx(taskIdx + 1);
    setPicked([]);
    setChecked(false);
    setTaskSolved(false);
  };

  if (allDone) {
    return (
      <div className="sgb">
        <div className="sgb-done">
          Выполнено! Все сигнатуры собраны.{gotXp ? ` +${XP_SOLVE} XP` : ''}
        </div>
        <ol className="sgb-explain">
          {tasks.map((t) => (
            <li key={t.brief}>
              {t.brief} — <code>{t.pieces.join('')}</code>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="sgb">
      <p className="sgb-brief">
        <strong>
          Задание {taskIdx + 1} из {tasks.length}.
        </strong>{' '}
        {task.brief}
      </p>

      <div className="sgb-seq" aria-label="Собранная сигнатура">
        {picked.length === 0 ? (
          <span className="sgb-placeholder">
            Кликай по кусочкам внизу в правильном порядке — сигнатура соберётся здесь
          </span>
        ) : (
          picked.map((i, pos) => (
            <button
              key={i}
              type="button"
              className="sgb-chip sgb-chip-picked"
              onClick={() => unpick(pos)}
              title="Вернуть кусочек в банк"
            >
              <code>{task.pieces[bank[i]]}</code>
            </button>
          ))
        )}
      </div>

      {picked.length > 0 ? (
        <pre className="sgb-code" aria-label="Собранный код">
          <code>{assembled}</code>
        </pre>
      ) : null}

      {checked && assembled !== target ? (
        <p className="sgb-no">
          Пока не то: собранная строка не совпадает с заданием. Клик по кусочку сверху
          возвращает его в банк — сверь порядок с разборами сигнатур выше.
        </p>
      ) : null}

      {taskSolved ? (
        <div className="sgb-ok">
          Верно! <code>{target}</code>
          <button type="button" className="sgb-check" onClick={next}>
            Следующее задание
          </button>
        </div>
      ) : (
        <>
          <div className="sgb-bank" aria-label="Банк кусочков">
            {bank.map((_, i) => (
              <button
                key={i}
                type="button"
                className="sgb-chip"
                onClick={() => pick(i)}
                disabled={picked.includes(i)}
              >
                <code>{task.pieces[bank[i]]}</code>
              </button>
            ))}
          </div>
          <button type="button" className="sgb-check" onClick={check} disabled={!full}>
            Проверить сигнатуру
          </button>
        </>
      )}
    </div>
  );
}
