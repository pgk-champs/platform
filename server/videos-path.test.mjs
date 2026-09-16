import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// Путь к файлу видео НЕ приходит из запроса: он захардкожен. Если однажды его
// начнут брать из тела, тем же запросом можно будет переписать любой файл
// репозитория — включая workflow деплоя. Поэтому здесь стоит страж, отдельный
// от того, что стережёт правку страниц.
const src = fs.readFileSync(new URL('./index.mjs', import.meta.url), 'utf8');
const at = src.indexOf("path === '/content/videos'");
const block = src.slice(at, at + 3000);

test('ручка видео вообще есть', () => {
  assert.ok(at > 0, 'ручки /content/videos нет');
});

test('путь захардкожен и в теле не принимается', () => {
  assert.match(block, /VIDEOS_PATH/);
  assert.doesNotMatch(block, /body\.path/);
});

test('идентификатор ролика проверяется по строгой форме', () => {
  assert.match(src, /\[A-Za-z0-9_-\]\{11\}/);
});

test('количество роликов ограничено четырьмя-пятью', () => {
  assert.match(block, /length < 4/);
  assert.match(block, /length > 5/);
});

test('защита правки страниц не тронута', () => {
  assert.match(src, /const SAFE_DOC_PATH = /);
});
