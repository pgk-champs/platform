import React, { useEffect, useRef, useState } from 'react';
import './trainers.css';

export type Part = { text: string; label: string; note?: string };

// Toggletip, не hover-тултип: подсказка открывается кликом/тапом (работает
// на touch-устройствах без hover) и остаётся открытой, пока её не закроют —
// повторный клик по той же части, клик снаружи или Escape (WCAG 1.4.13:
// контент по hover/focus обязан быть dismissible + persistent — здесь для
// простоты и надёжности на touch тот же принцип применён к клику).
export default function SyntaxBreakdown({ parts }: { parts: Part[] }) {
  const [active, setActive] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active === null) return undefined;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [active]);

  const toggle = (i: number) => setActive((cur) => (cur === i ? null : i));

  return (
    <div className="sb" ref={rootRef}>
      <pre className="sb-code">{parts.map((p, i) => (
        <button key={i} type="button" aria-label={p.label} aria-pressed={active === i}
          className={'sb-part' + (active === i ? ' sb-on' : '')}
          onClick={() => toggle(i)}
        >{p.text}</button>))}
      </pre>
      <div className="sb-hint" role="status">
        {active === null ? 'Нажми на часть выражения' :
          <><b>{parts[active].label}</b>{parts[active].note ? ` — ${parts[active].note}` : ''}</>}
      </div>
    </div>
  );
}
