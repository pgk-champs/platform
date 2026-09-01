import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Конструктор сообщения коммита: живой чек-лист правил из главы плюс три задания
// «опиши коммит для ситуации» — проверка по правилам, а не по точному тексту.

export const ACTION_VERBS = [
  'add', 'fix', 'remove', 'update', 'create', 'delete', 'rename', 'move', 'change',
  'improve', 'refactor', 'use', 'make', 'set', 'show', 'hide', 'ignore', 'clean',
  'split', 'merge', 'implement', 'write', 'drop', 'replace', 'extract', 'restore', 'revert',
];

export type MsgRule = { id: string; label: string; ok: boolean };

export function checkMessage(msg: string): MsgRule[] {
  const trimmed = msg.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const first = (words[0] ?? '').toLowerCase();
  return [
    {
      id: 'verb',
      label: 'начинается с глагола-действия по-английски: add, fix, remove, update…',
      ok: ACTION_VERBS.includes(first),
    },
    {
      id: 'what',
      label: 'после глагола сказано, что именно сделано (не просто «fix» или «123»)',
      ok: words.length >= 2,
    },
    {
      id: 'len',
      label: 'не длиннее 50 символов',
      ok: trimmed.length > 0 && trimmed.length <= 50,
    },
    {
      id: 'dot',
      label: 'без точки в конце',
      ok: trimmed.length > 0 && !trimmed.endsWith('.'),
    },
  ];
}

export const MSG_TASKS = [
  'Ты дописал в main.py строку, которая спрашивает имя пользователя.',
  'Ты добавил notes.txt в .gitignore, чтобы черновик больше не мелькал в git status.',
  'Ты исправил опечатку в тексте приветствия в main.py.',
];

const DONE_XP = 25;

export default function CommitMsgBuilder({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них тренажёр работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [msg, setMsg] = useState('');
  const [finished, setFinished] = useState(false);
  const rewardedRef = useRef(false);

  const total = MSG_TASKS.length;
  const rules = checkMessage(msg);
  const allOk = rules.every((r) => r.ok);
  const len = msg.trim().length;

  const submit = () => {
    if (!allOk) return;
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setMsg('');
      return;
    }
    setFinished(true);
    if (chapterId && trainerId) {
      store.markTrainerDone(chapterId, trainerId, { done: total, total });
      if (!rewardedRef.current) {
        rewardedRef.current = true;
        store.addXp(DONE_XP, `trainer:${chapterId}:${trainerId}`);
      }
    }
  };

  if (finished) {
    return (
      <div className="cmb">
        <div className="cmb-final">
          ✓ Выполнено! Три сообщения — по всем правилам главы.
          {chapterId && trainerId ? ` +${DONE_XP} XP` : ''}
        </div>
      </div>
    );
  }

  return (
    <div className="cmb">
      <div className="cmb-progress">
        Задание {idx + 1} из {total}
      </div>

      <div className="cmb-task">{MSG_TASKS[idx]}</div>
      <div className="cmb-q">Опиши этот коммит одним сообщением — так, чтобы загорелись все четыре правила:</div>

      <div className="cmb-cmd">
        <code>git commit -m "</code>
        <input
          className="cmb-input"
          type="text"
          value={msg}
          placeholder="сообщение коммита"
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <code>"</code>
        <span className={len > 50 ? 'cmb-count cmb-count-over' : 'cmb-count'}>{len}/50</span>
      </div>

      <ul className="cmb-rules">
        {rules.map((r) => (
          <li key={r.id} className={r.ok ? 'cmb-rule cmb-rule-ok' : 'cmb-rule'}>
            {r.ok ? '✓' : '·'} {r.label}
          </li>
        ))}
      </ul>

      <button type="button" className="cmb-next" disabled={!allOk} onClick={submit}>
        {idx + 1 < total ? 'Зачесть коммит →' : 'Зачесть последний коммит'}
      </button>
    </div>
  );
}
