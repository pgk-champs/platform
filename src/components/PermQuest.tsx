import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import { toLetters } from './ChmodCalc';
import './trainers.css';

// Мини-квест по правам доступа: сценарии «может ли пользователь X сделать Y
// с файлом Z», ответ → объяснение → следующий сценарий.

export type PermAction = 'read' | 'write' | 'execute';
export type PermAnswer = 'yes' | 'no' | 'read-only';

export type PermScenario = {
  file: string;
  /** Восьмеричные права файла, например '640'. */
  perm: string;
  owner: string;
  group: string;
  /** Кто пытается выполнить действие. */
  user: string;
  userGroups: string[];
  action: PermAction;
  correct: PermAnswer;
  why: string;
};

const ACTION_RU: Record<PermAction, string> = {
  read: 'прочитать',
  write: 'изменить',
  execute: 'запустить',
};

const ANSWERS: { id: PermAnswer; label: string }[] = [
  { id: 'yes', label: 'Да' },
  { id: 'no', label: 'Нет' },
  { id: 'read-only', label: 'Только прочитать' },
];

const PERFECT_XP = 25;

export default function PermQuest({
  scenarios,
  chapterId,
  trainerId,
}: {
  scenarios: PermScenario[];
  /** Опциональны: без них квест работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<PermAnswer | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const rewardedRef = useRef(false);

  const total = scenarios.length;
  if (total === 0) return null;

  const s = scenarios[idx];
  const solved = picked === s.correct;

  const pick = (a: PermAnswer) => {
    if (picked) return;
    setPicked(a);
    if (a === s.correct) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    if (chapterId && trainerId) {
      store.markTrainerDone(chapterId, trainerId, { correct: correctCount, total });
      if (correctCount === total && !rewardedRef.current) {
        rewardedRef.current = true;
        store.addXp(PERFECT_XP, `trainer:${chapterId}:${trainerId}`);
      }
    }
  };

  const retry = () => {
    setIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setFinished(false);
  };

  if (finished) {
    const perfect = correctCount === total;
    return (
      <div className="pq">
        {perfect ? (
          <div className="pq-final pq-final-perfect">
            ✓ Все сценарии пройдены: {correctCount} из {total}!
            {chapterId && trainerId ? ` +${PERFECT_XP} XP` : ''}
          </div>
        ) : (
          <>
            <div className="pq-final">
              Верно {correctCount} из {total}. Перечитай объяснения — и попробуй ещё раз.
            </div>
            <button type="button" className="pq-next" onClick={retry}>
              Попробовать ещё раз
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pq">
      <div className="pq-progress">
        Сценарий {idx + 1} из {total}
      </div>

      <div className="pq-file">
        <code className="pq-perm">
          {s.perm} · {toLetters(parseInt(s.perm, 8))}
        </code>
        <div>
          Файл <code>{s.file}</code> — владелец <b>{s.owner}</b>, группа <b>{s.group}</b>
        </div>
      </div>

      <div className="pq-user">
        Пользователь <b>{s.user}</b>
        {s.userGroups.length > 0 ? <> (в группах: {s.userGroups.join(', ')})</> : ' (без групп файла)'}
      </div>

      <div className="pq-q">{`Может ли ${s.user} ${ACTION_RU[s.action]} ${s.file}?`}</div>

      <div className="pq-answers">
        {ANSWERS.map(({ id, label }) => {
          const cls = picked ? (id === s.correct ? 'pq-right' : id === picked ? 'pq-wrong' : '') : '';
          return (
            <button
              key={id}
              type="button"
              className={`pq-answer ${cls}`.trim()}
              disabled={!!picked}
              onClick={() => pick(id)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {picked ? (
        <div className={`pq-feedback ${solved ? 'pq-ok' : 'pq-no'}`}>
          <b>{solved ? 'Верно!' : 'Не совсем.'}</b> {s.why}
          <div>
            <button type="button" className="pq-next" onClick={next}>
              {idx + 1 < total ? 'Дальше →' : 'Показать результат'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
