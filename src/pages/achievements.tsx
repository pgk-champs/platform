import React, { useState, useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { LOOKS } from '../lib/looks';
import { quizRecords, trainerRecords, blockExamRecords, ПОКАЗ } from '../lib/records';
import { levelForXp } from '../lib/levels';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  sortAchievements,
  stepGoal,
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

// Какое достижение какой облик открывает — из реестра обликов, чтобы
// подпись не разошлась с тем, что реально откроется.
const LOOK_BY_ACHIEVEMENT: Record<string, string> = Object.fromEntries(
  LOOKS.filter((l) => l.achievement).map((l) => [l.achievement!, l.name]),
);

function Step({ now, goal }: { now: number; goal: number }) {
  const pct = Math.min(100, Math.round((100 * now) / goal));
  return (
    <div className="ach-step">
      <span className="ach-step-bar" aria-hidden="true">
        <span className="ach-step-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="ach-step-num">
        {Math.min(now, goal)} из {goal}
      </span>
    </div>
  );
}

export default function Achievements() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const [filter, setFilter] = useState<AchievementCategory | 'все'>('все');
  const xp = store.getXp();
  const unlocked = new Set(store.achievements.list());
  const snap = store.snapshot();
  const quizRows = [...blockExamRecords(snap.exams), ...quizRecords(snap.quizLog)];
  const trainerRows = trainerRecords(snap.trainers);
  const [всеКвизы, показатьКвизы] = useState(false);
  const [всеТренажёры, показатьТренажёры] = useState(false);

  const byCategory = (cat: AchievementCategory | 'все') =>
    cat === 'все' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.category === cat);
  const shown = sortAchievements(byCategory(filter));
  const countLabel = (cat: AchievementCategory | 'все') => {
    const list = byCategory(cat);
    return `${list.filter((a) => unlocked.has(a.id)).length}/${list.length}`;
  };

  return (
    <Layout title="Достижения" description="Достижения и опыт на платформе PGK Champs">
      <main className="container margin-vert--lg">
        <h1>Достижения</h1>
        {/* Главное число страницы — сколько собрано из сорока трёх. Оно жило
            только в чипе фильтра кеглем 11px, то есть ради него сюда и
            приходят, а увидеть его было негде. */}
        <div className="ach-score">
          <b>{unlocked.size}</b> из {ACHIEVEMENTS.length}
          <span className="ach-score-bar" aria-hidden="true">
            <span
              className="ach-score-fill"
              style={{ width: `${Math.round((100 * unlocked.size) / ACHIEVEMENTS.length)}%` }}
            />
          </span>
        </div>
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
                  {isUnlocked ? a.icon : a.hidden ? '❔' : '🔒'}
                </div>
                {/* Скрытое до находки не называет себя: иначе «найди сам» —
                    это просто список дел с лишним шагом. В счётчике «столько
                    из стольких» оно участвует наравне, чтобы витрина не врала
                    о размере коллекции. */}
                <div className="ach-title">{isUnlocked || !a.hidden ? a.title : '???'}</div>
                <div className="ach-desc">
                  {isUnlocked || !a.hidden ? a.desc : 'Найдётся само — если делать по-своему'}
                </div>
                {/* Путь к ступени: «18 из 25» двигает, голое условие — нет.
                    Показываем только закрытым и только там, где есть счёт. */}
                {!isUnlocked && !a.hidden && a.progress && stepGoal(a.id) ? (
                  <Step now={a.progress(snap)} goal={stepGoal(a.id)!} />
                ) : null}
                {/* Награда видна ДО получения: иначе к ней не стремятся, а
                    узнают о ней случайно, уже получив. */}
                {LOOK_BY_ACHIEVEMENT[a.id] ? (
                  <Link className="ach-gives" to="/account">
                    {isUnlocked ? 'открыт облик' : 'откроет облик'} «{LOOK_BY_ACHIEVEMENT[a.id]}»
                  </Link>
                ) : null}
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
              {(всеКвизы ? quizRows : quizRows.slice(0, ПОКАЗ)).map((r) => (
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
        {quizRows.length > ПОКАЗ && !всеКвизы && (
          <button type="button" className="button button--sm button--secondary" onClick={() => показатьКвизы(true)}>
            Показать все {quizRows.length}
          </button>
        )}

        <h3>Тренажёры</h3>
        {trainerRows.length > 0 ? (
          <table className="rl-matrix">
            <thead>
              <tr>
                <th>Глава</th>
                <th>Тренажёр</th>
                <th>Скорость</th>
              </tr>
            </thead>
            <tbody>
              {(всеТренажёры ? trainerRows : trainerRows.slice(0, ПОКАЗ)).map((r) => (
                <tr key={`${r.chapterId}:${r.trainerId}`}>
                  <td>{chapterTitle(r.chapterId)}</td>
                  <td>{taskLabel(r.trainerId)}</td>
                  <td>{r.cpm === null ? '—' : `${r.cpm} зн/мин`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="fav-empty">Пока нет пройденных тренажёров.</p>
        )}
        {trainerRows.length > ПОКАЗ && !всеТренажёры && (
          <button
            type="button"
            className="button button--sm button--secondary"
            onClick={() => показатьТренажёры(true)}
          >
            Показать все {trainerRows.length}
          </button>
        )}
      </main>
    </Layout>
  );
}
