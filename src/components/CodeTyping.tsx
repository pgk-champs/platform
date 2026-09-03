import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import InteractiveKeyboard, { charToKey } from './InteractiveKeyboard';
import './trainers.css';

const FIRST_XP = 10;
const GOAL_XP = 15;

// timeline/snippet появляются у рекорда в режиме ghost: позиции по секундам
// и фрагмент, на котором рекорд поставлен (гонка честная только на нём же).
// goalMet — цель тренажёра была взята в одном прогоне (XP за неё даётся раз).
type TypingResult = {
  cpm: number;
  accuracy: number;
  goalMet?: boolean;
  timeline?: number[];
  snippet?: string;
};

export type CodeTypingPool = { label: string; snippets: string[] };
export type CodeTypingPreset = 'latin' | 'symbols' | 'code' | 'git';

// Встроенные пулы — самодостаточный тренажёр без зашитой единственной фразы.
// latin: панграммы для разминки; symbols: связки символов кода; code: короткие
// строки Kotlin; git: реальные команды git.
export const PRESET_POOLS: Record<CodeTypingPreset, CodeTypingPool> = {
  latin: {
    label: 'Панграммы',
    snippets: [
      'the quick brown fox jumps over the lazy dog',
      'pack my box with five dozen liquor jugs',
      'how vexingly quick daft zebras jump',
      'the five boxing wizards jump quickly',
      'sphinx of black quartz judge my vow',
      'waltz bad nymph for quick jigs vex',
      'amazingly few discotheques provide jukeboxes',
      'crazy fredrick bought many very exquisite opal jewels',
    ],
  },
  symbols: {
    label: 'Символы',
    snippets: [
      '-> => != == <= >=',
      '&& || ?? .. // ##',
      '() {} [] <> ;; ::',
      '"" \'\' __ $$ +-',
      '{ $x } ( y ) [ z ]',
      'a -> b => c :: d',
      '< > <= >= == !=',
      '{} && () || [] ??',
    ],
  },
  code: {
    label: 'Kotlin',
    snippets: [
      'val x = 5',
      'var name = "Ann"',
      'fun square(n: Int) = n * n',
      'if (x > 0) println("positive")',
      'for (i in 1..5) { println(i) }',
      'val list = listOf(1, 2, 3)',
      'when (x) { 1 -> "one"; else -> "many" }',
      'class User(val name: String)',
    ],
  },
  git: {
    label: 'git',
    snippets: [
      'git status',
      'git add .',
      'git commit -m "fix bug"',
      'git push origin main',
      'git pull --rebase',
      'git checkout -b feature',
      'git log --oneline -5',
      'git diff HEAD~1',
    ],
  },
};

export type CodeTypingProps = {
  /** Одна зашитая фраза — работает как раньше, без пулов. Игнорируется, если заданы pools/preset. */
  snippet?: string;
  /** Свои пулы фрагментов — {label, snippets}[], с переключателем, если пулов больше одного. */
  pools?: CodeTypingPool[];
  /** Готовый встроенный пул по теме. */
  preset?: CodeTypingPreset;
  /** Опциональны вместе: без них тренажёр работает как раньше, без записи в store. */
  chapterId?: string;
  trainerId?: string;
  /** Цели тренажёра — не заданные не проверяются и не блокируют «цель достигнута». */
  targetCpm?: number;
  targetAccuracy?: number;
  /** Live-клавиатура под полем ввода: подсвечивает ожидаемую и нажатую клавишу. */
  keyboard?: boolean;
  /** Гонка с собой: при повторном прохождении фрагмента показывает призрачный
   * прогресс лучшей попытки. Нужны chapterId/trainerId (рекорд живёт в store). */
  ghost?: boolean;
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

// Случайный фрагмент пула, отличный от текущего (пока в пуле есть выбор).
function pickRandom(pool: string[], exclude?: string): string {
  if (pool.length <= 1) return pool[0] ?? '';
  let pick = pool[Math.floor(Math.random() * pool.length)];
  while (pick === exclude) {
    pick = pool[Math.floor(Math.random() * pool.length)];
  }
  return pick;
}

export default function CodeTyping({
  snippet,
  pools,
  preset,
  chapterId,
  trainerId,
  targetCpm,
  targetAccuracy,
  keyboard = false,
  ghost = false,
}: CodeTypingProps) {
  // Перерисовываемся при изменениях в store, чтобы «Лучший: N» не отставал
  // (например после сброса тренажёра «Ещё раз» с новым личным рекордом).
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const resolvedPools = pools ?? (preset ? [PRESET_POOLS[preset]] : undefined);
  const hasPools = !!resolvedPools && resolvedPools.length > 0;

  const [poolIndex, setPoolIndex] = useState(0);
  // Детерминированный старт (первый фрагмент первого пула) — не Math.random(),
  // чтобы серверный и клиентский первый рендер совпадали (SSR у Docusaurus).
  const [currentSnippet, setCurrentSnippet] = useState(() =>
    hasPools ? resolvedPools![0].snippets[0] : snippet ?? '',
  );
  const activeSnippet = hasPools ? currentSnippet : snippet ?? '';

  const [value, setValue] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [lastKey, setLastKey] = useState<{ id: string; state: 'ok' | 'err' } | null>(null);
  const startRef = useRef<number | null>(null);
  const samplesRef = useRef<{ t: number; pos: number }[]>([]);
  const [record, setRecord] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [, setTick] = useState(0);
  const done = result !== null;

  const reset = () => {
    setValue('');
    setElapsed(0);
    setResult(null);
    setLastKey(null);
    setRecord(false);
    setPasteBlocked(false);
    startRef.current = null;
    samplesRef.current = [];
  };

  const nextFragment = () => {
    if (!resolvedPools) return;
    setCurrentSnippet(pickRandom(resolvedPools[poolIndex].snippets, currentSnippet));
    reset();
  };

  const switchPool = (idx: number) => {
    if (!resolvedPools) return;
    setPoolIndex(idx);
    setCurrentSnippet(pickRandom(resolvedPools[idx].snippets));
    reset();
  };

  const finish = (finalValue: string, elapsedMs: number) => {
    const correct = countCorrect(finalValue, activeSnippet);
    const accuracy = activeSnippet.length > 0 ? Math.round((100 * correct) / activeSnippet.length) : 0;
    const minutes = Math.max(elapsedMs, 1) / 60000;
    // Скорость — по ВЕРНЫМ символам: иначе быстрая бессмыслица ставила бы
    // рекорд, который потом не побить нормальным набором.
    const cpm = Math.round(correct / minutes);
    const finalResult: TypingResult = { cpm, accuracy };
    setElapsed(Math.round(elapsedMs / 1000));
    setResult(finalResult);

    if (!chapterId || !trainerId) return;
    const prevBest = store.getProgress().trainers[chapterId]?.[trainerId]?.result as TypingResult | undefined;
    const hasGoal = targetCpm !== undefined || targetAccuracy !== undefined;
    const metGoalNow = meetsTargets(finalResult, targetCpm, targetAccuracy);
    const cpmRecord = !prevBest || cpm > prevBest.cpm;

    // Рекорд хранит лучшее по каждой оси отдельно: аккуратный медленный прогон
    // не теряет точность (иначе достижение «ни одной опечатки» недостижимо),
    // а быстрый — скорость.
    const stored: TypingResult = {
      cpm: Math.max(cpm, prevBest?.cpm ?? 0),
      accuracy: Math.max(accuracy, prevBest?.accuracy ?? 0),
    };
    if (hasGoal && (metGoalNow || prevBest?.goalMet)) stored.goalMet = true;
    if (ghost && cpmRecord) {
      // Таймлайн рекорда: сколько символов было набрано к каждой секунде.
      // Из него при следующем прохождении строится «призрак» для гонки с собой.
      const seconds = Math.max(1, Math.ceil(elapsedMs / 1000));
      const timeline: number[] = [];
      for (let s = 0; s <= seconds; s += 1) {
        let pos = 0;
        for (const sample of samplesRef.current) {
          if (sample.t <= s * 1000) pos = sample.pos;
        }
        timeline.push(pos);
      }
      stored.timeline = timeline;
      stored.snippet = activeSnippet;
      if (prevBest) setRecord(true);
    } else if (ghost && prevBest?.timeline) {
      // Прогон не побил скорость — призрак остаётся от прежнего рекорда.
      stored.timeline = prevBest.timeline;
      stored.snippet = prevBest.snippet;
    }
    store.markTrainerDone(chapterId, trainerId, stored);

    if (!prevBest) {
      store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    }
    // XP за цель — по факту взятой цели в одном прогоне, а не по «лучшему»
    // результату: иначе её можно было получать снова и снова.
    if (hasGoal && metGoalNow && !prevBest?.goalMet) {
      store.addXp(GOAL_XP, `trainer-goal:${chapterId}:${trainerId}`);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (startRef.current === null && next.length > 0) {
      startRef.current = Date.now();
    }
    if (!done && startRef.current !== null) {
      samplesRef.current.push({ t: Date.now() - startRef.current, pos: next.length });
    }
    if (keyboard) {
      if (next.length > value.length) {
        const idx = next.length - 1;
        const typedChar = next[idx];
        const expectedChar = activeSnippet[idx];
        const keyInfo = charToKey(typedChar);
        setLastKey(keyInfo ? { id: keyInfo.id, state: typedChar === expectedChar ? 'ok' : 'err' } : null);
      } else {
        setLastKey(null);
      }
    }
    if (!done && next.length >= activeSnippet.length && startRef.current !== null) {
      finish(next, Date.now() - startRef.current);
    }
    setValue(next);
  };

  const liveCorrect = countCorrect(value, activeSnippet);
  const liveAccuracy = value.length > 0 ? Math.round((100 * liveCorrect) / activeSnippet.length) : 0;
  const liveElapsedMs = startRef.current !== null ? Date.now() - startRef.current : 0;
  // Как и в итоге — по верным символам, чтобы живое число не расходилось с ним.
  const liveCpm = value.length > 0 && liveElapsedMs > 0 ? Math.round(liveCorrect / (liveElapsedMs / 60000)) : 0;

  const best =
    chapterId && trainerId
      ? (store.getProgress().trainers[chapterId]?.[trainerId]?.result as TypingResult | undefined)
      : undefined;

  // Призрак показывается только на том же фрагменте, где поставлен рекорд —
  // иначе гонка с другой фразой была бы бессмысленной.
  const ghostTimeline = ghost && best?.timeline && best.snippet === activeSnippet ? best.timeline : null;

  const racing = !!(ghostTimeline && !done && startRef.current !== null);
  useEffect(() => {
    if (!racing) return undefined;
    // Тик, чтобы призрак бежал и между нажатиями — гонка живая, а не рывками.
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [racing]);

  let ghostPct = 0;
  if (ghostTimeline && activeSnippet.length > 0) {
    const sec = liveElapsedMs / 1000;
    const i0 = Math.min(Math.floor(sec), ghostTimeline.length - 1);
    const i1 = Math.min(i0 + 1, ghostTimeline.length - 1);
    const frac = Math.min(1, Math.max(0, sec - i0));
    const pos = ghostTimeline[i0] + (ghostTimeline[i1] - ghostTimeline[i0]) * frac;
    ghostPct = Math.min(100, Math.round((100 * pos) / activeSnippet.length));
  }
  const youPct = activeSnippet.length > 0 ? Math.min(100, Math.round((100 * value.length) / activeSnippet.length)) : 0;

  const hasGoal = targetCpm !== undefined || targetAccuracy !== undefined;
  const goalMet = result ? meetsTargets(result, targetCpm, targetAccuracy) : false;

  // Цель нужно видеть ДО набора, иначе «Цель пока не достигнута» ничего не
  // объясняет: к какой скорости и точности стремиться и сколько не хватило.
  const goalText = [
    targetCpm !== undefined ? `скорость ≥ ${targetCpm} зн/мин` : null,
    targetAccuracy !== undefined ? `точность ≥ ${targetAccuracy}%` : null,
  ]
    .filter(Boolean)
    .join(', ');
  const missingText = result
    ? [
        targetCpm !== undefined && result.cpm < targetCpm ? `${targetCpm - result.cpm} зн/мин` : null,
        targetAccuracy !== undefined && result.accuracy < targetAccuracy
          ? `${targetAccuracy - result.accuracy}% точности`
          : null,
      ]
        .filter(Boolean)
        .join(' и ')
    : '';
  const NOTE_STYLE: React.CSSProperties = {
    margin: '0.4rem 0',
    fontSize: '0.85rem',
    color: 'var(--ifm-color-emphasis-700)',
  };

  const nextChar = !done ? activeSnippet[value.length] : undefined;
  const nextKeyInfo = nextChar !== undefined ? charToKey(nextChar) : null;
  const nextKeyIds = nextKeyInfo ? (nextKeyInfo.shift ? [nextKeyInfo.id, 'Shift-L'] : [nextKeyInfo.id]) : undefined;

  return (
    <div className="ct">
      {hasPools ? (
        <div className="ct-pools">
          {resolvedPools!.length > 1 ? (
            <div className="ct-pool-switch">
              {resolvedPools!.map((p, i) => (
                <button
                  key={p.label}
                  type="button"
                  className={i === poolIndex ? 'ct-pool-btn ct-pool-btn-active' : 'ct-pool-btn'}
                  onClick={() => switchPool(i)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}
          <button type="button" className="ct-next-btn" onClick={nextFragment}>
            Следующий фрагмент
          </button>
        </div>
      ) : null}

      {done && result ? (
        <div className="ct-result">
          <p>Точность: {result.accuracy}%</p>
          <p>Скорость: {result.cpm} зн/мин</p>
          <p>Время: {elapsed} сек.</p>
          {record ? <p className="ct-record">Новый рекорд! Призрак обновлён 👻</p> : null}
          {hasGoal ? (
            <p className={goalMet ? 'ct-goal-ok' : 'ct-goal-no'}>
              {goalMet
                ? `Цель достигнута! (${goalText})`
                : `Цель пока не достигнута: ${goalText}. Не хватило ${missingText}.`}
            </p>
          ) : null}
          <button onClick={reset}>Ещё раз</button>
        </div>
      ) : (
        <>
          {hasGoal ? (
            <p className="ct-goal" style={NOTE_STYLE}>
              Цель: {goalText}
            </p>
          ) : null}
          <pre className="ct-code">
            {activeSnippet.split('').map((ch, i) => {
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
          {ghostTimeline ? (
            <div className="ct-ghost">
              <div className="ct-ghost-row">
                <span className="ct-ghost-label">Ты</span>
                <div className="ct-ghost-track">
                  <div className="ct-ghost-fill ct-ghost-you" style={{ width: `${youPct}%` }} />
                </div>
              </div>
              <div className="ct-ghost-row">
                <span className="ct-ghost-label">Рекорд</span>
                <div className="ct-ghost-track">
                  <div className="ct-ghost-fill ct-ghost-past" style={{ width: `${ghostPct}%` }} />
                </div>
              </div>
            </div>
          ) : ghost && chapterId && trainerId ? (
            <p className="ct-ghost-hint">
              Пройди фрагмент — появится призрак твоего рекорда, и начнётся гонка с собой 👻
            </p>
          ) : null}
          <textarea
            aria-label="Печатай код здесь"
            placeholder="Кликни сюда и набери строку выше"
            spellCheck={false}
            value={value}
            onChange={onChange}
            onPaste={(e) => {
              e.preventDefault();
              setPasteBlocked(true);
            }}
          />
          {pasteBlocked ? (
            <p className="ct-paste-note" style={NOTE_STYLE} role="status">
              Вставка здесь отключена — тренируем пальцы, набери руками. Ctrl+V пригодится в других
              местах.
            </p>
          ) : null}
        </>
      )}
      {best ? (
        <p className="ct-best">
          Лучший: {best.cpm} зн/мин · точность {best.accuracy}%
        </p>
      ) : null}
      {keyboard ? (
        <InteractiveKeyboard nextKey={nextKeyIds} activeKey={lastKey?.id} activeState={lastKey?.state} dim />
      ) : null}
    </div>
  );
}
