import knowledgeMap from '../data/knowledge-map.json';

// Человеческие подписи вместо технических id — общее место для страниц,
// которые показывают студенту то, что лежит в store и в каталоге сообщества.
// Карта глав строится из того же knowledge-map.json, что у каталога зала и
// «Вызова дня». Отдельной строкой — 'gym': под этим id store хранит
// результаты запусков из тренажёрного зала (GymCatalog), главы с таким id в
// карте знаний нет, и без подписи в таблице рекордов светилось бы «gym».

type MapEntry = { id: string; title: string; path: string };

export const GYM_CHAPTER_ID = 'gym';

const CHAPTERS = new Map<string, { title: string; to: string }>(
  (knowledgeMap as MapEntry[]).map((e) => [
    e.id,
    { title: e.title, to: `/docs/${e.path.replace(/\.mdx?$/, '')}` },
  ]),
);
CHAPTERS.set(GYM_CHAPTER_ID, { title: 'Тренажёрный зал', to: '/gym' });

/** Название главы по id. Незнакомый id возвращаем как есть — выдумывать нечего. */
export function chapterTitle(id: string): string {
  return CHAPTERS.get(id)?.title ?? id;
}

/** Адрес страницы главы, или null, если такой главы в карте знаний нет. */
export function chapterHref(id: string): string | null {
  return CHAPTERS.get(id)?.to ?? null;
}

/**
 * Подпись квиза или тренажёра. В store лежат технические id — «q3», «exam»,
 * «quiz-home-row», «trainer-git-commands», «gym-typing»; первокурснику они
 * ничего не говорят, поэтому служебный префикс убираем, дефисы разжимаем в
 * пробелы, а нумерованные проверки главы называем по-русски.
 */
export function taskLabel(id: string): string {
  if (id === 'exam') return 'Экзамен главы';
  const numbered = /^q(\d+)$/.exec(id);
  if (numbered) return `Проверка ${numbered[1]}`;
  const words = id.replace(/^(?:quiz|trainer|gym)-/, '').replace(/-/g, ' ');
  return words ? words[0].toUpperCase() + words.slice(1) : id;
}
