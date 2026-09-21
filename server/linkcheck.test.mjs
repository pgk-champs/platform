import { test } from 'node:test';
import assert from 'node:assert';
import { youTubeId, checkLink } from './linkcheck.mjs';

// Имена разрешаем подставным резолвером: модуль обещает проверяемость без
// сети, а с фильтром приватных адресов настоящий DNS сделал бы тесты
// зависимыми от интернета и от того, куда указывает чужой домен сегодня.
const публичный = async () => [{ address: '93.184.216.34' }];
const внутренний = async () => [{ address: '10.0.0.7' }];

test('id ролика достаётся из всех трёх видов ссылок', () => {
  assert.equal(youTubeId('https://www.youtube.com/watch?v=TGVoOBmvTJs'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://youtu.be/TGVoOBmvTJs'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://www.youtube.com/embed/TGVoOBmvTJs?start=10'), 'TGVoOBmvTJs');
  assert.equal(youTubeId('https://example.com/watch?v=short'), null);
});

test('живой ролик: берём название и канал из ответа', async () => {
  const fake = async () => ({ ok: true, json: async () => ({ title: 'Про git', author_name: 'Канал' }) });
  const r = await checkLink('https://youtu.be/TGVoOBmvTJs', fake, публичный);
  assert.deepEqual(r, { ok: true, title: 'Про git', channel: 'Канал' });
});

test('удалённый ролик не проходит', async () => {
  const fake = async () => ({ ok: false, status: 404 });
  const r = await checkLink('https://youtu.be/TGVoOBmvTJs', fake, публичный);
  assert.equal(r.ok, false);
  assert.match(r.reason, /удал|приват/i);
});

test('обычная живая ссылка проходит без названия', async () => {
  const fake = async () => ({ ok: true, status: 200 });
  const r = await checkLink('https://git-scm.com/book/ru', fake, публичный);
  assert.equal(r.ok, true);
  assert.equal(r.title, undefined);
});

test('страница отвечает ошибкой — отказ', async () => {
  const fake = async () => ({ ok: false, status: 404 });
  const r = await checkLink('https://example.com/нет', fake, публичный);
  assert.equal(r.ok, false);
  assert.match(r.reason, /не отвеча|404/i);
});

test('сеть упала — отказ, а не исключение наружу', async () => {
  const fake = async () => {
    throw new Error('ECONNRESET');
  };
  const r = await checkLink('https://example.com', fake, публичный);
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

// --- куда серверу ходить нельзя (21.09.2026) ---
//
// Проверка ссылки идёт ОТ ИМЕНИ хоста: без фильтра форма «поделиться
// материалом» — готовый зонд во внутреннюю сеть от любого вошедшего.

test('внутренний адрес не проверяется вовсе', async () => {
  let ходил = false;
  const fake = async () => {
    ходил = true;
    return { ok: true, status: 200 };
  };
  for (const url of [
    'https://127.0.0.1/admin',
    'https://10.0.0.7/',
    'https://192.168.1.1/',
    'https://169.254.169.254/latest/meta-data/',
    'https://localhost:2208/api',
    'https://[::1]/',
  ]) {
    const r = await checkLink(url, fake, публичный);
    assert.equal(r.ok, false, `прошло: ${url}`);
  }
  assert.equal(ходил, false, 'до fetch дойти не должно');
});

test('имя, которое РАЗРЕШАЕТСЯ во внутренний адрес, тоже не проходит', async () => {
  const fake = async () => ({ ok: true, status: 200 });
  const r = await checkLink('https://вроде-обычный-домен.example/', fake, внутренний);
  assert.equal(r.ok, false);
  assert.match(r.reason, /проверить нельзя/);
});

test('переадресация во внутреннюю сеть обрывается', async () => {
  const fake = async (url) =>
    url.includes('example.com')
      ? { ok: false, status: 302, headers: { get: () => 'https://169.254.169.254/latest/' } }
      : { ok: true, status: 200 };
  const r = await checkLink('https://example.com/', fake, публичный);
  assert.equal(r.ok, false);
  assert.match(r.reason, /проверить нельзя/);
});

test('переадресаций не больше трёх', async () => {
  const fake = async () => ({ ok: false, status: 302, headers: { get: () => 'https://example.com/next' } });
  const r = await checkLink('https://example.com/', fake, публичный);
  assert.equal(r.ok, false);
  assert.match(r.reason, /переадресац/);
});
