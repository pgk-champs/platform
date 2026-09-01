import React, { useRef, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

const FIRST_XP = 10;
const GOAL_XP = 15;

type TypingResult = { cpm: number; accuracy: number };

export type CodeTypingProps = {
  snippet: string;
  /** Опциональны вместе: без них тренажёр работает как раньше, без записи в store. */
  chapterId?: string;
  trainerId?: string;
  /** Цели тренажёра — не заданные не проверяются и не блокируют «цель достигнута». */
  targetCpm?: number;
  targetAccuracy?: number;
};

function countCorrect(value: string, snippet: string): number {
  let correct = 0;
  for (let i = 0; i < value.length && i < snippet.length; i++) {
    if (value[i] === snippet[i]) correct++;
  }
  return correct;
}

function meetsTargets(r: TypingResult, targetCpm?: number, targetAccuracy?: number): boolean {
  return (targetCpm === undefined || r.cpm >= targetCpm) && (targetAccuracy === undefined || r.accuracy >= targetAccuracy);
}

export default function CodeTyping({ snippet, chapterId, trainerId, targetCpm, targetAccuracy }: CodeTypingProps) {
  // Перерисовываемся при изменениях в store, чтобы «Лучший: N» не отставал
  // (например после сброса тренажёра «Ещё раз» с новым личным рекордом).
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const [value, setValue] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<TypingResult | null>(null);
  const startRef = useRef<number | null>(null);
  const done = result !== null;

  const reset = () => {
    setValue('');
    setElapsed(0);
    setResult(null);
    startRef.current = null;
  };

  const finish = (finalValue: string, elapsedMs: number) => {
    const correct = countCorrect(finalValue, snippet);
    const accuracy = snippet.length > 0 ? Math.round((100 * correct) / snippet.length) : 0;
    const minutes = Math.max(elapsedMs, 1) / 60000;
    const cpm = Math.round(snippet.length / minutes);
    const finalResult: TypingResult = { cpm, accuracy };
    setElapsed(Math.round(elapsedMs / 1000));
    setResult(finalResult);

    if (!chapterId || !trainerId) return;
    const prevBest = store.getProgress().trainers[chapterId]?.[trainerId]?.result as TypingResult | undefined;
    const hasGoal = targetCpm !== undefined || targetAccuracy !== undefined;
    const prevMetGoal = !!prevBest && meetsTargets(prevBest, targetCpm, targetAccuracy);

    if (!prevBest || cpm > prevBest.cpm) {
      store.markTrainerDone(chapterId, trainerId, finalResult);
    }
    if (!prevBest) {
      store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    }
    if (hasGoal && !prevMetGoal && meetsTargets(finalResult, targetCpm, targetAccuracy)) {
      store.addXp(GOAL_XP, `trainer-goal:${chapterId}:${trainerId}`);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (startRef.current === null && next.length > 0) {
      startRef.current = Date.now();
    }
    if (!done && next.length >= snippet.length && startRef.current !== null) {
      finish(next, Date.now() - startRef.current);
    }
    setValue(next);
  };

  const liveCorrect = countCorrect(value, snippet);
  const liveAccuracy = value.length > 0 ? Math.round((100 * liveCorrect) / snippet.length) : 0;
  const liveElapsedMs = startRef.current !== null ? Date.now() - startRef.current : 0;
  const liveCpm = value.length > 0 && liveElapsedMs > 0 ? Math.round(value.length / (liveElapsedMs / 60000)) : 0;

  const best =
    chapterId && trainerId
      ? (store.getProgress().trainers[chapterId]?.[trainerId]?.result as TypingResult | undefined)
      : undefined;

  const hasGoal = targetCpm !== undefined || targetAccuracy !== undefined;
  const goalMet = result ? meetsTargets(result, targetCpm, targetAccuracy) : false;

  return (
    <div className="ct">
      {done && result ? (
        <div className="ct-result">
          <p>Точность: {result.accuracy}%</p>
          <p>Скорость: {result.cpm} зн/мин</p>
          <p>Время: {elapsed} сек.</p>
          {hasGoal ? (
            <p className={goalMet ? 'ct-goal-ok' : 'ct-goal-no'}>
              {goalMet ? 'Цель достигнута!' : 'Цель пока не достигнута'}
            </p>
          ) : null}
          <button onClick={reset}>Ещё раз</button>
        </div>
      ) : (
        <>
          <pre className="ct-code">
            {snippet.split('').map((ch, i) => {
              const cls = i >= value.length ? '' : value[i] === ch ? 'ct-ok' : 'ct-err';
              return (
                <span key={i} className={cls}>
                  {ch}
                </span>
              );
            })}
          </pre>
          {value.length > 0 ? (
            <p className="ct-live">
              {liveCpm} зн/мин · точность {liveAccuracy}%
            </p>
          ) : null}
          <textarea
            aria-label="Печатай код здесь"
            spellCheck={false}
            value={value}
            onChange={onChange}
            onPaste={(e) => e.preventDefault()}
          />
        </>
      )}
      {best ? (
        <p className="ct-best">
          Лучший: {best.cpm} зн/мин · точность {best.accuracy}%
        </p>
      ) : null}
    </div>
  );
}
