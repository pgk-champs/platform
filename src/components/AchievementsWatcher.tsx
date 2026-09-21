import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { evaluate, RARITY_XP, type Achievement } from '../lib/achievements';
import { levelForXp } from '../lib/levels';
import './trainers.css';

type AchToast = { kind: 'achievement'; key: string; icon: string; title: string; xp: number };
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

  // Гвард от вложенного вызова: разблокировка достижения платит XP, а это
  // снова бьёт событием 'change' — без гварда одно действие давало каскад
  // тостов, где «+10 XP» приезжал ОТДЕЛЬНО от достижения, за которое он выдан.
  const busyRef = useRef(false);

  useEffect(() => {
    prevXpRef.current = store.getXp();
    const onChange = () => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        onChangeInner();
      } finally {
        busyRef.current = false;
      }
    };
    const onChangeInner = () => {
      const prevXp = prevXpRef.current;
      const fresh: Toast[] = [];
      // evaluate() СНАЧАЛА: он же и начисляет награду, поэтому XP надо читать
      // после него, иначе награда за достижение приедет следующим тостом.
      const newly = evaluate();
      const наградаЗаДостижения = newly.reduce((n, a) => n + RARITY_XP[a.rarity], 0);
      const xp = store.getXp();
      // Отдельный тост «+N XP» — только за то, что заработано делом; награда
      // за достижение печатается на самой плашке достижения.
      const заДело = xp - prevXp - наградаЗаДостижения;
      if (заДело > 0) {
        fresh.push({ kind: 'xp', key: `xp-${Date.now()}-${Math.random()}`, amount: заДело });
      }
      if (xp > prevXp) {
        const prevLevel = levelForXp(prevXp).level;
        const info = levelForXp(xp);
        if (info.level > prevLevel) {
          fresh.push({ kind: 'level', key: `lvl-${Date.now()}-${Math.random()}`, level: info.level, title: info.title });
        }
      }
      prevXpRef.current = xp;
      fresh.push(
        ...newly.map((a: Achievement) => ({
          kind: 'achievement' as const,
          key: `${a.id}-${Date.now()}`,
          icon: a.icon,
          title: a.title,
          xp: RARITY_XP[a.rarity],
        })),
      );
      if (fresh.length) setToasts((prev) => [...prev, ...fresh]);
    };
    onChange(); // достижения, набранные ещё до монтирования (загрузка сохранённого прогресса)
    return store.subscribe(onChange);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    // Достижение висит дольше прочего: это единственная обратная связь по нему,
    // и пропустив тост, догнать его было негде — ссылки на страницу достижений
    // на платформе не было вовсе.
    const ms = toasts[0].kind === 'achievement' ? 7000 : 4000;
    const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), ms);
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
          <Link key={t.key} className="ach-toast ach-toast-link" to="/achievements">
            <span className="ach-toast-icon" aria-hidden="true">
              {t.icon}
            </span>
            Достижение: {t.title}
            <span className="ach-toast-xp">+{t.xp} XP</span>
          </Link>
        );
      })}
    </div>
  );
}
