import React, { useState } from 'react';
import './trainers.css';

export type Part = { text: string; label: string; note?: string };

export default function SyntaxBreakdown({ parts }: { parts: Part[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="sb">
      <pre className="sb-code">{parts.map((p, i) => (
        <span key={i} tabIndex={0} aria-label={p.label}
          className={'sb-part' + (active === i ? ' sb-on' : '')}
          onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
          onMouseLeave={() => setActive(null)} onBlur={() => setActive(null)}
        >{p.text}</span>))}
      </pre>
      <div className="sb-hint" aria-live="polite">
        {active === null ? 'Наведи на часть выражения' :
          <><b>{parts[active].label}</b>{parts[active].note ? ` — ${parts[active].note}` : ''}</>}
      </div>
    </div>
  );
}
