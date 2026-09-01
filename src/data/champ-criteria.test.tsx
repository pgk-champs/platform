import criteria from './champ-criteria.json';

type Item = { text: string; maxScore: number; type: 'measurable' | 'judgement' };
type Section = { title: string; items: Item[] };
type Module = {
  id: string;
  title: string;
  timeLimitMinutes?: number;
  sections: Section[];
  maxTotal: number;
};

const data = criteria as { source: string; modules: Module[] };

test('has a source and a non-empty module list', () => {
  expect(typeof data.source).toBe('string');
  expect(data.source.length).toBeGreaterThan(0);
  expect(data.modules.length).toBeGreaterThan(0);
});

test('module ids are unique and non-empty', () => {
  const ids = data.modules.map((m) => m.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids) expect(id.length).toBeGreaterThan(0);
});

test('every module has a title, a positive time limit and at least one section', () => {
  for (const m of data.modules) {
    expect(m.title.length).toBeGreaterThan(0);
    expect(m.timeLimitMinutes ?? 0).toBeGreaterThan(0);
    expect(m.sections.length).toBeGreaterThan(0);
  }
});

test('every item has non-empty text, a positive score and a valid type', () => {
  for (const m of data.modules) {
    for (const s of m.sections) {
      expect(s.items.length).toBeGreaterThan(0);
      for (const item of s.items) {
        expect(item.text.length).toBeGreaterThan(0);
        expect(item.maxScore).toBeGreaterThan(0);
        expect(['measurable', 'judgement']).toContain(item.type);
      }
    }
  }
});

test('module.maxTotal matches the sum of its item scores', () => {
  for (const m of data.modules) {
    const sum = m.sections.flatMap((s) => s.items).reduce((acc, it) => acc + it.maxScore, 0);
    expect(sum).toBeCloseTo(m.maxTotal, 2);
  }
});

test('grand total across all modules matches the championship 100-point scale', () => {
  const grand = data.modules.reduce((acc, m) => acc + m.maxTotal, 0);
  expect(grand).toBeCloseTo(100, 1);
});
