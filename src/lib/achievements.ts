// Реестр достижений платформы. evaluate() вызывается после изменений в
// store (см. AchievementsWatcher) и разблокирует всё, что уже выполнено.

import { store, type QuizLogEntry } from './store';

type Snapshot = ReturnType<typeof store.snapshot>;

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  check: (snap: Snapshot) => boolean;
};

function isPerfect(q: QuizLogEntry): boolean {
  return q.total > 0 && q.correct === q.total;
}

function trailingPerfectQuizStreak(snap: Snapshot): number {
  let streak = 0;
  for (let i = snap.quizLog.length - 1; i >= 0; i -= 1) {
    if (!isPerfect(snap.quizLog[i])) break;
    streak += 1;
  }
  return streak;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'первая-прочитанная-глава',
    title: 'Первая прочитанная глава',
    desc: 'Прочитана хотя бы одна секция главы',
    icon: '📖',
    check: (s) => Object.keys(s.sections).length >= 1,
  },
  {
    id: 'первый-квиз',
    title: 'Первый квиз',
    desc: 'Пройден первый квиз',
    icon: '📝',
    check: (s) => s.quizLog.length >= 1,
  },
  {
    id: 'квиз-на-100',
    title: 'Квиз на 100%',
    desc: 'Квиз пройден без единой ошибки',
    icon: '💯',
    check: (s) => s.quizLog.some(isPerfect),
  },
  {
    id: 'первый-тренажёр',
    title: 'Первый тренажёр',
    desc: 'Завершён первый тренажёр',
    icon: '🏋️',
    check: (s) => Object.values(s.trainers).some((byId) => Object.keys(byId).length > 0),
  },
  {
    id: '5-в-избранном',
    title: '5 в избранном',
    desc: 'В избранном 5 материалов',
    icon: '⭐',
    check: (s) => s.favorites.length >= 5,
  },
  {
    id: '3-главы',
    title: '3 главы',
    desc: 'Начаты 3 главы',
    icon: '🗺️',
    check: (s) => Object.keys(s.sections).length >= 3,
  },
  {
    id: '100-xp',
    title: '100 XP',
    desc: 'Набрано 100 очков опыта',
    icon: '⚡',
    check: (s) => s.xp >= 100,
  },
  {
    id: 'серия-3-квизов',
    title: 'Серия из 3 квизов',
    desc: '3 квиза подряд без единой ошибки',
    icon: '🔥',
    check: (s) => trailingPerfectQuizStreak(s) >= 3,
  },
];

// Гвард от реентрантности: achievements.unlock() пишет в store, что бьёт
// событием 'change', на которое подписан этот же evaluate() (см.
// AchievementsWatcher) — без гварда один вызов мог бы рекурсивно
// перезапускать сам себя посреди цикла по ACHIEVEMENTS.
let evaluating = false;

export function evaluate(): Achievement[] {
  if (evaluating) return [];
  evaluating = true;
  try {
    const snap = store.snapshot();
    const unlocked: Achievement[] = [];
    for (const a of ACHIEVEMENTS) {
      if (store.achievements.isUnlocked(a.id)) continue;
      if (a.check(snap)) {
        store.achievements.unlock(a.id);
        unlocked.push(a);
      }
    }
    return unlocked;
  } finally {
    evaluating = false;
  }
}
