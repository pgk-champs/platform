import React from 'react';
import './trainers.css';

// Единый свёрнутый блок «Как это устроено под капотом» для сложных
// инструментов: честное объяснение реализации — это тоже обучение.
export default function UnderHood({ children }: { children: React.ReactNode }) {
  return (
    <details className="under-hood">
      <summary>Как это устроено под капотом</summary>
      <div className="under-hood-body">{children}</div>
    </details>
  );
}
