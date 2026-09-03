import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

export type Question = {
  q: string;
  options: string[];
  correct: number;
  why?: string;
  /** Показывается после 2 неверных попыток — наводит на мысль, не выдавая ответ. */
  hint?: string;
};

const PERFECT_XP = 20;
const HINT_AFTER_ATTEMPTS = 2;
const GENERIC_HINT = 'Подсказка: не гадай — вернись к разделу перед вопросом и перечитай его ещё раз, ответ там прямым текстом.';

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
  // Перерисовываемся при изменениях в store, чтобы блок «Мои результаты»
  // подхватил только что записанную попытку (markQuizDone пишет в store из
  // эффекта ниже, уже после первого рендера с allAnswered=true).
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [wrongCounts, setWrongCounts] = useState<Record<number, number>>({});
  const [xpAwarded, setXpAwarded] = useState(0);
  const recordedRef = useRef(false);

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qi, oi]) => oi === questions[Number(qi)].correct,
  ).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  // В зачёт идёт ПЕРВАЯ попытка: вопрос без единого промаха. Иначе любой
  // перебор вариантов (неверные ответы можно менять) записывался бы как
  // идеальное прохождение — и достижения «Квиз на 100%» брались бы перебором.
  const firstTryCorrect = questions.filter((_, qi) => (wrongCounts[qi] ?? 0) === 0).length;
  const perfect = allAnswered && firstTryCorrect === questions.length;

  useEffect(() => {
    // Одна запись в quizLog на одно прохождение: раньше эффект срабатывал на
    // каждое исправление и «Попыток всего» росло на 1 за каждую правку.
    if (!chapterId || !quizId || !allAnswered || recordedRef.current) return;
    recordedRef.current = true;
    const firstRun = !store.getProgress().quizzes[chapterId]?.[quizId];
    store.markQuizDone(chapterId, quizId, { correct: firstTryCorrect, total: questions.length });
    // XP — только за первое прохождение квиза, иначе перезагрузка страницы и
    // повтор давали бы +20 XP снова.
    if (perfect && firstRun) {
      store.addXp(PERFECT_XP, `quiz:${chapterId}:${quizId}`);
      setXpAwarded(PERFECT_XP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered]);

  const pick = (qi: number, oi: number) => {
    if (answers[qi] === questions[qi].correct) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
    if (oi !== questions[qi].correct) {
      setWrongCounts((c) => ({ ...c, [qi]: (c[qi] ?? 0) + 1 }));
    }
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
            {!solved && (wrongCounts[qi] ?? 0) >= HINT_AFTER_ATTEMPTS ? (
              <div className="sc-scaffold-hint" role="status">
                {item.hint ?? GENERIC_HINT}
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
          {firstTryCorrect < correctCount ? (
            // Без своего класса: наследует оформление плашки результата —
            // трогать общий trainers.css ради одной строки незачем.
            <div>
              С первой попытки: {firstTryCorrect} из {questions.length} — в зачёт идёт этот результат.
            </div>
          ) : null}
        </div>
      ) : null}
      {perfect ? (
        <div className="sc-result-perfect">
          Идеально — все ответы с первой попытки!{xpAwarded ? ` +${xpAwarded} XP` : ''}
        </div>
      ) : null}
      {chapterId && quizId && allAnswered
        ? (() => {
            const stats = store.quiz.stats(chapterId, quizId);
            return (
              <div className="sc-history">
                <div className="sc-history-title">Мои результаты</div>
                <div className="sc-history-row">
                  Лучший: {stats.best ? `${stats.best.correct} из ${stats.best.total}` : `${correctCount} из ${questions.length}`}
                </div>
                <div className="sc-history-row">Попыток всего: {stats.count}</div>
                <div className="sc-history-row">Текущая серия без ошибок: {stats.streak}</div>
              </div>
            );
          })()
        : null}
    </div>
  );
}
