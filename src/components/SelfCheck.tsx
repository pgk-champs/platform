import React, { useState } from 'react';
import './trainers.css';

export type Question = { q: string; options: string[]; correct: number; why?: string };

export default function SelfCheck({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const correctCount = Object.entries(answers).filter(
    ([qi, oi]) => oi === questions[Number(qi)].correct,
  ).length;

  const pick = (qi: number, oi: number) => {
    if (answers[qi] === questions[qi].correct) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
  };

  return (
    <div className="sc">
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
    </div>
  );
}
