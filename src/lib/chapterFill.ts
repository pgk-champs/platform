import knowledgeMap from '../data/knowledge-map.json';
import { store } from './store';

// Наполнение главы считается по делам, а не по отметкам: ручной галочки «пройдено»
// на платформе больше нет. Тренажёры входят в счёт с 17.09.2026 — до этого в
// шапке главы висело «Тренажёры 0/6», а сосуд наливался до крышки, ни одного
// тренажёра не спросив, и одно слово значило две разные вещи. Глава без
// тренажёров не страдает: у неё totals.trainers = 0, знаменатель тот же.

type Totals = { sections: number; quizzes: number; trainers: number };

const TOTALS: Record<string, Totals> = Object.fromEntries(
  (knowledgeMap as { id: string; totals: Totals }[]).map((e) => [e.id, e.totals]),
);

/** Доля пройденного в главе, 0..1. Неизвестная глава — 0, без падения. */
export function fillOf(chapterId: string): number {
  const t = TOTALS[chapterId];
  if (!t) return 0;
  const denom = t.sections + t.quizzes + t.trainers;
  if (denom === 0) return 0;

  const progress = store.getProgress();
  const sections = progress.sections[chapterId]?.length ?? 0;
  // Проверка засчитывается только целиком верной — так же, как это понимало
  // прежнее «пройдена». Иначе сосуд наполнялся бы провалами.
  const quizzes = Object.values(progress.quizzes[chapterId] ?? {}).filter(
    (q) => q.correct === q.total,
  ).length;

  // Тренажёр засчитывается фактом прохождения: общей шкалы «верно» у сорока
  // шести разных механик нет, и требовать её значило бы переписать их все.
  const trainers = Math.min(Object.keys(progress.trainers[chapterId] ?? {}).length, t.trainers);

  return Math.min(1, (sections + quizzes + trainers) / denom);
}

export function isFull(chapterId: string): boolean {
  return fillOf(chapterId) >= 1;
}

/** Что читать дальше: начатая и незаконченная, иначе первая нетронутая, иначе null. */
export function nextChapter(ids: string[]): string | null {
  const fills = ids.map((id) => [id, fillOf(id)] as const);
  const started = fills.find(([, f]) => f > 0 && f < 1);
  if (started) return started[0];
  const fresh = fills.find(([, f]) => f === 0);
  return fresh ? fresh[0] : null;
}

/** Сколько глав из списка наполнено до крышки. */
export function fullCount(ids: string[]): number {
  return ids.filter(isFull).length;
}
