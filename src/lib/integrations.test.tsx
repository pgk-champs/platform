import {
  buildAnkiCsv,
  buildQuizletTsv,
  buildIcs,
  simShareText,
  certShareText,
  tgShareUrl,
  vkShareUrl,
  translatorUrls,
} from './integrations';

const WORDS = [
  { term: 'error', translation: 'ошибка' },
  { term: 'save; quit', translation: 'сохранить "и" выйти' },
];

test('Anki CSV: front;back, поля с ; и кавычками экранируются', () => {
  const csv = buildAnkiCsv(WORDS);
  expect(csv).toBe('error;ошибка\n"save; quit";"сохранить ""и"" выйти"\n');
});

test('Quizlet TSV: front[TAB]back, табы внутри полей — в пробел', () => {
  const tsv = buildQuizletTsv([{ term: 'a\tb', translation: 'а' }]);
  expect(tsv).toBe('a b\tа\n');
});

test('share-тексты', () => {
  expect(simShareText(73.5, 100)).toBe('Набрал 73.5/100 в симуляторе чемпионата PGK Champs');
  expect(certShareText('мобилка', 8)).toContain('«мобилка»');
});

test('share-ссылки Telegram и VK кодируют url и текст', () => {
  const tg = tgShareUrl('https://x.ru/a?b=1', 'Набрал 5/10');
  expect(tg).toBe(
    'https://t.me/share/url?url=https%3A%2F%2Fx.ru%2Fa%3Fb%3D1&text=%D0%9D%D0%B0%D0%B1%D1%80%D0%B0%D0%BB%205%2F10',
  );
  const vk = vkShareUrl('https://x.ru/', 'привет');
  expect(vk.startsWith('https://vk.com/share.php?url=https%3A%2F%2Fx.ru%2F&title=')).toBe(true);
});

test('ссылки переводчиков предзаполняют фразу', () => {
  const urls = translatorUrls('no such file');
  expect(urls.google).toContain('sl=en&tl=ru&text=no%20such%20file');
  expect(urls.deepl).toBe('https://www.deepl.com/translator#en/ru/no%20such%20file');
  expect(urls.yandex).toContain('text=no%20such%20file');
});

test('ICS: VEVENT с RRULE по выбранным дням, DTSTART в первый подходящий день', () => {
  // 2026-09-01 — вторник; выбраны Пн(0) и Ср(2) → первое вхождение Ср 02.09.
  const ics = buildIcs({
    days: [0, 2],
    time: '19:30',
    sessionMinutes: 45,
    weeks: 2,
    start: new Date(2026, 8, 1, 12, 0, 0),
  });
  expect(ics).toContain('BEGIN:VCALENDAR');
  expect(ics).toContain('SUMMARY:Тренировка PGK Champs');
  expect(ics).toContain('DTSTART:20260902T193000');
  expect(ics).toContain('DTEND:20260902T201500');
  // UNTIL включительный: окно 02–15.09 — это Ср 02, Пн 07, Ср 09, Пн 14,
  // ровно 4 тренировки за 2 недели (до правки 16.09 давало пятую).
  expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20260915T193000');
  // RFC 5545: строки разделяются CRLF
  expect(ics).toContain('\r\nBEGIN:VEVENT\r\n');
});

test('ICS: без выбранных дней — пустая строка', () => {
  expect(buildIcs({ days: [], time: '10:00', sessionMinutes: 30, weeks: 1, start: new Date() })).toBe('');
});

test('ICS: день start подходит сам — DTSTART в этот же день', () => {
  // 2026-09-01 — вторник (индекс 1)
  const ics = buildIcs({
    days: [1],
    time: '08:00',
    sessionMinutes: 60,
    weeks: 1,
    start: new Date(2026, 8, 1, 12, 0, 0),
  });
  expect(ics).toContain('DTSTART:20260901T080000');
  expect(ics).toContain('BYDAY=TU');
});

test('ICS: окно RRULE — ровно `weeks` недель, без лишней тренировки в конце', () => {
  // 2026-09-01 — вторник, занятия по вторникам, 3 недели: 01, 08, 15.09.
  // UNTIL 21.09 (пн) закрывает окно до вторника 22.09 — четвёртой тренировки нет.
  const ics = buildIcs({
    days: [1],
    time: '08:00',
    sessionMinutes: 60,
    weeks: 3,
    start: new Date(2026, 8, 1, 12, 0, 0),
  });
  expect(ics).toContain('DTSTART:20260901T080000');
  expect(ics).toContain('UNTIL=20260921T080000');
});
