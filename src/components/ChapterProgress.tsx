import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import { levelForXp } from '../lib/levels';
import ChapterTour from './ChapterTour';
import './trainers.css';

export type ChapterProgressProps = {
  chapterId: string;
  /** Знаменатели считает автор главы — store хранит только то, что уже сделано. */
  totalSections: number;
  totalQuizzes: number;
  totalTrainers: number;
};

const EMPTY_PROGRESS = { sections: {}, quizzes: {}, trainers: {} } as ReturnType<typeof store.getProgress>;

// Маленький живой виджет вверху главы: «Прочитано N% · Квизы x/y · Тренажёры x/y».
export default function ChapterProgress({ chapterId, totalSections, totalQuizzes, totalTrainers }: ChapterProgressProps) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  // store на клиенте читает localStorage ещё при импорте модуля, поэтому
  // первый клиентский рендер обязан повторить серверный (пустой прогресс) —
  // иначе у вернувшегося студента React ловит hydration mismatch и
  // перерисовывает страницу целиком (мигание + ошибка в консоли).
  // Настоящие числа появляются сразу после монтирования.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const progress = mounted ? store.getProgress() : EMPTY_PROGRESS;

  const readSections = Math.min(progress.sections[chapterId]?.length ?? 0, totalSections);
  // Math.min — страховка от рассинхрона «главы и виджета»: если в mdx
  // забудут поднять totalQuizzes/totalTrainers при добавлении квиза или
  // тренажёра, счётчик не покажет «5 из 4», а честно упрётся в знаменатель.
  const quizzesDone = Math.min(Object.keys(progress.quizzes[chapterId] ?? {}).length, totalQuizzes);
  const trainersDone = Math.min(Object.keys(progress.trainers[chapterId] ?? {}).length, totalTrainers);
  const pct = totalSections > 0 ? Math.round((100 * readSections) / totalSections) : 0;
  const lvl = levelForXp(mounted ? store.getXp() : 0);

  return (
    <>
      <div className="cp" role="status">
        <span className="cp-item">Прочитано {pct}%</span>
        <span className="cp-sep" aria-hidden="true">
          ·
        </span>
        <span className="cp-item">
          Квизы {quizzesDone}/{totalQuizzes}
        </span>
        <span className="cp-sep" aria-hidden="true">
          ·
        </span>
        <span className="cp-item">
          Тренажёры {trainersDone}/{totalTrainers}
        </span>
        <span className="cp-sep" aria-hidden="true">
          ·
        </span>
        <span
          className="cp-item cp-level"
          title={lvl.maxLevel ? 'Максимальный уровень' : `До уровня ${lvl.level + 1}: ${lvl.xpToNext} XP`}
        >
          Уровень {lvl.level} · {lvl.title}
          <span className="cp-level-bar">
            <span className="cp-level-fill" style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
          </span>
        </span>
        <span className="cp-read-bar" aria-hidden="true">
          <span className="cp-read-fill" style={{ width: `${pct}%` }} />
        </span>
      </div>
      <ChapterTour />
    </>
  );
}
