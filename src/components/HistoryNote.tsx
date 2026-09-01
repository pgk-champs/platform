import React from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Историческая врезка «Как это было» — сворачиваемый факт из истории IT
// внутри главы. Открытие трекается в store: за 5 открытых врезок выдаётся
// достижение «Археолог».
export default function HistoryNote({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <details className="history-note">
      {/* click приходит до переключения open: !open означает «сейчас откроется».
          Клик (в т.ч. с клавиатуры — Enter/Space дают click) надёжнее toggle,
          которого нет в jsdom. */}
      <summary
        className="history-note-summary"
        onClick={(e) => {
          const details = e.currentTarget.parentElement as HTMLDetailsElement | null;
          if (details && !details.open) store.easter.openHistory(id);
        }}
      >
        <span className="history-note-icon" aria-hidden="true">
          📜
        </span>
        Как это было
      </summary>
      <div className="history-note-body">{children}</div>
    </details>
  );
}
