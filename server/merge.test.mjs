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
