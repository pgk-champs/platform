// Таблицы рекордов на /achievements. Логика живёт здесь, а не в странице:
// vitest не резолвит @theme/Layout, и всё, что осталось бы в pages/, тестами
// не покрывается вовсе.

import type { TrainerResult, ExamResult, QuizLogEntry } from './store';

export type QuizRecord = { chapterId: string; quizId: string; best: number; total: number; attempts: number };

export function quizRecords(quizLog: QuizLogEntry[]): QuizRecord[] {
  const byKey = new Map<string, QuizRecord>();
  for (const e of quizLog) {
    const key = `${e.chapterId}:${e.quizId}`;
    const row = byKey.get(key);
    if (!row) {
      byKey.set(key, { chapterId: e.chapterId, quizId: e.quizId, best: e.correct, total: e.total, attempts: 1 });
    } else {
      row.attempts += 1;
      if (e.correct > row.best) {
        row.best = e.correct;
        row.total = e.total;
      }
    }
  }
  return [...byKey.values()];
}

export type TrainerRecord = { chapterId: string; trainerId: string; cpm: number | null; ts: number };

// Строка на КАЖДЫЙ пройденный тренажёр, а не только на те, что пишут скорость.
// Скорость считают четыре механики из сорока шести, и таблица под заголовком
// «Тренажёры» показывала полтора десятка строк из двух сотен пройденных —
// выглядело как потерянный прогресс.
export function trainerRecords(trainers: Record<string, Record<string, TrainerResult>>): TrainerRecord[] {
  const rows: TrainerRecord[] = [];
  for (const [chapterId, byId] of Object.entries(trainers)) {
    for (const [trainerId, entry] of Object.entries(byId)) {
      const cpm = (entry.result as { cpm?: unknown } | undefined)?.cpm;
      rows.push({ chapterId, trainerId, cpm: typeof cpm === 'number' ? cpm : null, ts: entry.ts });
    }
  }
  return rows.sort((a, b) => b.ts - a.ts);
}

// Экзамены по блокам глав лежат в своём разделе store (`block:<id>`) и в
// quizLog не попадают — в рекордах их не было вовсе.
export function blockExamRecords(exams: Record<string, ExamResult[]>): QuizRecord[] {
  return Object.entries(exams)
    .filter(([id]) => id.startsWith('block:'))
    .flatMap(([chapterId, attempts]) => {
      if (attempts.length === 0) return [];
      const best = attempts.reduce((a, b) => (b.correct > a.correct ? b : a));
      return [
        { chapterId, quizId: 'block-exam', best: best.correct, total: best.total, attempts: attempts.length },
      ];
    });
}

/** Сколько строк показываем до кнопки «показать все». */
export const ПОКАЗ = 25;
