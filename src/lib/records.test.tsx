import { quizRecords, trainerRecords, blockExamRecords, ПОКАЗ } from './records';
import { chapterTitle, taskLabel } from '../components/chapterLabels';
import knowledgeMap from '../data/knowledge-map.json';

const жур = (chapterId: string, quizId: string, correct: number, ts: number) => ({
  chapterId,
  quizId,
  correct,
  total: 3,
  ts,
});

test('повторные попытки квиза сходятся в одну строку с лучшим счётом', () => {
  const rows = quizRecords([жур('a', 'q1', 1, 1), жур('a', 'q1', 3, 2), жур('a', 'q2', 2, 3)]);
  expect(rows).toHaveLength(2);
  const q1 = rows.find((r) => r.quizId === 'q1')!;
  expect(q1.best).toBe(3);
  expect(q1.attempts).toBe(2);
});

test('тренажёр без скорости всё равно попадает в рекорды', () => {
  // Скорость пишут четыре механики из сорока шести. Пока таблица брала только
  // их, две сотни пройденных тренажёров выглядели как потерянный прогресс.
  const rows = trainerRecords({
    'kotlin-null': { CodeTyping: { result: { cpm: 180 }, ts: 2 }, BugHunt: { result: { done: true }, ts: 1 } },
  });
  expect(rows).toHaveLength(2);
  expect(rows.find((r) => r.trainerId === 'BugHunt')!.cpm).toBeNull();
  expect(rows.find((r) => r.trainerId === 'CodeTyping')!.cpm).toBe(180);
});

test('свежий тренажёр стоит первым — обрезка показывает последнее', () => {
  const rows = trainerRecords({
    a: { X: { result: {}, ts: 1 }, Y: { result: {}, ts: 9 } },
  });
  expect(rows[0].trainerId).toBe('Y');
});

test('экзамен блока виден в рекордах и назван по-человечески', () => {
  const rows = blockExamRecords({
    'block:sdacha': [
      { correct: 5, total: 10, ts: 1 },
      { correct: 8, total: 10, ts: 2 },
    ],
  });
  expect(rows).toHaveLength(1);
  expect(rows[0].best).toBe(8);
  expect(rows[0].attempts).toBe(2);
  expect(chapterTitle(rows[0].chapterId)).toBe('Экзамен блока «Сдача и демонстрация»');
  expect(taskLabel(rows[0].quizId)).toBe('Экзамен блока');
});

test('у каждого экзамена блока есть ключ и название', () => {
  // Без них в таблице светилось бы «block:sdacha». Оба поля генерит
  // knowledge-map прямо из тега, руками их не повторяют.
  const bad = (knowledgeMap as { id: string; blockExam?: boolean; blockExamId?: string | null; blockExamTitle?: string | null }[])
    .filter((c) => c.blockExam && (!c.blockExamId || !c.blockExamTitle))
    .map((c) => c.id);
  expect(bad).toEqual([]);
  expect((knowledgeMap as { blockExam?: boolean }[]).filter((c) => c.blockExam)).toHaveLength(12);
});

test('обрезка таблицы не прячет всё подряд', () => {
  expect(ПОКАЗ).toBeGreaterThanOrEqual(10);
  expect(ПОКАЗ).toBeLessThanOrEqual(50);
});
