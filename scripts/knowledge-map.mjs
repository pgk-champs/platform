import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// Треки описаны в ОДНОМ месте — src/data/tracks.json. Оттуда же берутся
// допустимые значения audience и подписи разделов в сайдбаре: добавить трек
// = добавить туда запись и завести папку в docs/, больше ничего.
export const TRACKS = JSON.parse(fs.readFileSync('src/data/tracks.json', 'utf8'));
const TRACK_BY_DIR = Object.fromEntries(TRACKS.map((t) => [t.dir, t]));

const AUD = [...new Set(TRACKS.map((t) => t.audience))];
const LVL = ['база', 'углубление', 'челлендж'];

// Mirrors Docusaurus's DefaultNumberPrefixParser: it strips a leading "NN-"/"NN_"/"NN."
// from each path segment when computing doc ids/slugs (e.g. "01-kotlin-vars" -> "kotlin-vars"),
// so links built from this map must strip it the same way or they 404.
export function stripNumberPrefix(segment) {
  if (/^\d+[-_.]\d+/.test(segment)) return segment; // date/version-like, e.g. "2024-01-foo"
  const m = /^\d+\s*[-_.]+\s*([^-_.\s].*)$/.exec(segment);
  return m ? m[1] : segment;
}

/** Числовой префикс файла («33-shop-catalog» → «33»), если он есть. */
export function numberPrefix(segment) {
  if (/^\d+[-_.]\d+/.test(segment)) return '';
  const m = /^(\d+)\s*[-_.]+\s*[^-_.\s]/.exec(segment);
  return m ? m[1] : '';
}

// Главы и простые страницы собираются одним обходом, но выгружаются в РАЗНЫЕ
// файлы. Так потребителю не надо помнить про фильтр: knowledge-map.json — это
// всегда главы, pages.json — всегда страницы. Когда они лежали вместе, про
// фильтр забыли и упала сборка (15.09.2026).
export function buildMap(docsDir, kind = 'chapter') {
  const out = [];
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!/\.mdx?$/.test(e.name) || /^index\.mdx?$/.test(e.name)) return;
    const raw = fs.readFileSync(p, 'utf8');
    const { data, content } = matter(raw);
    // Знаменатели прогресса считаются здесь, а не переписываются руками в
    // каждой главе: раньше это был инвариант, который не ловил ни один тест,
    // и расхождение замечали только по кривой полосе на собранной странице.
    const count = (re) => (content.match(re) || []).length;
    const totals = {
      sections: count(/<SectionAnchor\b/g),
      quizzes: count(/<SelfCheck\b/g) + count(/<ChapterExam\b/g),
      trainers: count(/trainerId=/g),
    };
    for (const f of ['audience', 'level', 'order', 'title'])
      if (data[f] === undefined) throw new Error(`missing frontmatter: ${p}: ${f}`);
    if (!AUD.includes(data.audience) || !LVL.includes(data.level))
      throw new Error(`missing frontmatter: ${p}: bad value`);
    if ((data.kind || 'chapter') !== kind) return;
    const base = e.name.replace(/\.mdx?$/, '');
    const ext = e.name.slice(base.length);
    const id = stripNumberPrefix(base);
    // extension is stripped before stripNumberPrefix (same order as the id above / Docusaurus), then reattached to the file segment only
    const relDir = path.relative(docsDir, d).split(path.sep).filter(Boolean).map(stripNumberPrefix);
    const relPath = [...relDir, id + ext].join('/');
    const track = path.relative(docsDir, d).split(path.sep)[0] || '';
    // файл прямо в корне docs/ трека не имеет — это нормально; а вот папка,
    // которой нет в конфиге треков, почти всегда опечатка в имени каталога
    if (track && !TRACK_BY_DIR[track])
      throw new Error(`unknown track: ${p}: папки «${track}» нет в src/data/tracks.json`);
    out.push({
      id,
      title: data.title,
      audience: data.audience,
      level: data.level,
      order: data.order,
      path: relPath,
      // трек и номер выводятся из места файла — руками их нигде не дублируют
      track,
      num: data.num !== undefined ? String(data.num) : numberPrefix(base),
      // короткий заголовок для обложки, если полный слишком длинный
      cover: data.cover || data.title,
      totals,
    });
  });
  walk(docsDir);
  return out.sort((a, b) => AUD.indexOf(a.audience) - AUD.indexOf(b.audience) || a.order - b.order);
}

/** Пишет _category_.json каждому треку, чтобы подписи жили в одном месте. */
export function writeCategories(docsDir) {
  for (const t of TRACKS) {
    const dir = path.join(docsDir, t.dir);
    if (!fs.existsSync(dir)) continue;
    fs.writeFileSync(
      path.join(dir, '_category_.json'),
      JSON.stringify({ label: t.label, position: t.position, collapsed: false }, null, 2) + '\n',
    );
  }
}


// Реестр тренажёров для Зала. Собирается по блокам <Block kind="trainer">:
// проверено по всем главам — ВСЕ 228 trainerId лежат внутри такого блока.
//
// Тег компонента регэкспом НЕ разбирается, и это принципиально: в пропсах
// сплошь и рядом живёт «>» — 'Alice -> Bob', '(Int) -> Int', 'it > 50',
// 'List<Int>', "echo '.env' >> .gitignore". Любой разбор вида <Тег[^>]*> на
// них спотыкается и молча теряет тренажёр: так первый замер недосчитал 18 из
// 228. Поэтому trainerId ищется подстрокой, а всё остальное берётся из
// однострочного тега <Block> рядом — у него атрибуты простые.
//
// Подпись механики здесь не выводится (резать title по двоеточию дало бы трём
// разным механикам имя «Квест») — она лежит руками в src/data/trainer-names.ts.
export function buildTrainers(docsDir) {
  const byComponent = new Map();
  const walk = (d) =>
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) return walk(p);
      if (!/\.mdx?$/.test(e.name) || /^index\.mdx?$/.test(e.name)) return;
      const { data, content } = matter(fs.readFileSync(p, 'utf8'));
      if ((data.kind || 'chapter') !== 'chapter') return;

      const base = e.name.replace(/\.mdx?$/, '');
      const fileId = stripNumberPrefix(base);
      const rel = path.relative(docsDir, d).split(path.sep).filter(Boolean);
      const track = rel[0] || '';
      const docPath = [...rel.map(stripNumberPrefix), fileId].join('/');

      // Открывающие теги <Block …> — по строкам: многострочные <Block> в
      // репозитории есть, но только у шпаргалок, у тренажёров их нет.
      const opens = [...content.matchAll(/<Block\b[^\n]*/g)].map((m) => ({
        at: m.index,
        line: m[0],
      }));

      for (const t of content.matchAll(/trainerId="([^"]+)"/g)) {
        const open = opens.filter((o) => o.at < t.index).pop();
        if (!open || !/kind="trainer"/.test(open.line)) continue;
        // Компонент — последний настоящий JSX-тег перед trainerId внутри
        // блока. За именем требуем пробел, перенос или «/»: иначе <Int> из
        // List<Int> сойдёт за компонент.
        const between = content.slice(open.at + open.line.length, t.index);
        const tags = [...between.matchAll(/<([A-Z]\w*)(?=[\s\n/])/g)];
        if (tags.length === 0) continue;
        const component = tags[tags.length - 1][1];
        const attr = (name) => new RegExp(name + '="([^"]*)"').exec(open.line)?.[1];
        const list = byComponent.get(component) ?? [];
        list.push({
          title: attr('title') ?? '',
          chapterId: attr('chapterId') || fileId,
          track,
          path: docPath,
          blockId: attr('blockId') || t[1],
          trainerId: t[1],
        });
        byComponent.set(component, list);
      }
    });
  walk(docsDir);
  return [...byComponent]
    .map(([component, exercises]) => ({ component, exercises }))
    .sort((a, b) => b.exercises.length - a.exercises.length || a.component.localeCompare(b.component));
}

if (process.argv[1].endsWith('knowledge-map.mjs')) {
  fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/knowledge-map.json', JSON.stringify(buildMap('docs'), null, 2));
  fs.writeFileSync('src/data/pages.json', JSON.stringify(buildMap('docs', 'page'), null, 2));
  fs.writeFileSync('src/data/trainers.json', JSON.stringify(buildTrainers('docs'), null, 2));
  writeCategories('docs');
  console.log('knowledge-map.json, pages.json и trainers.json written');
}
