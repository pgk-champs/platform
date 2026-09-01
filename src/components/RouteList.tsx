import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import Certificate from './Certificate';
import './trainers.css';

export type Audience = 'все' | 'мобилка' | 'блокчейн';
export type Level = 'база' | 'углубление' | 'челлендж';

export type Entry = {
  id: string;
  title: string;
  audience: Audience;
  level: Level;
  order: number;
  path: string;
};

type Status = 'passed' | 'reading' | 'not-started';

const LEVELS: Level[] = ['база', 'углубление', 'челлендж'];
const PROGRESS_KEY = 'pgk-progress';
const STATUS_LABEL: Record<Status, string> = { passed: 'пройдена', reading: 'читается', 'not-started': 'не начата' };

export function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, boolean>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore (private mode, quota, SSR)
  }
}

// «Пройдена» — ручной чекбокс подтверждён И все пройденные в главе квизы без
// ошибок; «читается» — есть хоть какой-то след в store (секция/квиз/тренажёр)
// или отмечен чекбокс без идеальных квизов; иначе «не начата».
export function statusOf(chapterId: string, checked: boolean): Status {
  const progress = store.getProgress();
  const quizzes = progress.quizzes[chapterId] ?? {};
  const quizIds = Object.keys(quizzes);
  const allQuizzesPerfect = quizIds.every((id) => quizzes[id].correct === quizzes[id].total);

  if (checked && allQuizzesPerfect) return 'passed';

  const hasSections = (progress.sections[chapterId]?.length ?? 0) > 0;
  const hasTrainers = Object.keys(progress.trainers[chapterId] ?? {}).length > 0;
  if (checked || hasSections || quizIds.length > 0 || hasTrainers) return 'reading';

  return 'not-started';
}

export default function RouteList({ map, track }: { map: Entry[]; track: 'мобилка' | 'блокчейн' }) {
  // Прогресс квизов/секций/тренажёров живёт в общем store — статус-чипы должны
  // перерисовываться при его изменениях (например после квиза на другой вкладке).
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const visible = map.filter((e) => e.audience === 'все' || e.audience === track);
  // Углубления — необязательные отдельные темы: не участвуют в основном
  // маршруте (порядок/замки/сертификат), показываются своей секцией ниже.
  const chapters = visible.filter((e) => e.level !== 'углубление');
  const deepDives = visible.filter((e) => e.level === 'углубление');
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (chapters.length === 0) {
    return <div className="rl">Глав пока нет</div>;
  }

  const toggle = (id: string) => {
    const next = { ...progress, [id]: !progress[id] };
    setProgress(next);
    saveProgress(next);
  };

  const statuses = chapters.map((ch) => statusOf(ch.id, !!progress[ch.id]));
  const firstOpenIndex = statuses.findIndex((s) => s !== 'passed');

  const onLockedClick = (e: React.MouseEvent, gateTitle: string) => {
    const ok = window.confirm(`Эта глава идёт после „${gateTitle}“. Перейти всё равно?`);
    if (!ok) e.preventDefault();
  };

  return (
    <div className="rl">
      <ul className="rl-list">
        {chapters.map((ch, i) => {
          const status = statuses[i];
          const locked = firstOpenIndex !== -1 && i > firstOpenIndex;
          return (
            <li key={ch.id}>
              <input
                type="checkbox"
                checked={!!progress[ch.id]}
                onChange={() => toggle(ch.id)}
                aria-label={`Пройдено: ${ch.title}`}
              />
              <Link
                to={`/docs/${ch.path.replace(/\.mdx?$/, '')}`}
                onClick={locked ? (e) => onLockedClick(e, chapters[firstOpenIndex].title) : undefined}
              >
                {ch.title}
              </Link>
              <span className={`rl-status rl-status-${status}`}>{STATUS_LABEL[status]}</span>
              {locked ? (
                <span className="rl-lock" title="Разблокировка условная — можно перейти после подтверждения">
                  🔒 дальше
                </span>
              ) : null}
              <span className={`rl-badge rl-badge-${ch.level}`}>{ch.level}</span>
            </li>
          );
        })}
      </ul>

      {deepDives.length > 0 && (
        <>
          <h2>Отдельные темы</h2>
          <p className="rl-deep-note">Углубления вне основного маршрута — проходи в любом порядке.</p>
          <ul className="rl-list">
            {deepDives.map((ch) => {
              const status = statusOf(ch.id, !!progress[ch.id]);
              return (
                <li key={ch.id}>
                  <input
                    type="checkbox"
                    checked={!!progress[ch.id]}
                    onChange={() => toggle(ch.id)}
                    aria-label={`Пройдено: ${ch.title}`}
                  />
                  <Link to={`/docs/${ch.path.replace(/\.mdx?$/, '')}`}>{ch.title}</Link>
                  <span className={`rl-status rl-status-${status}`}>{STATUS_LABEL[status]}</span>
                  <span className={`rl-badge rl-badge-${ch.level}`}>{ch.level}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h2>Матрица</h2>
      <table className="rl-matrix">
        <thead>
          <tr>
            <th scope="col">Глава</th>
            {LEVELS.map((lvl) => (
              <th scope="col" key={lvl}>{lvl}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...chapters, ...deepDives].map((ch) => (
            <tr key={ch.id}>
              <th scope="row">{ch.title}</th>
              {LEVELS.map((lvl) => (
                <td key={lvl}>{ch.level === lvl ? '✓' : ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Certificate
        track={track}
        total={chapters.length}
        passed={statuses.filter((s) => s === 'passed').length}
      />
    </div>
  );
}
