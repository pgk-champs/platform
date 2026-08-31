import React from 'react';
import './trainers.css';

// Стилизованный details/summary для сворачивания блоков (решения челленджей,
// подсказки, доп. материал). Раскрытие/закрытие — нативное поведение
// браузера, JS-состояние не нужно.
export default function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="fold">
      <summary className="fold-summary">{title}</summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}
