import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

export type Question = { q: string; options: string[]; correct: number; why?: string };

const PERFECT_XP = 20;

export default function SelfCheck({
  questions,
  chapterId,
  quizId,
}: {
  questions: Question[];
  /** Опциональны: без них компонент работает как раньше, без записи в store. */
  chapterId?: string;
  quizId?: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const rewardedRef = useRef(false);

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qi, oi]) => oi === questions[Number(qi)].correct,
  ).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const perfect = allAnswered && correctCount === questions.length;

  useEffect(() => {
    if (!chapterId || !quizId || !allAnswered) return;
    store.markQuizDone(chapterId, quizId, { correct: correctCount, total: questions.length });
    if (perfect && !rewardedRef.current) {
      rewardedRef.current = true;
      store.addXp(PERFECT_XP, `quiz:${chapterId}:${quizId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered, correctCount]);

  const pick = (qi: number, oi: number) => {
    if (answers[qi] === questions[qi].correct) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
  };

  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="sc">
      <div
        className="sc-progress"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={questions.length}
      >
        <div className="sc-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="sc-progress-label">
        Отвечено вопросов: {answeredCount} из {questions.length}
      </div>

      {questions.map((item, qi) => {
        const picked = answers[qi];
        const solved = picked === item.correct;
        return (
          <div className="sc-question" key={qi}>
            <div className="sc-q">{item.q}</div>
            <div className="sc-options">
              {item.options.map((opt, oi) => {
                const isPicked = picked === oi;
                const cls = isPicked ? (solved ? 'sc-right' : 'sc-wrong') : '';
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`sc-option ${cls}`.trim()}
                    disabled={solved}
                    onClick={() => pick(qi, oi)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {picked !== undefined ? (
              <div className={`sc-feedback ${solved ? 'sc-ok' : 'sc-no'}`}>
                {solved ? (
                  <>
                    <span className="sc-ok-text">Верно!</span>
                    {item.why ? <span className="sc-why"> {item.why}</span> : null}
                  </>
                ) : (
                  'Не совсем — подумай ещё'
                )}
              </div>
            ) : null}
          </div>
        );
      })}
      <div className="sc-counter">
        Отвечено верно: {correctCount} из {questions.length}
      </div>
      {allAnswered ? (
        <div className="sc-result">
          Пройдено: {correctCount} из {questions.length}
        </div>
      ) : null}
      {perfect ? <div className="sc-result-perfect">+{PERFECT_XP} XP за идеальное прохождение</div> : null}
    </div>
  );
}
