import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import knowledgeMap from '../data/knowledge-map.json';
import { levelForXp } from '../lib/levels';
import ChapterTour from './ChapterTour';
import './trainers.css';

export type ChapterProgressProps = {
  chapterId: string;
  /** Знаменатели считаются на сборке по самому файлу главы. Передавать их
   *  вручную больше не нужно — параметры оставлены только для тестов. */
  totalSections?: number;
  totalQuizzes?: number;
  totalTrainers?: number;
};

type Totals = { sections: number; quizzes: number; trainers: number };
const TOTALS: Record<string, Totals> = Object.fromEntries(
  (knowledgeMap as { id: string; totals: Totals }[]).map((e) => [e.id, e.totals]),
);
const NO_TOTALS: Totals = { sections: 0, quizzes: 0, trainers: 0 };

const EMPTY_PROGRESS = { sections: {}, quizzes: {}, trainers: {} } as ReturnType<typeof store.getProgress>;

// Маленький живой виджет вверху главы: «Прочитано N% · Квизы x/y · Тренажёры x/y».
export default function ChapterProgress(props: ChapterProgressProps) {
  const { chapterId } = props;
  const counted = TOTALS[chapterId] ?? NO_TOTALS;
  const totalSections = props.totalSections ?? counted.sections;
  const totalQuizzes = props.totalQuizzes ?? counted.quizzes;
  const totalTrainers = props.totalTrainers ?? counted.trainers;
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
