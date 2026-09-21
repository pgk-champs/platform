import { test } from 'node:test';
import assert from 'node:assert';
import { mergeProgress } from './merge.mjs';

test('прочитанные секции и достижения объединяются без потерь', () => {
  const a = { sections: { typing: ['why', 'rows'] }, achievementsUnlocked: ['first-steps'] };
  const b = { sections: { typing: ['rows', 'hotkeys'], 'linux-terminal': ['intro'] }, achievementsUnlocked: ['night-owl'] };
  const m = mergeProgress(a, b);
  assert.deepEqual(m.sections.typing.sort(), ['hotkeys', 'rows', 'why']);
  assert.deepEqual(m.sections['linux-terminal'], ['intro']);
  assert.deepEqual(m.achievementsUnlocked.sort(), ['first-steps', 'night-owl']);
});

test('очки берутся максимальные, а не последние', () => {
  assert.equal(mergeProgress({ xp: 340 }, { xp: 120 }).xp, 340);
  assert.equal(mergeProgress({ xp: 120 }, { xp: 340 }).xp, 340);
});

test('по каждому квизу остаётся лучшая попытка', () => {
  const a = { quizzes: { typing: { q1: { correct: 3, total: 4 } } } };
  const b = { quizzes: { typing: { q1: { correct: 4, total: 4 }, q2: { correct: 2, total: 3 } } } };
  const m = mergeProgress(a, b);
  assert.equal(m.quizzes.typing.q1.correct, 4);
  assert.equal(m.quizzes.typing.q2.correct, 2);
});

test('избранное не задваивается по одному и тому же блоку', () => {
  const fav = { chapterId: 'typing', blockId: 'b1', payload: 'x' };
  const m = mergeProgress({ favorites: [fav] }, { favorites: [fav, { chapterId: 't', blockId: 'b2' }] });
  assert.equal(m.favorites.length, 2);
});

test('слияние пустого с непустым возвращает непустое, порядок не важен', () => {
  const full = { xp: 50, sections: { typing: ['why'] }, achievementsUnlocked: ['a'] };
  assert.deepEqual(mergeProgress({}, full).sections, full.sections);
  assert.deepEqual(mergeProgress(full, {}).sections, full.sections);
  assert.equal(mergeProgress({}, full).xp, 50);
});

test('мусор вместо объекта не роняет слияние', () => {
  assert.doesNotThrow(() => mergeProgress(null, undefined));
  assert.doesNotThrow(() => mergeProgress('x', 42));
  const m = mergeProgress({ sections: 'bad' }, { xp: 'bad' });
  assert.deepEqual(m.sections, {});
  assert.equal(m.xp, 0);
});

test('ежедневные вызовы: по каждой дате остаётся лучшая попытка', () => {
  const a = { daily: { '2026-09-01': { correct: 3, total: 4, ts: 1 } } };
  const b = { daily: { '2026-09-01': { correct: 4, total: 4, ts: 2 }, '2026-09-02': { correct: 2, total: 4, ts: 3 } } };
  const m = mergeProgress(a, b);
  assert.equal(m.daily['2026-09-01'].correct, 4);
  assert.equal(m.daily['2026-09-02'].correct, 2);
});

test('очки-за-действие (xpAwarded) и скрытые подсказки объединяются', () => {
  const m = mergeProgress(
    { xpAwarded: ['quiz:typing:q1'], dismissedHints: ['h1'] },
    { xpAwarded: ['exam:typing'], dismissedHints: ['h1', 'h2'] },
  );
  assert.deepEqual(m.xpAwarded.sort(), ['exam:typing', 'quiz:typing:q1']);
  assert.deepEqual(m.dismissedHints.sort(), ['h1', 'h2']);
});

test('прогоны симулятора — карта по модулям, попытки не теряются', () => {
  const a = { simRuns: { moduleA: [{ score: 10, maxScore: 20, ts: 1 }] } };
  const b = { simRuns: { moduleA: [{ score: 15, maxScore: 20, ts: 2 }], moduleB: [{ score: 5, maxScore: 10, ts: 3 }] } };
  const m = mergeProgress(a, b);
  assert.equal(m.simRuns.moduleA.length, 2);
  assert.equal(m.simRuns.moduleB.length, 1);
});

test('пасхалки — логическое ИЛИ: открыто на любом устройстве = открыто', () => {
  const m = mergeProgress({ easter: { konami: true } }, { easter: { speedrun: true } });
  assert.equal(m.easter.konami, true);
  assert.equal(m.easter.speedrun, true);
});

// --- надгробия (21.09.2026) ---
//
// Слияние объединяет множества, поэтому снятая звёздочка возвращалась с
// сервера через пять секунд после автосинка. Молча, и так каждый раз.

test('убранное руками не воскресает при слиянии', () => {
  const наСервере = {
    favorites: [{ id: 'typing:home-row', title: 'Домашний ряд', ts: 100 }],
    customPresets: [{ id: 'cp-1', name: 'Набор', ts: 100 }],
  };
  const сУстройства = {
    favorites: [],
    customPresets: [],
    removed: [{ id: 'typing:home-row', ts: 200 }, { id: 'cp-1', ts: 200 }],
  };
  const out = mergeProgress(наСервере, сУстройства);
  assert.deepEqual(out.favorites, []);
  assert.deepEqual(out.customPresets, []);
  assert.equal(out.removed.length, 2);
});

test('надгробие не мешает добавить то же самое заново', () => {
  // Клиент при повторном добавлении стирает надгробие (см. favAdd в store).
  const было = { favorites: [], removed: [{ id: 'typing:home-row', ts: 100 }] };
  const стало = { favorites: [{ id: 'typing:home-row', title: 'Домашний ряд', ts: 300 }], removed: [] };
  const out = mergeProgress(было, стало);
  assert.equal(out.favorites.length, 1, 'добавленное ПОЗЖЕ удаления должно остаться');
});

test('список надгробий не растёт бесконечно', () => {
  const много = Array.from({ length: 700 }, (_, i) => ({ id: `id-${i}`, ts: i }));
  const out = mergeProgress({ removed: много }, { removed: [] });
  assert.equal(out.removed.length, 500);
});

test('следы материалов сообщества сливаются объединением', () => {
  // Отправлял с ноутбука, приняли — увидел с телефона: следы должны сойтись,
  // а не затереть друг друга.
  const out = mergeProgress({ community: ['sub:1'] }, { community: ['sub:1', 'ok:1', 'sub:2'] });
  assert.deepEqual(out.community.sort(), ['ok:1', 'sub:1', 'sub:2']);
});
