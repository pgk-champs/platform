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

if (process.argv[1].endsWith('knowledge-map.mjs')) {
  fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/knowledge-map.json', JSON.stringify(buildMap('docs'), null, 2));
  fs.writeFileSync('src/data/pages.json', JSON.stringify(buildMap('docs', 'page'), null, 2));
  writeCategories('docs');
  console.log('knowledge-map.json и pages.json written');
}
