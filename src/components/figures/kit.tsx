import React from 'react';

/* Общий визуальный язык всех схем платформы: тёмный градиент-подложка,
 * белая «тушь», акцент primary-lightest. Новые схемы рисуются ТОЛЬКО этими
 * примитивами, иначе картинки в разных главах разъедутся по стилю. */

export type Scheme = (aria: string) => React.ReactNode;
export type Schemes = Record<string, Scheme>;

export const ACCENT = 'var(--ifm-color-primary-lightest)';
export const DARK = 'var(--ifm-color-primary-darkest)';
export const INK = 'rgba(255,255,255,0.9)';
export const SOFT = 'rgba(255,255,255,0.14)';
export const FADE = 'rgba(255,255,255,0.45)';
export const MONO = 'var(--ifm-font-family-monospace)';

export function Panel({
  id, w, h, aria, children,
}: {
  id: string;
  w: number;
  h: number;
  aria: string;
  children: React.ReactNode;
}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={aria} style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--ifm-color-primary-dark)" />
          <stop offset="1" stopColor="var(--ifm-color-primary-darkest)" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} rx="16" fill={`url(#${id})`} />
      <circle cx={w - 130} cy={16} r={150} fill="rgba(255,255,255,0.05)" />
      {children}
    </svg>
  );
}

/* Стрелка вправо с наконечником */
export function Arrow({ x1, y1, x2, y2, color = INK, w = 5 }: {
  x1: number; y1: number; x2: number; y2: number; color?: string; w?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hx = x2 - ux * 14;
  const hy = y2 - uy * 14;
  return (
    <g stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x1} ${y1}L${hx} ${hy}`} />
      <path d={`M${x2} ${y2}L${hx - uy * 7} ${hy + ux * 7}M${x2} ${y2}L${hx + uy * 7} ${hy - ux * 7}`} />
    </g>
  );
}

export function FileIcon({ x, y, accent }: { x: number; y: number; accent?: boolean }) {
  return (
    <g>
      <path
        d={`M${x} ${y + 8}a8 8 0 0 1 8-8h26l16 16v40a8 8 0 0 1-8 8h-34a8 8 0 0 1-8-8z`}
        fill={accent ? ACCENT : SOFT}
        stroke={accent ? 'none' : INK}
        strokeWidth={2.5}
      />
      <path d={`M${x + 10} ${y + 34}h30M${x + 10} ${y + 46}h20`} stroke={accent ? DARK : FADE} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

