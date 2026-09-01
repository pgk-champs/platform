// Интеграции с внешними сервисами БЕЗ серверов: экспорт слов в Anki/Quizlet,
// share-ссылки Telegram/VK, .ics-расписание тренировок, ссылки переводчиков.
// Здесь только чистые функции-сборщики (их тестирует integrations.test.tsx)
// плюс downloadFile — он трогает document и вызывается ТОЛЬКО из обработчиков
// кликов, поэтому SSR его не исполняет.

export type ExportWord = { term: string; translation: string };

// Поле CSV: кавычим только если внутри разделитель, кавычка или перевод
// строки (стандартное CSV-экранирование, Anki его понимает).
function csvField(field: string, sep: string): string {
  return field.includes(sep) || field.includes('"') || field.includes('\n')
    ? `"${field.replace(/"/g, '""')}"`
    : field;
}

/** Anki: одна карточка на строку, front;back (разделитель «;»). */
export function buildAnkiCsv(words: ExportWord[]): string {
  return words.map((w) => `${csvField(w.term, ';')};${csvField(w.translation, ';')}`).join('\n') + '\n';
}

/** Quizlet: front[TAB]back. Табы и переводы строк внутри полей — в пробел. */
export function buildQuizletTsv(words: ExportWord[]): string {
  const clean = (s: string) => s.replace(/[\t\n]/g, ' ');
  return words.map((w) => `${clean(w.term)}\t${clean(w.translation)}`).join('\n') + '\n';
}

// --- share ---

export function simShareText(score: number, maxScore: number): string {
  return `Набрал ${score}/${maxScore} в симуляторе чемпионата PGK Champs`;
}

export function certShareText(track: string, chapters: number): string {
  return `Получил сертификат трека «${track}» на PGK Champs — ${chapters} глав пройдено`;
}

export function tgShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function vkShareUrl(url: string, text: string): string {
  return `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
}

// --- переводчики ---

export function translatorUrls(phrase: string): { google: string; deepl: string; yandex: string } {
  const q = encodeURIComponent(phrase);
  return {
    google: `https://translate.google.com/?sl=en&tl=ru&text=${q}&op=translate`,
    deepl: `https://www.deepl.com/translator#en/ru/${q}`,
    yandex: `https://translate.yandex.ru/?source_lang=en&target_lang=ru&text=${q}`,
  };
}

// --- .ics расписание тренировок ---

export type SchedulePlan = {
  /** Дни недели, 0=Пн … 6=Вс. */
  days: number[];
  /** Время начала 'HH:MM'. */
  time: string;
  /** Длительность одной тренировки, минут. */
  sessionMinutes: number;
  /** Длительность курса, недель. */
  weeks: number;
  /** Точка отсчёта (обычно сегодня). */
  start: Date;
};

const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

// Плавающее локальное время без TZID: календарь покажет тренировку в
// локальном времени пользователя — для расписания занятий это и нужно.
function icsDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

/**
 * VCALENDAR с одним повторяющимся VEVENT «Тренировка PGK Champs»:
 * RRULE FREQ=WEEKLY по выбранным дням, UNTIL через `weeks` недель.
 */
export function buildIcs(plan: SchedulePlan): string {
  const days = [...new Set(plan.days)].sort((a, b) => a - b);
  if (days.length === 0) return '';

  const [hh, mm] = plan.time.split(':').map(Number);

  // Первое вхождение: ближайшая дата от start (включительно), чей день
  // недели выбран. getDay(): 0=Вс, приводим к 0=Пн.
  const first = new Date(plan.start);
  first.setHours(hh, mm, 0, 0);
  for (let i = 0; i < 7; i += 1) {
    if (days.includes((first.getDay() + 6) % 7)) break;
    first.setDate(first.getDate() + 1);
  }

  const end = new Date(first.getTime() + plan.sessionMinutes * 60000);
  const until = new Date(first);
  until.setDate(until.getDate() + plan.weeks * 7);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PGK Champs//Training Schedule//RU',
    'BEGIN:VEVENT',
    `UID:pgk-training-${icsDateTime(first)}@pgk-champs`,
    `DTSTAMP:${icsDateTime(plan.start)}`,
    `DTSTART:${icsDateTime(first)}`,
    `DTEND:${icsDateTime(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${days.map((d) => BYDAY[d]).join(',')};UNTIL=${icsDateTime(until)}`,
    'SUMMARY:Тренировка PGK Champs',
    'DESCRIPTION:Регулярная тренировка на платформе PGK Champs',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

// --- скачивание файла (только из обработчика клика) ---

export function downloadFile(name: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
