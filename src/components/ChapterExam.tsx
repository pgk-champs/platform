import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import type { Question } from './SelfCheck';
import './trainers.css';

// XP×2 относительно идеального SelfCheck (20) — за экзамен от 80% и выше.
const EXAM_XP = 40;
const PASS_PCT = 80;

type Phase = 'intro' | 'run' | 'done';

function gradeFor(pct: number): string {
  if (pct >= 80) return 'Отлично';
  if (pct >= 60) return 'Хорошо';
  return 'Потренируйся ещё';
}

function fmtTime(sec: number): string {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function ChapterExam({
  chapterId,
  questions,
  timeLimitSec = 300,
}: {
  chapterId: string;
  questions: Question[];
  timeLimitSec?: number;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  // XP за экзамен — один раз за визит на страницу, как в SelfCheck; пересдача
  // в той же сессии оценку обновляет, но XP повторно не начисляет.
  const rewardedRef = useRef(false);

  const finish = (finalAnswers: Record<number, number>) => {
    const correct = questions.filter((q, i) => finalAnswers[i] === q.correct).length;
    store.markExamDone(chapterId, { correct, total: questions.length });
    const pct = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    if (pct >= PASS_PCT && !rewardedRef.current) {
      rewardedRef.current = true;
      store.addXp(EXAM_XP, `exam:${chapterId}`);
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
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      finish(next);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="ce">
        <p className="ce-intro">
          Сводная проверка по всей главе: {questions.length} вопросов, {fmtTime(timeLimitSec)} на
          всё, без подсказок по ходу. Вопросы показываются по одному, ответ изменить нельзя. Если
          время выйдет — экзамен завершится с тем, что успел ответить. Пересдавать можно сколько
          угодно раз.
        </p>
        <button type="button" className="ce-start" onClick={start}>
          Начать экзамен
        </button>
      </div>
    );
  }

  if (phase === 'run') {
    const q = questions[current];
    const progressPct = questions.length > 0 ? (current / questions.length) * 100 : 0;
    return (
      <div className="ce">
        <div className="ce-top">
          <span className="ce-step">
            Вопрос {current + 1} из {questions.length}
          </span>
          <span className={`ce-timer ${timeLeft <= 30 ? 'ce-timer-low' : ''}`.trim()}>
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
  const stats = store.getExamStats(chapterId);
  return (
    <div className="ce">
      <div className="ce-grade">{gradeFor(pct)}</div>
      <div className="ce-score">
        Верно: {correct} из {questions.length} ({pct}%)
      </div>
      {pct >= PASS_PCT ? <div className="sc-result-perfect">+{EXAM_XP} XP за сданный экзамен</div> : null}
      <div className="sc-history">
        <div className="sc-history-title">Мои пересдачи</div>
        <div className="sc-history-row">
          Лучший результат: {stats.best ? `${stats.best.correct} из ${stats.best.total}` : '—'}
        </div>
        <div className="sc-history-row">Попыток всего: {stats.count}</div>
      </div>
      <button type="button" className="ce-start" onClick={start}>
        Пересдать
      </button>
    </div>
  );
}
