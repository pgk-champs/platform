/** Логика заготовки страницы: адрес, номер, шаблон и проверка перед сохранением.
 *  Держится отдельно от страницы кабинета, чтобы проверяться тестами без
 *  Docusaurus-окружения — и чтобы теми же правилами мог пользоваться скрипт. */

/** Заголовок → адрес страницы: «Корзина и заказ» → «korzina-i-zakaz». */
const RU: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
};
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .split('')
    .map((c) => (RU[c] !== undefined ? RU[c] : c))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** Следующий свободный номер в треке — чтобы автор его не выдумывал. */
export function nextNumber(files: string[], track: string): string {
  const nums = files
    .filter((f) => f.startsWith(`docs/${track}/`))
    .map((f) => /\/(\d+)[-_.]/.exec(f)?.[1])
    .filter(Boolean)
    .map((n) => Number(n));
  const next = nums.length ? Math.max(...nums) + 1 : 0;
  return String(next).padStart(2, '0');
}

/** Заготовка новой страницы: всё обязательное уже на месте. */
export function template(o: {
  kind: 'chapter' | 'page';
  title: string;
  slug: string;
  track: string;
  num: string;
  audience: string;
}): string {
  const head = [
    '---',
    `title: '${o.title.replace(/'/g, "\\'")}'`,
    `audience: '${o.audience}'`,
    "level: 'база'",
    `order: ${Number(o.num)}`,
    `sidebar_position: ${Number(o.num)}`,
    ...(o.kind === 'page' ? ["kind: 'page'"] : []),
    '---',
    '',
  ].join('\n') + '\n';

  if (o.kind === 'page') {
    return `${head}import Hint from '@site/src/components/Hint';

# ${o.title}

Первый абзац: о чём страница и кому она нужна.

<Hint type="tip">
Короткая подсказка — то, что легко забыть.
</Hint>
`;
  }

  return `${head}import ChapterCover from '@site/src/components/ChapterCover';

<ChapterCover chapterId="${o.slug}" />

import SelfCheck from '@site/src/components/SelfCheck';
import ChapterExam from '@site/src/components/ChapterExam';
import Block from '@site/src/components/Block';
import Hint from '@site/src/components/Hint';
import CollapsibleToc from '@site/src/components/CollapsibleToc';
import ChapterProgress from '@site/src/components/ChapterProgress';
import SectionAnchor from '@site/src/components/SectionAnchor';
import Figure from '@site/src/components/Figure';

# ${o.title}

<ChapterProgress chapterId="${o.slug}" />

<CollapsibleToc toc={toc} chapterId="${o.slug}" />

## Зачем это нужно

Зачем студенту эта глава и что он сможет после неё.

<SectionAnchor chapterId="${o.slug}" sectionId="zachem" />

## Первая тема

Текст.

<Hint type="important">
То, что легко сделать неправильно.
</Hint>

<Block kind="quiz">
<SelfCheck chapterId="${o.slug}" questions={[
  { q: 'Вопрос?', options: ['Неверно', 'Верно', 'Неверно', 'Неверно'], correct: 1, why: 'Почему именно так.' },
]} />
</Block>

<SectionAnchor chapterId="${o.slug}" sectionId="pervaya-tema" />

<ChapterExam chapterId="${o.slug}" questions={[
  { q: 'Вопрос экзамена?', options: ['Неверно', 'Верно', 'Неверно', 'Неверно'], correct: 1, why: 'Почему.' },
]} />
`;
}

/** Быстрая проверка перед сохранением — то же, что потом спросят гейты. */
export function checkPage(text: string, kind: 'chapter' | 'page'): string[] {
  const problems: string[] = [];
  const has = (re: RegExp) => re.test(text);
  const count = (re: RegExp) => (text.match(re) || []).length;

  if (!/^---\n[\s\S]*?\n---/.test(text)) problems.push('Нет шапки со свойствами (--- в начале файла)');
  for (const f of ['title', 'audience', 'level', 'order'])
    if (!new RegExp(`^${f}:`, 'm').test(text)) problems.push(`В шапке не хватает «${f}»`);

  const hints = [...text.matchAll(/<Hint\b[^>]*\btype="([^"]+)"/g)].map((m) => m[1]);
  for (const t of hints)
    if (!['tip', 'important', 'fact'].includes(t))
      problems.push(`Подсказка с типом «${t}» — бывают только tip, important, fact`);

  if (kind === 'chapter') {
    if (!has(/<ChapterExam\b/)) problems.push('У главы должен быть экзамен (<ChapterExam>)');
    const figures = count(/<Figure\b/g);
    if (figures < 2 || figures > 5) problems.push(`Схем должно быть от 2 до 5, сейчас ${figures}`);
    if (!has(/<ChapterCover\b/)) problems.push('Нет обложки (<ChapterCover>)');
  }
  return problems;
}
