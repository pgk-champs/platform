import { ACHIEVEMENTS, type Achievement } from './achievements';

// Печать — носимое достижение. Одно из открытых висит рядом с плашкой в
// шапке: «вот чем я занимался», видно на каждой странице.
//
// Зачем отдельный файл, а не looks.ts: печати нужен реестр достижений, а
// реестр импортирует store — и если бы store тянул этот модуль, кольцо
// замкнулось бы (store → seal → achievements → store). store знает только о
// строке в prefs, смысл ей придаёт этот файл.
//
// Как и у обликов, факт «можно носить» НЕ хранится: он выводится из выданных
// достижений на каждом показе. Сбросили прогресс — печать исчезла сама.

export function sealOptions(unlocked: readonly string[]): Achievement[] {
  const has = new Set(unlocked);
  return ACHIEVEMENTS.filter((a) => has.has(a.id));
}

/** Достижение, которое реально носится, или null. */
export function effectiveSeal(chosen: string | undefined, unlocked: readonly string[]): Achievement | null {
  if (!chosen) return null;
  if (!unlocked.includes(chosen)) return null;
  return ACHIEVEMENTS.find((a) => a.id === chosen) ?? null;
}
