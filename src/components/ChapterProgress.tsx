import React, { useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

export type ChapterProgressProps = {
  chapterId: string;
  /** Знаменатели считает автор главы — store хранит только то, что уже сделано. */
  totalSections: number;
  totalQuizzes: number;
  totalTrainers: number;
};

// Маленький живой виджет вверху главы: «Прочитано N% · Квизы x/y · Тренажёры x/y».
export default function ChapterProgress({ chapterId, totalSections, totalQuizzes, totalTrainers }: ChapterProgressProps) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const progress = store.getProgress();

  const readSections = Math.min(progress.sections[chapterId]?.length ?? 0, totalSections);
  const quizzesDone = Object.keys(progress.quizzes[chapterId] ?? {}).length;
  const trainersDone = Object.keys(progress.trainers[chapterId] ?? {}).length;
  const pct = totalSections > 0 ? Math.round((100 * readSections) / totalSections) : 0;

  return (
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
    </div>
  );
}
