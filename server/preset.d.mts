// Типы к server/preset.mjs — сам модуль без типов НАМЕРЕННО: его читают и
// сервер (node), и сайт (webpack), и тесты, а дублировать правила в .ts
// означало бы ровно ту ошибку, которую общий модуль и чинит.

export const PRESET_VERSION: number;

export const LIMITS: {
  name: number;
  cards: number;
  cardText: number;
  phrase: number;
  snippets: number;
  snippetText: number;
  code: number;
  expected: number;
};

export type NormalizedPreset =
  | { name: string; engine: 'flashcards'; cards: { term: string; translation: string; note?: string }[] }
  | { name: string; engine: 'wordorder'; phrase: string }
  | { name: string; engine: 'codetyping'; snippets: string[] }
  | { name: string; engine: 'predict'; code: string; expected: string };

export function normalizePreset(obj: unknown): NormalizedPreset | null;
export function presetSummary(p: NormalizedPreset): string;
