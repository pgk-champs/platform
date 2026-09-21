import { presetKey } from './presetKey';
import type { NormalizedPreset } from '../../server/preset.d.mts';

const карточки = (cards: { term: string; translation: string }[]): NormalizedPreset => ({
  name: 'Набор',
  engine: 'flashcards',
  cards,
});

test('ключ считается от содержимого, а не от имени', () => {
  // Иначе XP фармился бы пересохранением: новый id — новая причина — новая
  // оплата. От содержимого ключ не подделать иначе как собрав другой набор.
  const a = { ...карточки([{ term: 'a', translation: 'б' }]), name: 'Первый' };
  const b = { ...карточки([{ term: 'a', translation: 'б' }]), name: 'Второй' };
  expect(presetKey(a)).toBe(presetKey(b));
});

test('другой состав — другой ключ', () => {
  expect(presetKey(карточки([{ term: 'a', translation: 'б' }]))).not.toBe(
    presetKey(карточки([{ term: 'a', translation: 'в' }])),
  );
});

test('движки не сталкиваются между собой', () => {
  const слова: NormalizedPreset = { name: 'н', engine: 'wordorder', phrase: 'раз два' };
  const печать: NormalizedPreset = { name: 'н', engine: 'codetyping', snippets: ['раз два'] };
  expect(presetKey(слова)).not.toBe(presetKey(печать));
});

test('лишние пробелы во фразе не создают второй набор', () => {
  const a: NormalizedPreset = { name: 'н', engine: 'wordorder', phrase: 'раз  два   три' };
  const b: NormalizedPreset = { name: 'н', engine: 'wordorder', phrase: 'раз два три' };
  expect(presetKey(a)).toBe(presetKey(b));
});

test('ключ короткий и годится в id прогресса', () => {
  const k = presetKey(карточки([{ term: 'a', translation: 'б' }]));
  expect(k.startsWith('preset:')).toBe(true);
  expect(k.length).toBeLessThan(20);
  expect(k).toMatch(/^preset:[a-z0-9]+$/);
});
