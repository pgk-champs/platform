import { test } from 'node:test';
import assert from 'node:assert';
import { youTubeId, checkLink } from './linkcheck.mjs';

test('id ролика достаётся из всех трёх видов ссылок', () => {
  assert.equal(youTubeId('https://www.youtube.com/watch?v=TGVoOBmvTJs'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://youtu.be/TGVoOBmvTJs'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://www.youtube.com/embed/TGVoOBmvTJs?start=10'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://example.com/watch?v=short'), null);
});

test('живой ролик: берём название и канал из ответа', async () => {
  const fake = async () => ({ ok: true, json: async () => ({ title: 'Про git', author_name: 'Канал' }) });
  const r = await checkLink('https://youtu.be/TGVoOBmvTJs', fake);
  assert.deepEqual(r, { ok: true, title: 'Про git', channel: 'Канал' });
});

test('удалённый ролик не проходит', async () => {
  const fake = async () => ({ ok: false, status: 404 });
  const r = await checkLink('https://youtu.be/TGVoOBmvTJs', fake);
  assert.equal(r.ok, false);
  assert.match(r.reason, /удал|приват/i);
});

test('обычная живая ссылка проходит без названия', async () => {
  const fake = async () => ({ ok: true, status: 200 });
  const r = await checkLink('https://git-scm.com/book/ru', fake);
  assert.equal(r.ok, true);
  assert.equal(r.title, undefined);
});

test('страница отвечает ошибкой — отказ', async () => {
  const fake = async () => ({ ok: false, status: 404 });
  const r = await checkLink('https://example.com/нет', fake);
  assert.equal(r.ok, false);
  assert.match(r.reason, /не отвеча|404/i);
});

test('сеть упала — отказ, а не исключение наружу', async () => {
  const fake = async () => {
    throw new Error('ECONNRESET');
  };
  const r = await checkLink('https://example.com', fake);
  assert.equal(r.ok, false);
  assert.ok(r.reason);
});

test('не https — отказ до всякой сети', async () => {
  const boom = async () => {
    throw new Error('сюда ходить не должны');
  };
  const r = await checkLink('http://example.com', boom);
  assert.equal(r.ok, false);
});
