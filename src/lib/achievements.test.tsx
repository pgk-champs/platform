import { vi } from 'vitest';
import { store } from './store';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, RARITY_XP, evaluate } from './achievements';
import knowledgeMap from '../data/knowledge-map.json';

beforeEach(() => {
  store.__resetForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

test('registry has 110 achievements with unique ids, valid categories and rarities', () => {
  expect(ACHIEVEMENTS).toHaveLength(110);
  expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(110);
  const rarities = new Set(['обычное', 'редкое', 'эпическое']);
  for (const a of ACHIEVEMENTS) {
    expect(ACHIEVEMENT_CATEGORIES).toContain(a.category);
    expect(rarities.has(a.rarity)).toBe(true);
  }
  // в каждой категории есть хотя бы одно достижение
  for (const cat of ACHIEVEMENT_CATEGORIES) {
    expect(ACHIEVEMENTS.some((a) => a.category === cat)).toBe(true);
  }
});

test('evaluate unlocks nothing on empty store', () => {
  expect(evaluate()).toEqual([]);
  expect(store.achievements.list()).toEqual([]);
});

test('reading a section unlocks "первая-прочитанная-глава"', () => {
  store.setSectionRead('typing', 'intro');
  const unlocked = evaluate();
  expect(unlocked.map((a) => a.id)).toContain('первая-прочитанная-глава');
  expect(store.achievements.isUnlocked('первая-прочитанная-глава')).toBe(true);
});

test('same achievement is not unlocked twice across evaluate calls', () => {
  store.setSectionRead('typing', 'intro');
  evaluate();
  const second = evaluate();
  expect(second.map((a) => a.id)).not.toContain('первая-прочитанная-глава');
});

test('finishing a quiz unlocks "первый-квиз", perfect score also unlocks "квиз-на-100"', () => {
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('первый-квиз');
  expect(unlocked).toContain('квиз-на-100');
});

test('an imperfect quiz unlocks "первый-квиз" but not "квиз-на-100"', () => {
  store.markQuizDone('typing', 'q1', { correct: 1, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('первый-квиз');
  expect(unlocked).not.toContain('квиз-на-100');
});

test('3 perfect quizzes in a row unlock "серия-3-квизов"', () => {
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'q2', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'q3', { correct: 2, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('серия-3-квизов');
});

test('a broken streak (one imperfect quiz) does not unlock "серия-3-квизов"', () => {
  store.markQuizDone('typing', 'q1', { correct: 2, total: 2 });
  store.markQuizDone('typing', 'q2', { correct: 1, total: 2 });
  store.markQuizDone('typing', 'q3', { correct: 2, total: 2 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).not.toContain('серия-3-квизов');
});

test('finishing a trainer unlocks "первый-тренажёр"', () => {
  store.markTrainerDone('typing', 'code-typing', { wpm: 40 });
  expect(evaluate().map((a) => a.id)).toContain('первый-тренажёр');
});

test('5 favorites unlock "5-в-избранном"', () => {
  for (let i = 0; i < 5; i += 1) {
    store.favorites.add({ id: `f${i}`, type: 'trainer', chapterId: 'typing', title: `Item ${i}` });
  }
  expect(evaluate().map((a) => a.id)).toContain('5-в-избранном');
});

test('reading sections in 3 chapters unlocks "3-главы"', () => {
  store.setSectionRead('typing', 'intro');
  store.setSectionRead('git-first-commit', 'intro');
  store.setSectionRead('linux-terminal', 'intro');
  expect(evaluate().map((a) => a.id)).toContain('3-главы');
});

test('100 xp unlocks "100-xp"', () => {
  store.addXp(100, 'test');
  expect(evaluate().map((a) => a.id)).toContain('100-xp');
});

// --- волна 5: achievements-v2 ---

test('conflict git sim unlocks "конфликт-побеждён", all three sims unlock "мастер-веток"', () => {
  store.markTrainerDone('git-branches', 'trainer-gitsim-conflict', { goal: 'conflict', scenario: 'x' });
  let unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('конфликт-побеждён');
  expect(unlocked).not.toContain('мастер-веток');

  store.markTrainerDone('git-branches', 'trainer-gitsim-merge', { goal: 'merge', scenario: 'x' });
  store.markTrainerDone('git-branches', 'trainer-gitsim-ff-vs-merge', { goal: 'ff', scenario: 'x' });
  unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('мастер-веток');
});

test('typing speed thresholds: 100 cpm unlocks only "80-зн-мин", 155 cpm unlocks all speed tiers', () => {
  store.markTrainerDone('typing', 'trainer-code-typing', { cpm: 100, accuracy: 95 });
  let unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('80-зн-мин');
  expect(unlocked).not.toContain('120-зн-мин');
  expect(unlocked).not.toContain('скорость-чемпионата');

  store.markTrainerDone('typing', 'trainer-code-typing', { cpm: 155, accuracy: 100 });
  unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('120-зн-мин');
  expect(unlocked).toContain('скорость-чемпионата');
  expect(unlocked).toContain('ни-одной-опечатки');
});

test('PoW difficulty 2 does not unlock "pow-сложность-3", difficulty 3 does', () => {
  store.markTrainerDone('what-is-blockchain', 'trainer-pow-miner', { nonce: 7, difficulty: 2, attempts: 10 });
  expect(evaluate().map((a) => a.id)).not.toContain('pow-сложность-3');

  store.markTrainerDone('what-is-blockchain', 'trainer-pow-miner', { nonce: 9, difficulty: 3, attempts: 99 });
  expect(evaluate().map((a) => a.id)).toContain('pow-сложность-3');
});

test('daily streaks: 3 consecutive days unlock "3-дня-подряд", a gap blocks "7-дней-подряд"', () => {
  for (const day of ['2026-01-01', '2026-01-02', '2026-01-03']) {
    store.completeDaily(day, { correct: 3, total: 3 });
  }
  let unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('вызов-дня');
  expect(unlocked).toContain('3-дня-подряд');
  expect(unlocked).not.toContain('7-дней-подряд');

  // 4 дня с разрывом — серия из 7 не набирается
  for (const day of ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']) {
    store.completeDaily(day, { correct: 3, total: 3 });
  }
  expect(evaluate().map((a) => a.id)).not.toContain('7-дней-подряд');

  // добиваем разрыв — 1..8 января подряд
  store.completeDaily('2026-01-04', { correct: 3, total: 3 });
  expect(evaluate().map((a) => a.id)).toContain('7-дней-подряд');
});

test('night activity (01:30) unlocks "полночь", afternoon activity does not', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 15, 14, 0));
  store.markTrainerDone('typing', 'trainer-day', { solved: true });
  expect(evaluate().map((a) => a.id)).not.toContain('полночь');

  vi.setSystemTime(new Date(2026, 0, 16, 1, 30));
  store.markTrainerDone('typing', 'trainer-night', { solved: true });
  expect(evaluate().map((a) => a.id)).toContain('полночь');
});

test('"весь-фундамент" needs a started section in every foundation chapter', () => {
  const foundationIds = (knowledgeMap as { id: string; path: string }[])
    .filter((e) => e.path.startsWith('foundation/'))
    .map((e) => e.id);
  expect(foundationIds.length).toBeGreaterThan(0);

  for (const id of foundationIds.slice(0, -1)) store.setSectionRead(id, 'intro');
  expect(evaluate().map((a) => a.id)).not.toContain('весь-фундамент');

  store.setSectionRead(foundationIds[foundationIds.length - 1], 'intro');
  expect(evaluate().map((a) => a.id)).toContain('весь-фундамент');
});

test('"экзамен-на-отлично" unlocks at the exam own «Отлично» threshold (80%), not at «Хорошо»', () => {
  store.markExamDone('typing', { correct: 5, total: 8 }); // 62,5% — «Хорошо»
  expect(evaluate().map((a) => a.id)).not.toContain('экзамен-на-отлично');

  // 7 из 8 — 87,5%: экзамен показывает «Отлично», значит и достижение должно прийти.
  store.markExamDone('typing', { correct: 7, total: 8 });
  expect(evaluate().map((a) => a.id)).toContain('экзамен-на-отлично');
});

test('"терминал-прокачан" needs all 6 trainers of the Linux chapter, 4 is not enough', () => {
  for (let i = 1; i <= 4; i += 1) store.markTrainerDone('linux-terminal', `trainer-${i}`, { ok: true });
  expect(evaluate().map((a) => a.id)).not.toContain('терминал-прокачан');

  store.markTrainerDone('linux-terminal', 'trainer-5', { ok: true });
  store.markTrainerDone('linux-terminal', 'trainer-6', { ok: true });
  expect(evaluate().map((a) => a.id)).toContain('терминал-прокачан');
});

test('evaluate survives a corrupted localStorage payload instead of blanking every page', () => {
  // Watcher смонтирован в Root, поэтому исключение здесь — белый экран на всём сайте.
  localStorage.setItem(
    'pgk-store',
    JSON.stringify({ quizLog: null, favorites: null, easter: null, sections: 'мусор' }),
  );
  store.__reloadForTests();
  expect(() => evaluate()).not.toThrow();
});

test('50 graded words unlock "50-слов", sim run records "место-в-лидерборде"', () => {
  for (let i = 0; i < 50; i += 1) store.words.grade(`word-${i}`, true);
  store.sim.addRun('mobile', { score: 6, maxScore: 10 });
  const unlocked = evaluate().map((a) => a.id);
  expect(unlocked).toContain('50-слов');
  expect(unlocked).toContain('первое-слово');
  expect(unlocked).toContain('место-в-лидерборде');
  expect(unlocked).toContain('половина-критериев');
  expect(unlocked).not.toContain('результат-чемпиона');
});

test('достижения не ссылаются на несуществующие главы и тренажёры', async () => {
  // В условиях достижений id глав и тренажёров зашиты руками. Пока реестра
  // тренажёров не было, сверить их было не с чем; теперь есть. Проверка
  // 17.09.2026 показала 15 ссылок и 0 битых — страж держит это состояние:
  // переименуют тренажёр в главе, и достижение станет недостижимым молча.
  const [src, km, reg] = await Promise.all([
    import('fs').then((fs) => fs.readFileSync('src/lib/achievements.ts', 'utf8')),
    import('../data/knowledge-map.json').then((m) => m.default),
    import('../data/trainers.json').then((m) => m.default),
  ]);
  const chapters = new Set((km as { id: string }[]).map((c) => c.id));
  const totals = Object.fromEntries(
    (km as { id: string; totals: { trainers: number } }[]).map((c) => [c.id, c.totals.trainers]),
  );
  const pairs = new Set(
    (reg as { exercises: { chapterId: string; trainerId: string }[] }[]).flatMap((m) =>
      m.exercises.map((e) => `${e.chapterId}|${e.trainerId}`),
    ),
  );

  const broken: string[] = [];
  for (const m of src.matchAll(/trainerDone\(\s*s\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g))
    if (!pairs.has(`${m[1]}|${m[2]}`)) broken.push(`trainerDone ${m[1]}/${m[2]}`);
  for (const m of src.matchAll(/s\.trainers\['([^']+)'\]\?\.\['([^']+)'\]/g))
    if (!pairs.has(`${m[1]}|${m[2]}`)) broken.push(`s.trainers ${m[1]}/${m[2]}`);
  for (const m of src.matchAll(/chapterTrainerCount\(\s*s\s*,\s*'([^']+)'\s*\)\s*>=\s*(\d+)/g)) {
    if (!chapters.has(m[1])) broken.push(`нет главы ${m[1]}`);
    else if (totals[m[1]] < Number(m[2]))
      broken.push(`${m[1]}: нужно ${m[2]}, в главе ${totals[m[1]]}`);
  }

  expect(broken).toEqual([]);
});

test('PoW: рекорд сложности не затирается первой находкой', () => {
  // Тренажёр предлагает поднять сложность ПОСЛЕ первой находки, поэтому
  // запись обязана хранить максимум. Раньше она стояла под тем же гардом, что
  // и XP, и в хранилище навсегда оставалась сложность 1.
  store.__resetForTests();
  const snap = () =>
    (store.getProgress().trainers['what-is-blockchain']?.['trainer-pow-miner']?.result ?? {}) as {
      difficulty?: number;
    };

  store.markTrainerDone('what-is-blockchain', 'trainer-pow-miner', { difficulty: 1 });
  expect(snap().difficulty).toBe(1);

  // вторая находка на сложности 3 — так пишет PowMiner после правки
  const prev = snap();
  store.markTrainerDone('what-is-blockchain', 'trainer-pow-miner', {
    difficulty: Math.max(3, prev.difficulty ?? 0),
  });
  expect(snap().difficulty).toBe(3);

  // и назад рекорд не откатывается
  const prev2 = snap();
  store.markTrainerDone('what-is-blockchain', 'trainer-pow-miner', {
    difficulty: Math.max(1, prev2.difficulty ?? 0),
  });
  expect(snap().difficulty).toBe(3);
});

// ===== лестницы, скрытые и награда (21.09.2026) =====

test('лестница не ломается: выше порог — не ниже редкость', () => {
  // Ступени одного ряда отличаются только числом в проверке. Если «сто» вдруг
  // окажется обычным, а «десять» эпическим, витрина будет врать о труде.
  const порядок = { обычное: 0, редкое: 1, эпическое: 2 } as const;
  const ряды = new Map<string, { n: number; rarity: keyof typeof порядок }[]>();
  for (const a of ACHIEVEMENTS) {
    const m = /^(\d+)-(.+)$/.exec(a.id);
    if (!m) continue;
    const key = m[2];
    if (!ряды.has(key)) ряды.set(key, []);
    ряды.get(key)!.push({ n: Number(m[1]), rarity: a.rarity });
  }
  const кривые: string[] = [];
  for (const [key, ступени] of ряды) {
    if (ступени.length < 2) continue;
    ступени.sort((a, b) => a.n - b.n);
    for (let i = 1; i < ступени.length; i += 1) {
      if (порядок[ступени[i].rarity] < порядок[ступени[i - 1].rarity]) {
        кривые.push(`${key}: ${ступени[i - 1].n} ${ступени[i - 1].rarity} → ${ступени[i].n} ${ступени[i].rarity}`);
      }
    }
  }
  expect(кривые).toEqual([]);
  expect(ряды.size).toBeGreaterThanOrEqual(4);
});

test('скрытые есть, и у них честное описание про находку', () => {
  const hidden = ACHIEVEMENTS.filter((a) => a.hidden);
  expect(hidden.length).toBeGreaterThanOrEqual(3);
  // скрытое не должно быть ступенью лестницы — иначе ряд станет дырявым
  for (const a of hidden) expect(/^\d+-/.test(a.id)).toBe(false);
});

test('мета-достижения стоят в конце: раньше них считать нечего', () => {
  // snapshot() отдаёт живой state, и внутри прохода evaluate() видно только
  // то, что выдано ВЫШЕ по массиву. Мета-достижение в середине считало бы
  // половину коллекции.
  const мета = ACHIEVEMENTS.map((a, i) => ({ a, i })).filter(({ a }) =>
    /achievementsUnlocked/.test(String(a.check)),
  );
  expect(мета.length).toBeGreaterThanOrEqual(2);
  const первыйМета = Math.min(...мета.map((x) => x.i));
  const обычных = ACHIEVEMENTS.slice(первыйМета).filter(
    (a) => !/achievementsUnlocked/.test(String(a.check)),
  );
  expect(обычных).toEqual([]);
});

test('разблокировка платит XP, и платит один раз', () => {
  store.setSectionRead('typing', 'intro');
  const first = evaluate();
  expect(first.length).toBeGreaterThan(0);
  const xpПосле = store.getXp();
  // за секцию XP не начисляется — значит весь XP тут именно за достижения
  const ожидалось = first.reduce((n, a) => n + RARITY_XP[a.rarity], 0);
  expect(xpПосле).toBeGreaterThanOrEqual(ожидалось);
  // повторный проход не платит второй раз
  evaluate();
  expect(store.getXp()).toBe(xpПосле);
});

test('«Экзамен на отлично» не выдаётся за экзамен по БЛОКУ глав', () => {
  // Экзамены глав и блоков лежат в одном s.exams и различаются префиксом.
  store.markExamDone('block:sdacha', { correct: 10, total: 10 });
  evaluate();
  expect(store.achievements.list()).not.toContain('экзамен-на-отлично');
  store.markExamDone('typing', { correct: 10, total: 10 });
  evaluate();
  expect(store.achievements.list()).toContain('экзамен-на-отлично');
});

test('в каждом треке есть что открыть', () => {
  // 35 из 43 старых достижений обслуживали фундамент, у мобилки было ноль.
  const src = String(ACHIEVEMENTS.map((a) => a.check).join(' '));
  for (const track of ['mobile', 'blockchain', 'advanced', 'foundation']) {
    expect(src.includes(`'${track}'`) || ACHIEVEMENTS.some((a) => a.category === 'треки')).toBe(true);
  }
  expect(ACHIEVEMENTS.filter((a) => a.category === 'треки').length).toBeGreaterThanOrEqual(5);
});
