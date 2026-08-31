import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const AUD = ['все', 'мобилка', 'блокчейн'];
const LVL = ['база', 'углубление', 'челлендж'];

export function buildMap(docsDir) {
  const out = [];
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!/\.mdx?$/.test(e.name) || e.name === 'index.md') return;
    const { data } = matter(fs.readFileSync(p, 'utf8'));
    for (const f of ['audience', 'level', 'order', 'title'])
      if (data[f] === undefined) throw new Error(`missing frontmatter: ${p}: ${f}`);
    if (!AUD.includes(data.audience) || !LVL.includes(data.level))
      throw new Error(`missing frontmatter: ${p}: bad value`);
    out.push({
      id: path.basename(e.name).replace(/\.mdx?$/, ''),
      title: data.title,
      audience: data.audience,
      level: data.level,
      order: data.order,
      path: p.split('/docs/')[1] ?? p
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
