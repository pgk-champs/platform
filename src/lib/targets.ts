import knowledgeMap from '../data/knowledge-map.json';
import pages from '../data/pages.json';

// Куда можно привязать материал сообщества. «Общее» — пустое значение: в базе
// это chapter_id NULL, и отдельного поля под «вид адреса» не нужно, потому что
// третьего состояния не бывает.
//
// Живёт в lib, а не в компоненте: vitest не разрешает @docusaurus/*, и список,
// лежащий рядом с формой, было бы нечем проверить.

type Doc = { id: string; title: string };

export const TARGET_GROUPS: { label: string; options: { value: string; label: string }[] }[] = [
  { label: 'Общее', options: [{ value: '', label: 'Не привязан к теме' }] },
  { label: 'Главы', options: (knowledgeMap as Doc[]).map((e) => ({ value: e.id, label: e.title })) },
  { label: 'Страницы', options: (pages as Doc[]).map((e) => ({ value: e.id, label: e.title })) },
];
