import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const AUD = ['все', 'мобилка', 'блокчейн'];
const LVL = ['база', 'углубление', 'челлендж'];

// Mirrors Docusaurus's DefaultNumberPrefixParser: it strips a leading "NN-"/"NN_"/"NN."
// from each path segment when computing doc ids/slugs (e.g. "01-kotlin-vars" -> "kotlin-vars"),
// so links built from this map must strip it the same way or they 404.
function stripNumberPrefix(segment) {
  if (/^\d+[-_.]\d+/.test(segment)) return segment; // date/version-like, e.g. "2024-01-foo"
  const m = /^\d+\s*[-_.]+\s*([^-_.\s].*)$/.exec(segment);
  return m ? m[1] : segment;
}

export function buildMap(docsDir) {
  const out = [];
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!/\.mdx?$/.test(e.name) || /^index\.mdx?$/.test(e.name)) return;
    const { data } = matter(fs.readFileSync(p, 'utf8'));
    for (const f of ['audience', 'level', 'order', 'title'])
      if (data[f] === undefined) throw new Error(`missing frontmatter: ${p}: ${f}`);
    if (!AUD.includes(data.audience) || !LVL.includes(data.level))
      throw new Error(`missing frontmatter: ${p}: bad value`);
    const base = e.name.replace(/\.mdx?$/, '');
    const ext = e.name.slice(base.length);
    const id = stripNumberPrefix(base);
    // extension is stripped before stripNumberPrefix (same order as the id above / Docusaurus), then reattached to the file segment only
    const relDir = path.relative(docsDir, d).split(path.sep).filter(Boolean).map(stripNumberPrefix);
    const relPath = [...relDir, id + ext].join('/');
    out.push({
      id,
      title: data.title,
      audience: data.audience,
      level: data.level,
      order: data.order,
      path: relPath
    });
  });
  walk(docsDir);
  return out.sort((a, b) => AUD.indexOf(a.audience) - AUD.indexOf(b.audience) || a.order - b.order);
}

if (process.argv[1].endsWith('knowledge-map.mjs')) {
  fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/knowledge-map.json', JSON.stringify(buildMap('docs'), null, 2));
  console.log('knowledge-map.json written');
}
