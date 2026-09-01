import React, { useEffect, useState } from 'react';
import { store } from '../lib/store';
import { evaluate, type Achievement } from '../lib/achievements';
import './trainers.css';

type Toast = Achievement & { key: string };

// Смонтирован один раз в src/theme/Root.tsx: слушает изменения в store,
// проверяет реестр достижений и показывает тост на новую разблокировку.
export default function AchievementsWatcher() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onChange = () => {
      const newly = evaluate();
      if (newly.length === 0) return;
      setToasts((prev) => [...prev, ...newly.map((a) => ({ ...a, key: `${a.id}-${Date.now()}` }))]);
    };
    onChange(); // достижения, набранные ещё до монтирования (загрузка сохранённого прогресса)
    return store.subscribe(onChange);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="ach-toast-stack">
      {toasts.map((t) => (
        <div key={t.key} className="ach-toast">
          <span className="ach-toast-icon" aria-hidden="true">
            {t.icon}
          </span>
          Достижение: {t.title}
        </div>
      ))}
    </div>
  );
}
