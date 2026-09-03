import React, { useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Мини-ревью pull request: diff-фрагмент на Kotlin с тремя подложенными
// проблемами. Кликни строки с проблемами — после трёх находок разбор каждой.

type ProblemId = 'null' | 'hardcode' | 'name';

type DiffLine = {
  text: string;
  kind: 'ctx' | 'add';
  problem?: ProblemId;
};

const LINES: DiffLine[] = [
  { kind: 'ctx', text: '// Ссылка «Открыть pull request» для ветки участника' },
  { kind: 'ctx', text: 'fun prLinkFor(author: User?, branch: String): String {' },
  { kind: 'add', text: '    val login = author.login', problem: 'null' },
  { kind: 'add', text: '    val repo = "https://github.com/ivan/team-report"', problem: 'hardcode' },
  { kind: 'add', text: '    val encodedBrnach = urlEncode(branch)', problem: 'name' },
  { kind: 'add', text: '    val target = "main"' },
  { kind: 'add', text: '    val compare = "$target...$login:$encodedBrnach"' },
  { kind: 'add', text: '    val url = "$repo/compare/$compare"' },
  { kind: 'add', text: '    println("PR: $url")' },
  { kind: 'add', text: '    return url' },
  { kind: 'ctx', text: '}' },
];

const PROBLEMS: { id: ProblemId; title: string; why: string }[] = [
  {
    id: 'null',
    title: 'Забытая проверка null',
    why: 'Параметр author объявлен как User? — он может быть null, но обращение author.login идёт без проверки. При null функция упадёт. Нужно author?.login и явное решение, что делать без автора.',
  },
  {
    id: 'hardcode',
    title: 'Захардкоженная строка',
    why: 'Адрес репозитория вшит прямо в код, причём это личный форк ivan — у любого другого участника команды ссылка поведёт не туда. Такие значения передают параметром или берут из конфигурации.',
  },
  {
    id: 'name',
    title: 'Опечатка в имени',
    why: 'encodedBrnach вместо encodedBranch. Компилятор не возражает, но читать и искать по коду становится тяжелее — на ревью такие имена ловят сразу, пока опечатка не расползлась по проекту.',
  },
];

const XP = 25;

export default function PRTrainer({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них тренажёр работает без записи прогресса. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [found, setFound] = useState<ProblemId[]>([]);
  const [missed, setMissed] = useState<number[]>([]);
  // XP реально начислен в этом прохождении — только по нему пишем «+25 XP».
  const [gotXp, setGotXp] = useState(false);

  const finished = found.length === PROBLEMS.length;

  const clickLine = (i: number) => {
    if (finished) return;
    const p = LINES[i].problem;
    if (p) {
      if (found.includes(p)) return;
      const nextFound = [...found, p];
      setFound(nextFound);
      if (nextFound.length === PROBLEMS.length && chapterId && trainerId) {
        const prev = store.getProgress().trainers[chapterId]?.[trainerId]?.result as
          | { misses?: number }
          | undefined;
        // Результат — лучший за всё время (меньше промахов), поэтому повтор
        // с промахами не затирает чистое прохождение...
        store.markTrainerDone(chapterId, trainerId, {
          found: nextFound.length,
          misses: Math.min(missed.length, prev?.misses ?? missed.length),
        });
        // ...а XP даётся за первое чистое прохождение — в том числе после
        // «Попробовать ещё раз», когда с первого раза были промахи.
        if (missed.length === 0 && prev?.misses !== 0) {
          store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
          setGotXp(true);
        }
      }
    } else if (!missed.includes(i)) {
      setMissed([...missed, i]);
    }
  };

  const retry = () => {
    setFound([]);
    setMissed([]);
    setGotXp(false);
  };

  return (
    <div className="prt">
      <div className="prt-score">
        Найдено: {found.length} из {PROBLEMS.length} · Промахи: {missed.length}
      </div>

      <div className="prt-diff" aria-label="Diff на ревью">
        {LINES.map((l, i) => {
          const isFound = !!l.problem && found.includes(l.problem);
          const isMiss = missed.includes(i);
          const cls = [
            'prt-line',
            l.kind === 'add' ? 'prt-add' : 'prt-ctx',
            isFound ? 'prt-found' : '',
            isMiss ? 'prt-missclick' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button key={i} type="button" className={cls} onClick={() => clickLine(i)}>
              <span className="prt-sign">{l.kind === 'add' ? '+' : ' '}</span>
              {l.text}
            </button>
          );
        })}
      </div>

      {!finished ? (
        <div className="prt-hint">Кликай по строкам, в которых видишь проблему.</div>
      ) : (
        <>
          <div className="prt-done">
            ✓ Выполнено! Все {PROBLEMS.length} проблемы найдены
            {missed.length === 0 ? (gotXp ? ` без промахов +${XP} XP` : ' без промахов') : `, промахов: ${missed.length}`}
          </div>
          <div className="prt-review">
            {PROBLEMS.map((p) => (
              <div key={p.id} className="prt-problem">
                <b>{p.title}.</b> {p.why}
              </div>
            ))}
          </div>
          {missed.length > 0 ? (
            <button type="button" className="prt-retry" onClick={retry}>
              Попробовать ещё раз
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
