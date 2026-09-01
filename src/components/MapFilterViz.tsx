import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Конвейер map/filter: элементы списка проходят через две операции по одному,
// кнопка «Шаг» двигает следующий элемент с подсветкой. Два сценария из
// примеров главы: filter→map по команде и map→filter по числам-очкам.

type Op = {
  /** Код операции, как в главе. */
  code: string;
  /** Результат для каждого входного элемента; null — отброшен фильтром. */
  results: (string | null)[];
};

type Scenario = {
  id: string;
  label: string;
  intro: string;
  /** Вся цепочка одной строкой — заголовок конвейера. */
  chain: string;
  sourceTitle: string;
  midTitle: string;
  outTitle: string;
  source: string[];
  op1: Op;
  op2: Op;
  /** Итоговая строка println, показывается после последнего шага. */
  final: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'filter-map',
    label: 'filter → map: отбор имён',
    intro:
      'Та же цепочка, что в примере выше: filter отбирает участников с score >= 80, map оставляет только имена. Жми «Шаг» — элементы пойдут по конвейеру по одному.',
    chain: 'team.filter { it.score >= 80 }.map { it.name }',
    sourceTitle: 'team',
    midTitle: 'после filter',
    outTitle: 'qualified',
    source: ['Алиса · 82', 'Богдан · 91', 'Соня · 77'],
    op1: { code: 'filter { it.score >= 80 }', results: ['Алиса · 82', 'Богдан · 91', null] },
    op2: { code: 'map { it.name }', results: ['Алиса', 'Богдан'] },
    final: 'println(qualified) → [Алиса, Богдан]',
  },
  {
    id: 'map-filter',
    label: 'map → filter: удвоение очков',
    intro:
      'Теперь наоборот: map сначала удваивает каждое число из списка очков команды, а filter потом оставляет только те, что больше 160.',
    chain: 'scores.map { it * 2 }.filter { it > 160 }',
    sourceTitle: 'scores',
    midTitle: 'после map',
    outTitle: 'result',
    source: ['82', '91', '77'],
    op1: { code: 'map { it * 2 }', results: ['164', '182', '154'] },
    op2: { code: 'filter { it > 160 }', results: ['164', '182', null] },
    final: 'println(result) → [164, 182]',
  },
];

const XP = 25;

function notNull(r: string | null): r is string {
  return r !== null;
}

export default function MapFilterViz({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них конвейер работает без записи прогресса. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [scen, setScen] = useState(0);
  const [stepByScen, setStepByScen] = useState<number[]>(SCENARIOS.map(() => 0));
  const [doneByScen, setDoneByScen] = useState<boolean[]>(SCENARIOS.map(() => false));
  const [allDone, setAllDone] = useState(false);
  const rewardedRef = useRef(false);

  const sc = SCENARIOS[scen];
  const step = stepByScen[scen];
  const n1 = sc.source.length;
  const midFull = sc.op1.results.filter(notNull);
  const total = n1 + midFull.length;

  const srcProcessed = Math.min(step, n1);
  const midProcessed = Math.max(0, step - n1);
  const mid = sc.op1.results.slice(0, srcProcessed).filter(notNull);
  const out = sc.op2.results.slice(0, midProcessed).filter(notNull);
  const finished = step === total;
  const phase1 = step > 0 && step <= n1;
  const phase2 = step > n1;

  let caption = sc.intro;
  if (step > 0) {
    const opCode = phase1 ? sc.op1.code : sc.op2.code;
    const item = phase1 ? sc.source[step - 1] : midFull[step - n1 - 1];
    const res = phase1 ? sc.op1.results[step - 1] : sc.op2.results[step - n1 - 1];
    caption =
      res === null
        ? `${opCode}: «${item}» не прошёл условие — отброшен`
        : res === item
          ? `${opCode}: «${item}» прошёл условие — идёт дальше`
          : `${opCode}: «${item}» → «${res}»`;
  }

  const advance = () => {
    if (finished) return;
    const next = step + 1;
    setStepByScen(stepByScen.map((s, i) => (i === scen ? next : s)));
    if (next === total) {
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

  const chip = (text: string, key: number, cls: string) => (
    <span key={key} className={`mfv-chip ${cls}`.trim()}>
      {text}
    </span>
  );

  return (
    <div className="mfv">
      <div className="mfv-tabs">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`mfv-tab ${i === scen ? 'mfv-tab-active' : ''}`.trim()}
            onClick={() => setScen(i)}
          >
            {s.label}
            {doneByScen[i] ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <code className="mfv-chain-code">{sc.chain}</code>

      <div className="mfv-row" data-testid="mfv-source">
        <div className="mfv-row-title">{sc.sourceTitle}</div>
        <div className="mfv-chips">
          {sc.source.map((it, i) => {
            const processed = i < srcProcessed;
            const dropped = processed && sc.op1.results[i] === null;
            const active = phase1 && i === step - 1;
            return chip(
              it,
              i,
              `${dropped ? 'mfv-chip-dropped' : processed ? 'mfv-chip-used' : ''} ${active ? 'mfv-chip-active' : ''}`.trim(),
            );
          })}
        </div>
      </div>

      <code className={`mfv-op ${phase1 ? 'mfv-op-active' : ''}`.trim()}>{sc.op1.code}</code>

      <div className="mfv-row" data-testid="mfv-mid">
        <div className="mfv-row-title">{sc.midTitle}</div>
        <div className="mfv-chips">
          {mid.length === 0 ? <span className="mfv-empty">пока пусто</span> : null}
          {mid.map((it, i) => {
            const processed = i < midProcessed;
            const dropped = processed && sc.op2.results[i] === null;
            const active = (phase1 && i === mid.length - 1 && sc.op1.results[step - 1] !== null) || (phase2 && i === step - n1 - 1);
            return chip(
              it,
              i,
              `${dropped ? 'mfv-chip-dropped' : processed ? 'mfv-chip-used' : ''} ${active ? 'mfv-chip-active' : ''}`.trim(),
            );
          })}
        </div>
      </div>

      <code className={`mfv-op ${phase2 ? 'mfv-op-active' : ''}`.trim()}>{sc.op2.code}</code>

      <div className="mfv-row" data-testid="mfv-out">
        <div className="mfv-row-title">{sc.outTitle}</div>
        <div className="mfv-chips">
          {out.length === 0 ? <span className="mfv-empty">пока пусто</span> : null}
          {out.map((it, i) =>
            chip(it, i, phase2 && i === out.length - 1 && sc.op2.results[step - n1 - 1] !== null ? 'mfv-chip-active' : ''),
          )}
        </div>
      </div>

      <div className="mfv-caption">{caption}</div>

      {finished ? <code className="mfv-final-code">{sc.final}</code> : null}

      <div className="mfv-controls">
        <span className="mfv-step-count">
          Шаг {step} из {total}
        </span>
        {finished ? (
          <button type="button" className="mfv-btn" onClick={reset}>
            Сначала
          </button>
        ) : (
          <button type="button" className="mfv-btn mfv-btn-step" onClick={advance}>
            Шаг →
          </button>
        )}
      </div>

      {allDone ? (
        <div className="mfv-done">
          ✓ Выполнено! Оба сценария пройдены{chapterId && trainerId ? ` +${XP} XP` : ''}
        </div>
      ) : null}
    </div>
  );
}
