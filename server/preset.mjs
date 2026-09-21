// Правила пользовательского набора упражнений — ОДИН источник на оба берега.
//
// Раньше они жили только в src/components/GymBuilder.tsx, а сервер принимал
// набор проверкой «объект и не массив» (POST /community, type='preset'). То
// есть в базу и в каталог могло лечь что угодно: пустые карточки, мегабайт
// текста, лишние ключи. Клиент при этом такую запись рисовать отказывался —
// и материал молча пропадал уже после одобрения модератором.
//
// Файл .mjs без типов НАМЕРЕННО: его импортирует и сервер (node), и сайт
// (webpack), и тесты. Дублировать правила в .ts означало бы ровно ту ошибку,
// которую этот файл и чинит.

/**
 * Версия формата. Нужна, чтобы ужесточение правил не превращало все уже
 * разосланные ссылки в «набор повреждён»: у старых ссылок версии нет, и это
 * законно — их читают по правилам версии 1.
 */
export const PRESET_VERSION = 1;

// Границы. Набор целиком уезжает в снимок store и в PUT /progress (там лимит
// тела 1 МБ), поэтому потолок нужен и без злого умысла: сорок карточек по
// сотне символов — это уже 8 КБ в ссылке.
export const LIMITS = {
  name: 80,
  cards: 100,
  cardText: 200,
  phrase: 300,
  snippets: 60,
  snippetText: 300,
  code: 4000,
  expected: 2000,
};

const str = (v, max) => (typeof v === 'string' && v.trim() !== '' && v.length <= max ? v : null);

/**
 * Приводит присланное к набору или возвращает null. Возвращает НОВЫЙ объект
 * только из известных полей: лишние ключи не доезжают ни до базы, ни до
 * движка.
 */
export function normalizePreset(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const name = str(obj.name, LIMITS.name);
  if (!name) return null;
  const v = obj.v === undefined ? 1 : obj.v;
  if (v !== 1) return null;

  switch (obj.engine) {
    case 'flashcards': {
      if (!Array.isArray(obj.cards) || obj.cards.length === 0 || obj.cards.length > LIMITS.cards) return null;
      const cards = [];
      for (const c of obj.cards) {
        if (!c || typeof c !== 'object') return null;
        const term = str(c.term, LIMITS.cardText);
        const translation = str(c.translation, LIMITS.cardText);
        if (!term || !translation) return null;
        const note = typeof c.note === 'string' && c.note.length <= LIMITS.cardText ? c.note : undefined;
        cards.push(note === undefined ? { term, translation } : { term, translation, note });
      }
      return { name, engine: 'flashcards', cards };
    }
    case 'wordorder': {
      const phrase = str(obj.phrase, LIMITS.phrase);
      if (!phrase || phrase.trim().split(/\s+/).length < 2) return null;
      return { name, engine: 'wordorder', phrase };
    }
    case 'codetyping': {
      if (!Array.isArray(obj.snippets) || obj.snippets.length === 0 || obj.snippets.length > LIMITS.snippets)
        return null;
      const snippets = [];
      for (const s of obj.snippets) {
        const one = str(s, LIMITS.snippetText);
        if (!one) return null;
        snippets.push(one);
      }
      return { name, engine: 'codetyping', snippets };
    }
    case 'predict': {
      const code = str(obj.code, LIMITS.code);
      const expected = str(obj.expected, LIMITS.expected);
      if (!code || !expected) return null;
      return { name, engine: 'predict', code, expected };
    }
    default:
      return null;
  }
}

/** Короткая подпись набора для очереди модерации и карточки каталога. */
export function presetSummary(p) {
  switch (p.engine) {
    case 'flashcards':
      return `карточки: ${p.cards.length}`;
    case 'wordorder':
      return `фраза из ${p.phrase.trim().split(/\s+/).length} слов`;
    case 'codetyping':
      return `печать: ${p.snippets.length} фрагментов`;
    case 'predict':
      return 'предскажи вывод';
    default:
      return 'набор';
  }
}
