import { chapterHref, chapterTitle, taskLabel, GYM_CHAPTER_ID } from './chapterLabels';
import knowledgeMap from '../data/knowledge-map.json';

test('название главы берётся из карты знаний', () => {
  const first = (knowledgeMap as { id: string; title: string }[])[0];
  expect(chapterTitle(first.id)).toBe(first.title);
  expect(chapterTitle('kotlin-vars')).toBe('Переменные и типы');
});

test('результаты тренажёрного зала подписаны по-человечески, а не «gym»', () => {
  // store пишет standalone-запуски под chapterId='gym' (GymCatalog),
  // в knowledge-map такой главы нет.
  expect((knowledgeMap as { id: string }[]).some((e) => e.id === GYM_CHAPTER_ID)).toBe(false);
  expect(chapterTitle(GYM_CHAPTER_ID)).toBe('Тренажёрный зал');
  expect(chapterHref(GYM_CHAPTER_ID)).toBe('/gym');
});

test('незнакомый id остаётся как есть и не даёт ссылки', () => {
  expect(chapterTitle('foundation/02-it-english')).toBe('foundation/02-it-english');
  expect(chapterHref('foundation/02-it-english')).toBeNull();
});

test('адрес главы строится из пути без расширения', () => {
  expect(chapterHref('kotlin-vars')).toBe('/docs/mobile/kotlin-vars');
  // Глава с «02b» в имени: префикс не числовой, id и адрес его сохраняют.
  expect(chapterHref('02b-english-practice')).toBe('/docs/foundation/02b-english-practice');
});

test('технические id квизов и тренажёров превращаются в подписи', () => {
  expect(taskLabel('q3')).toBe('Проверка 3');
  expect(taskLabel('exam')).toBe('Экзамен главы');
  expect(taskLabel('quiz-home-row')).toBe('Home row');
  expect(taskLabel('trainer-git-commands')).toBe('Git commands');
  expect(taskLabel('gym-typing')).toBe('Typing');
  // Ничего осмысленного не осталось — показываем исходный id, а не пустоту.
  expect(taskLabel('quiz-')).toBe('quiz-');
});
