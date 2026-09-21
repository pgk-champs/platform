// Адрес возврата после входа. Проверка по началу строки пропускала чужой
// домен, начинающийся с нашего (edu.alspio.com.чужой.example), а туда уезжает
// сессионный токен во фрагменте — то есть полный доступ к аккаунту на 180
// дней. Сравнивать можно только разобранный origin.
//
// Модуль сервера целиком поднимать нельзя (он открывает порт и базу), поэтому
// правило продублировано здесь и сверяется с исходником регуляркой: если в
// index.mjs вернут startsWith, тест это увидит.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const BASE_URL = 'https://edu.alspio.com';
const ORIGINS = [BASE_URL];

const safeReturn = (ret) => {
  try {
    if (!ret) return `${BASE_URL}/`;
    const u = new URL(ret, BASE_URL);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return `${BASE_URL}/`;
    if (ORIGINS.includes(u.origin)) return u.toString();
  } catch {}
  return `${BASE_URL}/`;
};

test('чужой домен, начинающийся с нашего, не проходит', () => {
  for (const плохой of [
    'https://edu.alspio.com.evil.example/steal',
    'https://edu.alspio.com@evil.example/',
    'https://edu.alspio.com.evil.example',
    'http://evil.example/',
    'javascript:alert(1)',
    '//evil.example/',
  ]) {
    assert.equal(safeReturn(плохой), `${BASE_URL}/`, `прошло: ${плохой}`);
  }
});

test('свой адрес возвращается как есть', () => {
  assert.equal(safeReturn(`${BASE_URL}/mentor`), `${BASE_URL}/mentor`);
  assert.equal(safeReturn(`${BASE_URL}/docs/foundation/typing?x=1`), `${BASE_URL}/docs/foundation/typing?x=1`);
  assert.equal(safeReturn(''), `${BASE_URL}/`);
});

test('в сервере правило именно такое, а не по началу строки', () => {
  const src = fs.readFileSync('server/index.mjs', 'utf8');
  const блок = /const safeReturn = \(ret\) => \{[\s\S]*?\n\};/.exec(src)[0];
  assert.match(блок, /ORIGINS\.includes\(u\.origin\)/, 'origin должен сравниваться целиком');
  assert.doesNotMatch(блок, /ret\.startsWith/, 'сравнение по началу строки вернулось');
});
