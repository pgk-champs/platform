import type { NormalizedPreset } from '../../server/preset.d.mts';

// Ключ набора — из его СОДЕРЖИМОГО, а не из id.
//
// Прохождение набора должно засчитываться, и XP за него платится по причине
// (reason) — а addXp платит за каждую причину ровно один раз. Возьми в
// причину id пресета (`cp-<время>-<случайное>`), и его можно фармить:
// пересохранил тот же набор, получил новый id, получил XP снова. От
// содержимого ключ не подделать иначе как собрав ДРУГОЙ набор, а это уже
// работа, сравнимая с прохождением.
//
// Побочно: один и тот же набор, пришедший из каталога и из своей полки,
// получает один ключ — значит и в прогрессе он один, а не два.

/** Каноническая форма: только значащие поля и в фиксированном порядке. */
function canon(p: NormalizedPreset): string {
  switch (p.engine) {
    case 'flashcards':
      return `flashcards|${p.cards.map((c) => `${c.term}=${c.translation}`).join(';')}`;
    case 'wordorder':
      return `wordorder|${p.phrase.trim().split(/\s+/).join(' ')}`;
    case 'codetyping':
      return `codetyping|${p.snippets.join(';')}`;
    case 'predict':
      return `predict|${p.code}=>${p.expected}`;
    default:
      return 'unknown';
  }
}

/** FNV-1a: короткая, быстрая, без зависимостей. Криптостойкость тут не нужна. */
export function presetKey(p: NormalizedPreset): string {
  const s = canon(p);
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `preset:${h.toString(36)}`;
}
