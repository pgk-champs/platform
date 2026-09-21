import type { FavoriteItem } from './store';
import { chapterTitle } from '../components/chapterLabels';

// Отбор в избранном. В lib, а не на странице: vitest не резолвит
// @theme/Layout, и всё, что осталось бы в pages/, тестами не покрывается.

// Подписи типов — для чипов. Тип у записи технический (kind блока), а
// студент помнит не «cheatsheet», а «шпаргалка».
export const TYPE_LABELS: Record<string, string> = {
  trainer: 'тренажёры',
  quiz: 'проверки',
  breakdown: 'разборы',
  vocab: 'словари',
  cheatsheet: 'шпаргалки',
  fact: 'факты',
  link: 'ссылки',
  word: 'слова',
  preset: 'наборы',
};

/** Что видно после поиска и чипа. Поиск смотрит название и главу. */
export function filterFavorites(items: FavoriteItem[], q: string, type: string): FavoriteItem[] {
  const нужно = q.trim().toLowerCase();
  return items.filter((i) => {
    if (type !== 'all' && i.type !== type) return false;
    if (!нужно) return true;
    return `${i.title} ${chapterTitle(i.chapterId)}`.toLowerCase().includes(нужно);
  });
}

