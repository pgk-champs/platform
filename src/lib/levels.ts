// Кривая уровней поверх XP: как в Codecademy — не сырое число, а звание и
// полоса прогресса. XP(level) = BASE × level^EXPONENT (кумулятивный порог),
// экспонента в диапазоне 1.5–2 держит ранние уровни быстрыми, поздние —
// долгими. Ориентир по масштабу: урок Duolingo ≈ 10 XP, здесь блоки платформы
// дают 5–40 XP за раз — при таком темпе первый десяток уровней укладывается
// в несколько глав, не в один вечер.
const BASE = 15;
const EXPONENT = 1.75;

// 10 званий — «ярусы», как у Codecademy, но по теме площадки (чемпионат
// «Профессионалы»): от новичка до чемпиона.
export const LEVEL_TITLES = [
  'Новичок',
  'Стажёр',
  'Практикант',
  'Кодер',
  'Разработчик',
  'Уверенный разработчик',
  'Профи',
  'Эксперт',
  'Мастер',
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
