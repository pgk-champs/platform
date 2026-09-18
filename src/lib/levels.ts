// Кривая уровней поверх XP: как в Codecademy — не сырое число, а звание и
// полоса прогресса. XP(level) = BASE × level^EXPONENT (кумулятивный порог).
//
// ПЕРЕСЧИТАНО 18.09.2026. Прежняя кривая (показатель 1.75, десять званий)
// давала максимум на 844 XP, а контента на платформе примерно на 18 000:
// «Чемпион» закрывался за шесть глав из 137, и дальше 95 % программы не
// двигали ничего. Калибровали её при двадцати двух главах — с тех пор глав
// стало 137, а числа остались.
//
// Теперь показатель 2.6 и пятнадцать званий: максимум 17 137 XP — это 95 %
// всего, что платформа может выдать, то есть звание «Чемпион» действительно
// означает пройденную программу. Быстрый старт сохранён намеренно: второй
// уровень берётся за 91 XP, меньше одной средней главы (153 XP).
//
// Цена решения принята сознательно: у всех, кто учился на старой кривой,
// уровень стал ниже. Прогресс при этом не потерян — пересчитана только шкала.
const BASE = 15;
const EXPONENT = 2.6;

// 15 званий — «ярусы», как у Codecademy, но по теме площадки. Последние три
// взяты из чемпионата «Профессионалы», к которому платформа и готовит:
// финалист, призёр, чемпион.
export const LEVEL_TITLES = [
  'Новичок',
  'Стажёр',
  'Практикант',
  'Кодер',
  'Младший разработчик',
  'Разработчик',
  'Уверенный разработчик',
  'Инженер',
  'Профи',
  'Эксперт',
  'Архитектор',
  'Мастер',
  'Финалист',
  'Призёр',
  'Чемпион',
] as const;

export const MAX_LEVEL = LEVEL_TITLES.length;

/** Кумулятивный порог XP, нужный для старта уровня level (1 — старт без XP). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(BASE * level ** EXPONENT);
}

export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  /** Сколько XP набрано внутри текущего уровня. */
  xpIntoLevel: number;
  /** Сколько XP не хватает до следующего уровня (0 на максимальном уровне). */
  xpToNext: number;
  /** Доля прогресса внутри уровня, 0..1 (1 на максимальном уровне). */
  progress: number;
  maxLevel: boolean;
};

/** Уровень, звание и прогресс до следующего уровня по общему количеству XP. */
export function levelForXp(xp: number): LevelInfo {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level += 1;
  const maxLevel = level >= MAX_LEVEL;
  const base = xpForLevel(level);
  if (maxLevel) {
    return { level, title: LEVEL_TITLES[level - 1], xp, xpIntoLevel: xp - base, xpToNext: 0, progress: 1, maxLevel };
  }
  const next = xpForLevel(level + 1);
  const bracket = next - base;
  const into = xp - base;
  return {
    level,
    title: LEVEL_TITLES[level - 1],
    xp,
    xpIntoLevel: into,
    xpToNext: next - xp,
    progress: bracket > 0 ? into / bracket : 1,
    maxLevel,
  };
}
