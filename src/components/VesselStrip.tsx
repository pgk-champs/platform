import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { fillOf } from '../lib/chapterFill';
import './vessels.css';

// Окно ближайших глав. Показываются не все главы трека, а пять: при 29 делениях
// на телефоне выходило по девять пикселей на главу и уровень было не разглядеть.
// Масштаб возвращает тонкая полоса всего трека под окном.
const WINDOW = 5;

export type StripChapter = { id: string; title: string; path: string };

export default function VesselStrip({
  chapters,
  currentId,
}: {
  chapters: StripChapter[];
  currentId: string | null;
}): React.ReactElement | null {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const total = chapters.length;
  const win = Math.min(WINDOW, total);
  const found = chapters.findIndex((c) => c.id === currentId);
  const currentIndex = found === -1 ? 0 : found;

  const clamp = (s: number) => Math.max(0, Math.min(Math.round(s), total - win));
  const [start, setStart] = useState(() => clamp(currentIndex - Math.floor(win / 2)));
  // Окно двигали руками — оно больше не бежит за текущей главой само.
  const [pinned, setPinned] = useState(false);
  const [dragging, setDragging] = useState(false);
  const miniRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) setStart(clamp(currentIndex - Math.floor(win / 2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, win, pinned, total]);

  if (total === 0) return null;

  const shown = chapters.slice(start, start + win);
  const href = (c: StripChapter) => `/docs/${c.path.replace(/\.mdx?$/, '')}`;

  const moveTo = (s: number) => {
    setPinned(true);
    setStart(clamp(s));
  };

  const startFromClientX = (clientX: number) => {
    const r = miniRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return start;
    return ((clientX - r.left) / r.width) * total - win / 2;
  };

  return (
    <div className="vs">
      <div className="vs-win">
        <button
          className="vs-arrow"
          type="button"
          aria-label="Предыдущие главы"
          disabled={start === 0}
          onClick={() => moveTo(start - win)}
        >
          ‹
        </button>

        <div className="vs-slots">
          {shown.map((c) => {
            const pct = Math.round(fillOf(c.id) * 100);
            const isCurrent = c.id === currentId;
            const vessel = [
              'vessel',
              pct === 100 ? 'full' : '',
              isCurrent && pct > 0 && pct < 100 ? 'here' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div className={isCurrent ? 'vs-slot here' : 'vs-slot'} key={c.id}>
                <Link className={vessel} to={href(c)} title={c.title} data-testid="vessel">
                  <span className="lid" />
                  <span className="vat">
                    <i className="liquid" style={{ height: pct + '%' }}>
                      <i className="foam" />
                    </i>
                  </span>
                  <span className="vs-pc">{pct > 0 && pct < 100 ? pct + '%' : ''}</span>
                </Link>
                <span className="vs-cap" data-testid="cap">
                  {c.title}
                </span>
              </div>
            );
          })}
        </div>

        <button
          className="vs-arrow"
          type="button"
          aria-label="Следующие главы"
          disabled={start + win >= total}
          onClick={() => moveTo(start + win)}
        >
          ›
        </button>
      </div>

      <div className="vs-minirow">
        <span className="vs-edge">начало</span>
        <div
          className="vs-mini"
          ref={miniRef}
          role="slider"
          tabIndex={0}
          aria-label="Положение окна на треке"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={start + 1}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            moveTo(startFromClientX(e.clientX));
          }}
          onPointerMove={(e) => {
            if (dragging) moveTo(startFromClientX(e.clientX));
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault();
            moveTo(start + (e.key === 'ArrowRight' ? 1 : -1));
          }}
        >
          {chapters.map((c) => {
            const f = fillOf(c.id);
            return <i key={c.id} className={f >= 1 ? 'full' : f > 0 ? 'part' : ''} />;
          })}
          <div
            className="vs-view"
            data-testid="view"
            style={{ left: (start / total) * 100 + '%', width: (win / total) * 100 + '%' }}
          />
        </div>
        <span className="vs-edge">конец</span>
      </div>
    </div>
  );
}
