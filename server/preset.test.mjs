// Правила пользовательского набора. Модуль общий для сервера и сайта, и
// проверяется он здесь: на сервере до 21.09.2026 стояло «объект и не массив»,
// то есть в каталог могло лечь что угодно, а клиент такую запись рисовать
// отказывался — материал пропадал уже ПОСЛЕ одобрения модератором.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePreset, presetSummary, LIMITS } from './preset.mjs';

const карточки = { name: 'Слова к зачёту', engine: 'flashcards', cards: [{ term: 'commit', translation: 'коммит' }] };

test('годный набор проходит и возвращается нормализованным', () => {
  assert.deepEqual(normalizePreset(карточки), карточки);
  assert.deepEqual(normalizePreset({ name: 'а', engine: 'wordorder', phrase: 'раз два' }), {
    name: 'а',
    engine: 'wordorder',
    phrase: 'раз два',
  });
});

test('лишние ключи не доезжают ни до базы, ни до движка', () => {
  const out = normalizePreset({ ...карточки, onclick: 'alert(1)', cards: [{ ...карточки.cards[0], evil: true }] });
  assert.deepEqual(Object.keys(out).sort(), ['cards', 'engine', 'name']);
  assert.deepEqual(Object.keys(out.cards[0]).sort(), ['term', 'translation']);
});

test('мусор не проходит', () => {
  const плохие = [
    null,
    'строка',
    [],
    { name: '', engine: 'flashcards', cards: [{ term: 'a', translation: 'b' }] },
    { name: 'а', engine: 'flashcards', cards: [] },
    { name: 'а', engine: 'flashcards', cards: [{ term: 'a' }] },
    { name: 'а', engine: 'wordorder', phrase: 'одно' },
    { name: 'а', engine: 'codetyping', snippets: [''] },
    { name: 'а', engine: 'predict', code: 'x', expected: '' },
    { name: 'а', engine: 'нетакого', x: 1 },
  ];
  for (const p of плохие) assert.equal(normalizePreset(p), null, `прошло: ${JSON.stringify(p)}`);
});

test('размер ограничен: набор целиком едет в снимок store и в PUT /progress', () => {
  const много = Array.from({ length: LIMITS.cards + 1 }, (_, i) => ({ term: `a${i}`, translation: `b${i}` }));
  assert.equal(normalizePreset({ ...карточки, cards: много }), null);
  assert.equal(normalizePreset({ ...карточки, name: 'я'.repeat(LIMITS.name + 1) }), null);
  assert.equal(
    normalizePreset({ name: 'а', engine: 'predict', code: 'x'.repeat(LIMITS.code + 1), expected: 'y' }),
    null,
  );
});

test('версия формата: неизвестную не читаем, отсутствующую считаем первой', () => {
  assert.ok(normalizePreset({ ...карточки, v: 1 }));
  assert.equal(normalizePreset({ ...карточки, v: 2 }), null);
  assert.ok(normalizePreset(карточки));
});

test('подпись набора говорит, что внутри', () => {
  assert.match(presetSummary(normalizePreset(карточки)), /карточки: 1/);
  assert.match(presetSummary(normalizePreset({ name: 'а', engine: 'wordorder', phrase: 'раз два три' })), /3 слов/);
});
