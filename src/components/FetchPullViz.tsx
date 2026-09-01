import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Пошаговая схема «pull = fetch + merge»: два репозитория (local и origin),
// указатели main / origin/main; кнопка «Шаг» двигает сценарий.
// Два сценария: fetch и merge порознь — и pull одной командой.

type Snap = {
  /** Команда, выполненная на этом шаге (null для стартового состояния). */
  cmd: string | null;
  caption: string;
  /** Коммиты, о которых знает локальный репозиторий. */
  localCommits: string[];
  /** Куда указывает локальная main. */
  main: string;
  /** Куда указывает origin/main — локальная «фотография» сервера. */
  originMain: string;
};

const SERVER_COMMITS = ['A', 'B', 'C'];
const SERVER_MAIN = 'C';

const SCENARIOS: { id: string; label: string; steps: Snap[] }[] = [
  {
    id: 'fm',
    label: 'fetch + merge по шагам',
    steps: [
      {
        cmd: null,
        caption:
          'origin уехал вперёд: коллега запушил коммит C. Локально о нём никто не знает — и main, и origin/main всё ещё стоят на B.',
        localCommits: ['A', 'B'],
        main: 'B',
        originMain: 'B',
      },
      {
        cmd: 'git fetch',
        caption:
          'fetch скачал коммит C и передвинул ТОЛЬКО origin/main — «фотографию» сервера. Локальная main и файлы на диске не тронуты.',
        localCommits: ['A', 'B', 'C'],
        main: 'B',
        originMain: 'C',
      },
      {
        cmd: 'git merge origin/main',
        caption:
          'merge влил origin/main в текущую ветку: main перемоталась (fast-forward) на C. Локальная история совпала с серверной.',
        localCommits: ['A', 'B', 'C'],
        main: 'C',
        originMain: 'C',
      },
    ],
  },
  {
    id: 'pull',
    label: 'pull одной командой',
    steps: [
      {
        cmd: null,
        caption: 'Та же ситуация: на сервере есть C, локально его нет. Теперь решим её одной командой.',
        localCommits: ['A', 'B'],
        main: 'B',
        originMain: 'B',
      },
      {
        cmd: 'git pull',
        caption:
          'pull сделал оба шага разом: скачал C и передвинул origin/main (это был fetch), а следом перемотал main (это был merge). Одна команда — две операции.',
        localCommits: ['A', 'B', 'C'],
        main: 'C',
        originMain: 'C',
      },
    ],
  },
];

const XP = 25;

function Chain({ commits, pointers }: { commits: string[]; pointers: Record<string, string[]> }) {
  return (
    <div className="fpv-chain">
      {commits.map((c, i) => (
        <React.Fragment key={c}>
          {i > 0 ? <span className="fpv-arrow">→</span> : null}
          <span className="fpv-slot">
            <span className="fpv-commit">{c}</span>
            {(pointers[c] ?? []).map((p) => (
              <span key={p} className={p === 'main' ? 'fpv-ptr fpv-ptr-main' : 'fpv-ptr fpv-ptr-origin'}>
                {p}
              </span>
            ))}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function FetchPullViz({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них схема работает без записи прогресса. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [scen, setScen] = useState(0);
  const [stepByScen, setStepByScen] = useState<number[]>(SCENARIOS.map(() => 0));
  const [doneByScen, setDoneByScen] = useState<boolean[]>(SCENARIOS.map(() => false));
  const [allDone, setAllDone] = useState(false);
  const rewardedRef = useRef(false);

  const scenario = SCENARIOS[scen];
  const step = stepByScen[scen];
  const snap = scenario.steps[step];
  const last = step === scenario.steps.length - 1;

  const advance = () => {
    if (last) return;
    const nextStep = step + 1;
    setStepByScen(stepByScen.map((s, i) => (i === scen ? nextStep : s)));
    if (nextStep === scenario.steps.length - 1) {
      const done = doneByScen.map((d, i) => (i === scen ? true : d));
      setDoneByScen(done);
      if (done.every(Boolean) && !rewardedRef.current) {
        rewardedRef.current = true;
        setAllDone(true);
        if (chapterId && trainerId) {
          store.markTrainerDone(chapterId, trainerId, { scenarios: SCENARIOS.length });
          store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
        }
      }
    }
  };

  const reset = () => {
    setStepByScen(stepByScen.map((s, i) => (i === scen ? 0 : s)));
  };

  const localPointers: Record<string, string[]> = {};
  (localPointers[snap.main] = localPointers[snap.main] ?? []).push('main');
  (localPointers[snap.originMain] = localPointers[snap.originMain] ?? []).push('origin/main');

  return (
    <div className="fpv">
      <div className="fpv-tabs">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`fpv-tab ${i === scen ? 'fpv-tab-active' : ''}`.trim()}
            onClick={() => setScen(i)}
          >
            {s.label}
            {doneByScen[i] ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <div className="fpv-repos">
        <div className="fpv-repo" data-testid="fpv-local">
          <div className="fpv-repo-title">Локальный репозиторий</div>
          <Chain commits={snap.localCommits} pointers={localPointers} />
        </div>
        <div className="fpv-repo" data-testid="fpv-server">
          <div className="fpv-repo-title">origin (сервер)</div>
          <Chain commits={SERVER_COMMITS} pointers={{ [SERVER_MAIN]: ['main'] }} />
        </div>
      </div>

      {snap.cmd ? (
        <code className="fpv-cmd">$ {snap.cmd}</code>
      ) : (
        <div className="fpv-cmd fpv-cmd-none">исходное состояние</div>
      )}

      <div className="fpv-caption">{snap.caption}</div>

      <div className="fpv-controls">
        <span className="fpv-step-count">
          Шаг {step + 1} из {scenario.steps.length}
        </span>
        {last ? (
          <button type="button" className="fpv-btn" onClick={reset}>
            Сначала
          </button>
        ) : (
          <button type="button" className="fpv-btn fpv-btn-step" onClick={advance}>
            Шаг →
          </button>
        )}
      </div>

      {allDone ? (
        <div className="fpv-done">
          ✓ Выполнено! Оба сценария пройдены{chapterId && trainerId ? ` +${XP} XP` : ''}
        </div>
      ) : null}
    </div>
  );
}
