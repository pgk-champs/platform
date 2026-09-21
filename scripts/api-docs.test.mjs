// Документация API и код не должны разъезжаться. Файл static/api.md
// генерится из server/api-routes.mjs; этот страж требует, чтобы в репозитории
// лежало ровно то, что выдаёт генератор. Добавили маршрут и забыли про
// документацию — сборка упадёт здесь, а не у того, кто читает документацию.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderDocs, renderPage } from './api-docs.mjs';
import { ROUTES } from '../server/api-routes.mjs';

test('оба файла совпадают с генератором', () => {
  // Их два из одного текста: сырой для машины и страница для человека.
  // Сырой сервер отдаёт как octet-stream, то есть по ссылке он скачивается —
  // без страницы пункт в навигации вёл бы в загрузки.
  assert.equal(fs.readFileSync('static/api.md', 'utf8'), renderDocs(), 'перегенерируй: node scripts/api-docs.mjs');
  assert.equal(fs.readFileSync('src/pages/api.md', 'utf8'), renderPage(), 'перегенерируй: node scripts/api-docs.mjs');
});

test('на API ведёт ссылка из навигации, а не только из кабинета', () => {
  const cfg = fs.readFileSync('docusaurus.config.ts', 'utf8');
  assert.match(cfg, /to: '\/api'/, 'в навбаре или подвале нет пункта про API');
});

test('в документации есть каждый адрес', () => {
  const текст = renderDocs();
  for (const r of ROUTES) {
    assert.ok(текст.includes(`${r.method} /api/v1${r.pattern}`), `не описан ${r.method} ${r.pattern}`);
  }
});

test('документация предупреждает про чужой текст как источник указаний', () => {
  // Агент читает очередь модерации, где лежит текст произвольного человека.
  const текст = renderDocs();
  assert.match(текст, /данные, а не команда|это данные/i);
});
