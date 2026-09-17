import { ACHIEVEMENTS } from './achievements';
import { store, localDayKey } from './store';

// Числа для постоянного индикатора в шапке. Логика отдельно от вёрстки: её
// надо проверять, а компонент тянет @docusaurus/Link.
//
// ЧЕГО ЗДЕСЬ НАМЕРЕННО НЕТ — УРОВНЯ. Максимальный уровень берётся на 844 XP,
// а контента на платформе примерно на 18 000: «Чемпион» закрывается за четыре
// главы из 137. Показывать это число постоянно значило бы хвалить студента за
// первый вечер и молчать все следующие. Вернуть уровень сюда можно будет
// после пересчёта шкалы (см. CLAUDE.md §12).

export type BadgeState = {
  /** Сколько достижений выдано. */
  unlocked: number;
  /** Сколько всего достижений. */
  total: number;
  /** Дней серии вызова дня. */
  streak: number;
};

export function badgeState(): BadgeState {
  const unlocked = store.achievements.list().length;
  return {
    unlocked,
    total: ACHIEVEMENTS.length,
    streak: store.dailyState(localDayKey()).streak,
  };
}

/** Подпись индикатора для скринридера и title. */
export function badgeLabel(s: BadgeState): string {
  const ach = `достижений ${s.unlocked} из ${s.total}`;
  return s.streak > 0 ? `Серия ${s.streak}, ${ach}` : ach;
}
