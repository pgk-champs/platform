import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import knowledgeMap from '../data/knowledge-map.json';
import { store } from '../lib/store';
import { fillOf } from '../lib/chapterFill';
import { plural } from '../lib/plural';
import './trainers.css';

// Витрина трека. До неё на /docs/mobile и /docs/blockchain был заголовок,
// баннер и абзац — и ноль карточек на 46 и 72 главы: попасть в них можно было
// только через сайдбар.
//
// Штатный <DocCardList /> тут не годится: он показывает description из
// фронтматтера, а он есть у 10 глав из 140 — вышла бы стена одинаковых
// карточек с одним заголовком. Вместо описания показываем то, что в главе
// правда есть, и сколько из этого пройдено. Всё берётся из карты знаний,
// руками ничего не перечисляется.

type Entry = {
  id: string;
  title: string;
  track: string;
  level: string;
  order: number;
  num: string;
  path: string;
  blockExam?: boolean;
  totals: { sections: number; quizzes: number; trainers: number };
};

// Порядок ярусов, а не алфавит: сначала то, с чего начинают.
const LEVELS = ['база', 'углубление', 'челлендж'] as const;
const LEVEL_NOTE: Record<string, string> = {
  база: 'Основной путь трека — по порядку.',
  углубление: 'Не обязательны для маршрута, но спрашивают на чемпионате.',
  челлендж: 'Собрать всё вместе.',
};

function Card({ c, fill }: { c: Entry; fill: number | null }) {
  const parts = [
    c.totals.sections > 0 &&
      `${c.totals.sections} ${plural(c.totals.sections, 'секция', 'секции', 'секций')}`,
    c.totals.quizzes > 0 &&
      `${c.totals.quizzes} ${plural(c.totals.quizzes, 'проверка', 'проверки', 'проверок')}`,
    c.totals.trainers > 0 &&
      `${c.totals.trainers} ${plural(c.totals.trainers, 'тренажёр', 'тренажёра', 'тренажёров')}`,
  ].filter(Boolean);

  const pct = fill === null ? 0 : Math.round(fill * 100);
  return (
    <Link className="tc-card" to={`/docs/${c.path.replace(/\.mdx?$/, '')}`}>
      <span className="tc-num">{c.num}</span>
      <span className="tc-title">{c.title}</span>
      <span className="tc-parts">{parts.join(' · ')}</span>
      {c.blockExam && <span className="tc-exam">экзамен по блоку</span>}
      {/* Полоса появляется только у начатых: пустая шкала у каждой из 72 глав
          читалась бы как список невыполненных дел, а не как витрина. */}
      {pct > 0 && (
        <span className="tc-bar" aria-label={`Пройдено ${pct}%`}>
          <span className="tc-fill" style={{ width: `${pct}%` }} />
        </span>
      )}
    </Link>
  );
}

export default function TrackChapters({ track }: { track: string }): React.ReactElement {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  // store поднимает localStorage при импорте: до монтирования прогресс не
  // читаем, иначе первый клиентский рендер разойдётся с серверным.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const all = (knowledgeMap as Entry[])
    .filter((c) => c.track === track)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="tc">
      {LEVELS.map((level) => {
        const list = all.filter((c) => c.level === level);
        if (list.length === 0) return null;
        return (
          <section key={level} className="tc-group">
            <h2 className="tc-group-title">
              {level[0].toUpperCase() + level.slice(1)}{' '}
              <span className="tc-group-count">
                {list.length} {plural(list.length, 'глава', 'главы', 'глав')}
              </span>
            </h2>
            <p className="tc-group-note">{LEVEL_NOTE[level]}</p>
            <div className="tc-grid">
              {list.map((c) => (
                <Card key={c.id} c={c} fill={mounted ? fillOf(c.id) : null} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
