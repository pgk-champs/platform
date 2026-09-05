import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import type { Question } from './SelfCheck';
import './trainers.css';

// Экзамен по блоку глав: ставится в конце последней главы блока, после её
// ChapterExam. Пишет результат в store под ключом `block:<blockId>` — отдельно
// от глав, чтобы не путаться со счётчиками ChapterProgress. XP выше главного
// экзамена (40): блок — это 5–6 глав разом.
const BLOCK_EXAM_XP = 100;
const PASS_PCT = 80;

type Phase = 'intro' | 'run' | 'done';

function gradeFor(pct: number): string {
  if (pct >= 80) return 'Блок сдан';
  if (pct >= 60) return 'Почти: пройди главы, где ошибся';
  return 'Рано: вернись к главам блока';
}

function fmtTime(sec: number): string {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function BlockExam({
  blockId,
  title,
  chapterIds,
  questions,
  timeLimitSec = 600,
}: {
  blockId: string;
  title: string;
  chapterIds: string[];
  questions: Question[];
  timeLimitSec?: number;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const rewardedRef = useRef(false);
  const storeKey = `block:${blockId}`;

  // Готовность: сколько глав блока уже сдали свой экзамен (лучшая попытка ≥ 80%).
  const passedChapters = chapterIds.filter((id) => {
    const best = store.getExamStats(id).best;
    return best !== undefined && best.total > 0 && best.correct / best.total >= PASS_PCT / 100;
  });

  const finish = (finalAnswers: Record<number, number>) => {
    const correct = questions.filter((q, i) => finalAnswers[i] === q.correct).length;
    store.markExamDone(storeKey, { correct, total: questions.length });
    const pct = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    if (pct >= PASS_PCT && !rewardedRef.current) {
      rewardedRef.current = true;
      store.addXp(BLOCK_EXAM_XP, `block-exam:${blockId}`);
    }
    setPhase('done');
  };

  useEffect(() => {
    if (phase !== 'run') return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'run' && timeLeft <= 0) finish(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const start = () => {
    setAnswers({});
    setCurrent(0);
    setTimeLeft(timeLimitSec);
    setPhase('run');
  };

  const pick = (oi: number) => {
    const next = { ...answers, [current]: oi };
    setAnswers(next);
    if (current + 1 < questions.length) setCurrent(current + 1);
    else finish(next);
  };

  if (phase === 'intro') {
    return (
      <div className="ce be">
        <div className="ce-grade">Экзамен по блоку: {title}</div>
        <p className="ce-intro">
          Сводная проверка по {chapterIds.length} главам блока: {questions.length} вопросов,{' '}
          {fmtTime(timeLimitSec)} на всё, по одному вопросу, без возврата. Пересдавать можно сколько
          угодно раз.
        </p>
        <p className="ce-intro">
          Готовность: экзамены глав сданы {passedChapters.length} из {chapterIds.length}.
          {passedChapters.length < chapterIds.length
            ? ' Блок можно сдавать и так, но шанс выше после всех глав.'
            : ' Все главы сданы — можно идти.'}
        </p>
        <button type="button" className="ce-start" onClick={start}>
          Начать экзамен по блоку
        </button>
      </div>
    );
  }

  if (phase === 'run') {
    const q = questions[current];
    const progressPct = questions.length > 0 ? (current / questions.length) * 100 : 0;
    return (
      <div className="ce be">
        <div className="ce-top">
          <span className="ce-step">
            Вопрос {current + 1} из {questions.length}
          </span>
          <span className={`ce-timer ${timeLeft <= 60 ? 'ce-timer-low' : ''}`.trim()}>
            ⏱ {fmtTime(timeLeft)}
          </span>
        </div>
        <div
          className="sc-progress"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={questions.length}
        >
          <div className="sc-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="sc-q">{q.q}</div>
        <div className="sc-options">
          {q.options.map((opt, oi) => (
            <button key={oi} type="button" className="sc-option" onClick={() => pick(oi)}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const stats = store.getExamStats(storeKey);
  return (
    <div className="ce be">
      <div className="ce-grade">{gradeFor(pct)}</div>
      <div className="ce-score">
        Верно: {correct} из {questions.length} ({pct}%)
      </div>
      {pct >= PASS_PCT ? (
        <div className="sc-result-perfect">+{BLOCK_EXAM_XP} XP за сданный блок</div>
      ) : null}
      <div className="sc-history">
        <div className="sc-history-title">Мои пересдачи блока</div>
        <div className="sc-history-row">
          Лучший результат: {stats.best ? `${stats.best.correct} из ${stats.best.total}` : '—'}
        </div>
        <div className="sc-history-row">Попыток всего: {stats.count}</div>
      </div>
      <button type="button" className="ce-start" onClick={start}>
        Пересдать блок
      </button>
    </div>
  );
}
