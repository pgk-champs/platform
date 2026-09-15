import React from 'react';
import Link from '@docusaurus/Link';
import './trainers.css';

// Что осталось от старого списка Маршрута. Основной перечень глав теперь рисуют
// сосуды (VesselStrip), сертификат считает сама страница. Здесь — только то, что
// в маршрут не входит: необязательные углубления и простые страницы.
//
// Ручной галочки «пройдено» больше нет нигде: прогресс считается по делам,
// см. src/lib/chapterFill.ts.

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

const docHref = (path: string) => `/docs/${path.replace(/\.mdx?$/, '')}`;

export default function RouteList({
  map,
  pages = [],
  track,
}: {
  map: Entry[];
  // Простые страницы: памятки и разборы. Прогресса и экзамена у них нет, поэтому
  // здесь они без уровня — просто чтобы их было видно.
  pages?: Entry[];
  track: 'мобилка' | 'блокчейн';
}): React.ReactElement | null {
  const forTrack = (e: Entry) => e.audience === 'все' || e.audience === track;
  const deepDives = map.filter(forTrack).filter((e) => e.level === 'углубление');
  const visiblePages = pages.filter(forTrack);

  if (deepDives.length === 0 && visiblePages.length === 0) return null;

  return (
    <div className="rl">
      {deepDives.length > 0 && (
        <>
          <h2>Отдельные темы</h2>
          <p className="rl-deep-note">Углубления вне основного маршрута — проходи в любом порядке.</p>
          <ul className="rl-list">
            {deepDives.map((ch) => (
              <li key={ch.id}>
                <Link to={docHref(ch.path)}>{ch.title}</Link>
                <span className={`rl-badge rl-badge-${ch.level}`}>{ch.level}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {visiblePages.length > 0 && (
        <>
          <h2>Страницы</h2>
          <p className="rl-deep-note">
            Памятки и разборы от наставников и студентов. Без прогресса и экзамена — читаются как есть.
          </p>
          <ul className="rl-list">
            {visiblePages.map((pg) => (
              <li key={pg.id}>
                <Link to={docHref(pg.path)}>{pg.title}</Link>
                <span className="rl-badge rl-badge-страница">страница</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
