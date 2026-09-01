import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// «Что попадёт в коммит?» — три дословных вывода git status из главы;
// клик по строкам вывода отмечает то, что войдёт в снимок при git commit прямо сейчас.

export type StatusTask = {
  intro: string;
  /** Дословный вывод git status, по строке на элемент; '' — пустая строка вывода. */
  lines: string[];
  /** Индексы строк, которые попадут в коммит при git commit прямо сейчас. */
  commit: number[];
  why: string;
};

export const STATUS_TASKS: StatusTask[] = [
  {
    intro: 'В свежем репозитории только что создали main.py:',
    lines: [
      'On branch master',
      '',
      'No commits yet',
      '',
      'Untracked files:',
      '  (use "git add <file>..." to include in what will be committed)',
      '\tmain.py',
      '',
      'nothing added to commit but untracked files present (use "git add" to track)',
    ],
    commit: [],
    why: 'Ничего: main.py — untracked, индекс пуст. git commit прямо сейчас вообще не создаст коммит — сначала нужен git add main.py.',
  },
  {
    intro: 'Выполнили git add main.py:',
    lines: [
      'On branch master',
      '',
      'No commits yet',
      '',
      'Changes to be committed:',
      '  (use "git rm --cached <file>..." to unstage)',
      '\tnew file:   main.py',
    ],
    commit: [6],
    why: 'Раздел Changes to be committed — это и есть содержимое индекса (коробки): new file: main.py попадёт в коммит, больше в выводе ничего нет.',
  },
  {
    intro: 'main.py уже закоммичен, после этого его изменили — а git add не делали:',
    lines: [
      'On branch master',
      'Changes not staged for commit:',
      '  (use "git add <file>..." to update what will be committed)',
      '  (use "git restore <file>..." to discard changes in working directory)',
      '\tmodified:   main.py',
      '',
      'no changes added to commit (use "git add" and/or "git commit -a")',
    ],
    commit: [],
    why: 'Ничего: modified стоит в разделе Changes not staged — изменение живёт только в рабочей папке. Пока не сделан git add, в коммит оно не попадёт.',
  },
];

const PERFECT_XP = 25;

const isRight = (picked: number[], t: StatusTask) =>
  picked.length === t.commit.length && t.commit.every((i) => picked.includes(i));

export default function GitStatusReader({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них тренажёр работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const rewardedRef = useRef(false);

  const total = STATUS_TASKS.length;
  const t = STATUS_TASKS[idx];
  const solved = checked && isRight(picked, t);

  const toggle = (i: number) => {
    if (checked) return;
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };

  const check = () => {
    setChecked(true);
    if (isRight(picked, t)) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setPicked([]);
      setChecked(false);
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
    setPicked([]);
    setChecked(false);
    setCorrectCount(0);
    setFinished(false);
  };

  const lineCls = (i: number) => {
    const should = t.commit.includes(i);
    const isPicked = picked.includes(i);
    let extra = '';
    if (!checked) {
      if (isPicked) extra = 'gsr-picked';
    } else if (should && isPicked) {
      extra = 'gsr-right';
    } else if (!should && isPicked) {
      extra = 'gsr-wrong';
    } else if (should && !isPicked) {
      extra = 'gsr-missed';
    }
    return `gsr-line ${extra}`.trim();
  };

  if (finished) {
    const perfect = correctCount === total;
    return (
      <div className="gsr">
        {perfect ? (
          <div className="gsr-final gsr-final-perfect">
            ✓ Выполнено! Все {total} вывода прочитаны верно.
            {chapterId && trainerId ? ` +${PERFECT_XP} XP` : ''}
          </div>
        ) : (
          <>
            <div className="gsr-final">
              Верно {correctCount} из {total}. Перечитай объяснения про индекс — и попробуй ещё раз.
            </div>
            <button type="button" className="gsr-next" onClick={retry}>
              Попробовать ещё раз
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="gsr">
      <div className="gsr-progress">
        Вывод {idx + 1} из {total}
      </div>

      <div className="gsr-intro">{t.intro}</div>

      <div className="gsr-term">
        {t.lines.map((line, i) =>
          line === '' ? (
            <div key={i} className="gsr-gap" />
          ) : (
            <button key={i} type="button" className={lineCls(i)} disabled={checked} onClick={() => toggle(i)}>
              {line}
            </button>
          ),
        )}
      </div>

      <div className="gsr-q">
        Кликни строки, которые попадут в коммит при <code>git commit</code> прямо сейчас, и нажми
        «Проверить». Если не попадёт ничего — жми «Проверить» сразу.
      </div>

      {!checked ? (
        <button type="button" className="gsr-check" onClick={check}>
          Проверить
        </button>
      ) : (
        <div className={`gsr-feedback ${solved ? 'gsr-ok' : 'gsr-no'}`}>
          <b>{solved ? 'Верно!' : 'Не совсем.'}</b> {t.why}
          <div>
            <button type="button" className="gsr-next" onClick={next}>
              {idx + 1 < total ? 'Дальше →' : 'Показать результат'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
