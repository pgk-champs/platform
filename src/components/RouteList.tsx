import React, { useEffect, useState } from 'react';
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

const LEVELS: Level[] = ['база', 'углубление', 'челлендж'];
const PROGRESS_KEY = 'pgk-progress';

function loadProgress(): Record<string, boolean> {
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

export default function RouteList({ map, track }: { map: Entry[]; track: 'мобилка' | 'блокчейн' }) {
  const chapters = map.filter((e) => e.audience === 'все' || e.audience === track);
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

  return (
    <div className="rl">
      <ul className="rl-list">
        {chapters.map((ch) => (
          <li key={ch.id}>
            <input
              type="checkbox"
              checked={!!progress[ch.id]}
              onChange={() => toggle(ch.id)}
              aria-label={`Пройдено: ${ch.title}`}
            />
            <a href={`/docs/${ch.path.replace(/\.mdx?$/, '')}`}>{ch.title}</a>
            <span className={`rl-badge rl-badge-${ch.level}`}>{ch.level}</span>
          </li>
        ))}
      </ul>

      <h2>Матрица</h2>
      <table className="rl-matrix">
        <thead>
          <tr>
            <th>Глава</th>
            {LEVELS.map((lvl) => (
              <th key={lvl}>{lvl}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chapters.map((ch) => (
            <tr key={ch.id}>
              <td>{ch.title}</td>
              {LEVELS.map((lvl) => (
                <td key={lvl}>{ch.level === lvl ? '✓' : ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
