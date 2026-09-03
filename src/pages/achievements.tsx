import React, { useState, useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import { store, type TrainerResult } from '../lib/store';
import { levelForXp } from '../lib/levels';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  type AchievementCategory,
  type AchievementRarity,
} from '../lib/achievements';
import { chapterTitle, taskLabel } from '../components/chapterLabels';
import '../components/trainers.css';

// Классы редкости — латиницей, чтобы не тащить кириллицу в CSS-селекторы.
const RARITY_CLASS: Record<AchievementRarity, string> = {
  обычное: 'ach-card-common',
  редкое: 'ach-card-rare',
  эпическое: 'ach-card-epic',
};

type QuizRecord = { chapterId: string; quizId: string; best: number; total: number; attempts: number };

function quizRecords(quizLog: ReturnType<typeof store.snapshot>['quizLog']): QuizRecord[] {
  const byKey = new Map<string, QuizRecord>();
  for (const e of quizLog) {
    const key = `${e.chapterId}:${e.quizId}`;
    const row = byKey.get(key);
    if (!row) {
      byKey.set(key, { chapterId: e.chapterId, quizId: e.quizId, best: e.correct, total: e.total, attempts: 1 });
    } else {
      row.attempts += 1;
      if (e.correct > row.best) {
        row.best = e.correct;
        row.total = e.total;
      }
    }
  }
  return [...byKey.values()];
}

type TrainerRecord = { chapterId: string; trainerId: string; cpm: number };

function trainerRecords(trainers: Record<string, Record<string, TrainerResult>>): TrainerRecord[] {
  const rows: TrainerRecord[] = [];
  for (const [chapterId, byId] of Object.entries(trainers)) {
    for (const [trainerId, entry] of Object.entries(byId)) {
      const cpm = (entry.result as { cpm?: unknown } | undefined)?.cpm;
      if (typeof cpm === 'number') rows.push({ chapterId, trainerId, cpm });
    }
  }
  return rows;
}

export default function Achievements() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const [filter, setFilter] = useState<AchievementCategory | 'все'>('все');
  const xp = store.getXp();
  const unlocked = new Set(store.achievements.list());
  const snap = store.snapshot();
  const quizRows = quizRecords(snap.quizLog);
  const trainerRows = trainerRecords(snap.trainers);

  const byCategory = (cat: AchievementCategory | 'все') =>
    cat === 'все' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.category === cat);
  const shown = byCategory(filter);
  const countLabel = (cat: AchievementCategory | 'все') => {
    const list = byCategory(cat);
    return `${list.filter((a) => unlocked.has(a.id)).length}/${list.length}`;
  };

  return (
    <Layout title="Достижения" description="Достижения и опыт на платформе PGK Champs">
      <main className="container margin-vert--lg">
        <h1>Достижения</h1>
        <div className="ach-xp">XP: {xp}</div>
        {(() => {
          const lvl = levelForXp(xp);
          return (
            <div className="ach-level">
              <span className="ach-level-badge">
                Уровень {lvl.level} · {lvl.title}
              </span>
              <span
                className="ach-level-bar"
                role="progressbar"
                aria-valuenow={Math.round(lvl.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="ach-level-fill" style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
              </span>
              <span className="ach-level-next">
                {lvl.maxLevel ? 'Максимальный уровень' : `до уровня ${lvl.level + 1}: ${lvl.xpToNext} XP`}
              </span>
            </div>
          );
        })()}
        <div className="ach-filters" role="group" aria-label="Фильтр по категориям">
          {(['все', ...ACHIEVEMENT_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`ach-filter ${filter === cat ? 'ach-filter-on' : ''}`.trim()}
              aria-pressed={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {cat} <span className="ach-filter-count">{countLabel(cat)}</span>
            </button>
          ))}
        </div>
        <div className="ach-grid">
          {shown.map((a) => {
            const isUnlocked = unlocked.has(a.id);
            return (
              <div
                key={a.id}
                className={`ach-card ${RARITY_CLASS[a.rarity]} ${isUnlocked ? 'ach-card-on' : 'ach-card-off'}`.trim()}
              >
                <div className="ach-icon" aria-hidden="true">
                  {isUnlocked ? a.icon : '🔒'}
                </div>
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
                <div className={`ach-rarity ach-rarity-${a.rarity === 'эпическое' ? 'epic' : a.rarity === 'редкое' ? 'rare' : 'common'}`}>
                  {a.rarity}
                </div>
              </div>
            );
          })}
        </div>

        <h2>Рекорды</h2>
        <p className="ach-records-note">
          Соревновательный рейтинг появится вместе с симулятором — общий лидерборд между учениками честно требует
          сервера (этап 3). Пока здесь только твои личные локальные рекорды.
        </p>

        <h3>Квизы</h3>
        {quizRows.length > 0 ? (
          <table className="rl-matrix">
            <thead>
              <tr>
                <th>Глава</th>
                <th>Квиз</th>
                <th>Лучший счёт</th>
                <th>Попыток</th>
              </tr>
            </thead>
            <tbody>
              {quizRows.map((r) => (
                <tr key={`${r.chapterId}:${r.quizId}`}>
                  <td>{chapterTitle(r.chapterId)}</td>
                  <td>{taskLabel(r.quizId)}</td>
                  <td>
                    {r.best} из {r.total}
                  </td>
                  <td>{r.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="fav-empty">Пока нет пройденных квизов.</p>
        )}

        <h3>Тренажёры</h3>
        {trainerRows.length > 0 ? (
          <table className="rl-matrix">
            <thead>
              <tr>
                <th>Глава</th>
                <th>Тренажёр</th>
                <th>Лучшая скорость</th>
              </tr>
            </thead>
            <tbody>
              {trainerRows.map((r) => (
                <tr key={`${r.chapterId}:${r.trainerId}`}>
                  <td>{chapterTitle(r.chapterId)}</td>
                  <td>{taskLabel(r.trainerId)}</td>
                  <td>{r.cpm} зн/мин</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="fav-empty">Пока нет тренажёров с записанной скоростью.</p>
        )}
      </main>
    </Layout>
  );
}
