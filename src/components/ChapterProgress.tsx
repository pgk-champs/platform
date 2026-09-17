import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
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

// Живой виджет вверху главы: доля прочитанного полосой, квизы и тренажёры —
// делениями. Строкой «Прочитано 0% · Квизы 0/6 · Тренажёры 0/6» не было видно,
// сколько осталось. Закрашенное деление — медь: это твой прогресс, а не
// структура. Модель прогресса тут не считается, она одна — chapterFill.ts.

/** Ряд разбивки. Форма продиктована данными: тренажёр ровно один у 100 глав из
 *  137 и отсутствует у 11, поэтому у ряда три поведения, а не одно. */
function Row({
  kind,
  label,
  done,
  total,
}: {
  kind: 'quizzes' | 'trainers';
  label: string;
  done: number;
  total: number;
}) {
  if (total === 0) return null; // 11 глав без тренажёров
  return (
    <div className={`cp-row cp-row--${kind}`}>
      <span className="cp-row-label">{label}</span>
      {kind === 'trainers' && total <= 2 ? (
        // Сетка из одной ячейки читается как поломка — здесь состояние словом.
        // Только для тренажёров: у квизов минимум три на главу, а «пройден»
        // про них ещё и звучало бы неверно.
        <span className={`cp-state${done >= total ? ' cp-state--on' : ''}`}>
          {done >= total ? 'пройден' : 'не пройден'}
        </span>
      ) : (
        <span className="cp-grid" role="img" aria-label={`${done} из ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`cp-cell${i < done ? ' cp-cell--on' : ''}`} />
          ))}
        </span>
      )}
      <span className="cp-row-num">
        {done}/{total}
      </span>
    </div>
  );
}
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
        <div className="cp-row cp-row--read">
          <span className="cp-row-label">Прочитано</span>
          <span className="cp-read-bar" aria-hidden="true">
            <span className="cp-read-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="cp-row-num">{pct}%</span>
        </div>
        <Row kind="quizzes" label="Квизы" done={quizzesDone} total={totalQuizzes} />
        <Row kind="trainers" label="Тренажёры" done={trainersDone} total={totalTrainers} />
        {/* Уровень ведёт на страницу достижений: он висит на всех 137 главах и
            до сих пор был тупиком — показывал, но никуда не вёл, а попасть к
            43 достижениям можно было только через дропдаун аватара. */}
        <Link
          className="cp-level"
          to="/achievements"
          title={lvl.maxLevel ? 'Максимальный уровень' : `До уровня ${lvl.level + 1}: ${lvl.xpToNext} XP`}
        >
          Уровень {lvl.level} · {lvl.title}
          <span className="cp-level-bar">
            <span className="cp-level-fill" style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
          </span>
        </Link>
      </div>
      <ChapterTour />
    </>
  );
}
