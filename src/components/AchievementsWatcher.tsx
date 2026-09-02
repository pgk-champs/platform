import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import { evaluate, type Achievement } from '../lib/achievements';
import { levelForXp } from '../lib/levels';
import './trainers.css';

type AchToast = { kind: 'achievement'; key: string; icon: string; title: string };
type XpToast = { kind: 'xp'; key: string; amount: number };
type LevelToast = { kind: 'level'; key: string; level: number; title: string };
type Toast = AchToast | XpToast | LevelToast;

// Смонтирован один раз в src/theme/Root.tsx: слушает изменения в store,
// проверяет реестр достижений, следит за XP/уровнем и показывает тост на
// новую разблокировку, каждое начисление XP и смену уровня.
export default function AchievementsWatcher() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Базовый XP фиксируется ДО первого прогона evaluate() ниже — иначе XP,
  // уже накопленный при загрузке сохранённого прогресса, сам себе рисовал бы
  // тост «+N XP» при каждом монтировании страницы.
  const prevXpRef = useRef(0);

  useEffect(() => {
    prevXpRef.current = store.getXp();
    const onChange = () => {
      const xp = store.getXp();
      const prevXp = prevXpRef.current;
      const fresh: Toast[] = [];
      if (xp > prevXp) {
        fresh.push({ kind: 'xp', key: `xp-${Date.now()}-${Math.random()}`, amount: xp - prevXp });
        const prevLevel = levelForXp(prevXp).level;
        const info = levelForXp(xp);
        if (info.level > prevLevel) {
          fresh.push({ kind: 'level', key: `lvl-${Date.now()}-${Math.random()}`, level: info.level, title: info.title });
        }
      }
      prevXpRef.current = xp;
      const newly = evaluate();
      fresh.push(
        ...newly.map((a: Achievement) => ({ kind: 'achievement' as const, key: `${a.id}-${Date.now()}`, icon: a.icon, title: a.title })),
      );
      if (fresh.length) setToasts((prev) => [...prev, ...fresh]);
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
      {toasts.map((t) => {
        if (t.kind === 'xp') {
          return (
            <div key={t.key} className="ach-toast xp-toast">
              <span className="ach-toast-icon" aria-hidden="true">
                ✨
              </span>
              +{t.amount} XP
            </div>
          );
        }
        if (t.kind === 'level') {
          return (
            <div key={t.key} className="ach-toast level-toast">
              <span className="ach-toast-icon" aria-hidden="true">
                🎉
              </span>
              Новый уровень {t.level}: {t.title}!
            </div>
          );
        }
        return (
          <div key={t.key} className="ach-toast">
            <span className="ach-toast-icon" aria-hidden="true">
              {t.icon}
            </span>
            Достижение: {t.title}
          </div>
        );
      })}
    </div>
  );
}
