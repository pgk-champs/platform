import knowledgeMap from '../data/knowledge-map.json';
import { store } from './store';

// Наполнение главы считается по делам, а не по отметкам: ручной галочки «пройдено»
// на платформе больше нет. Тренажёры в знаменатель НЕ входят — trainerId
// необязателен, и глава без тренажёров иначе не наполнилась бы никогда.

type Totals = { sections: number; quizzes: number; trainers: number };

const TOTALS: Record<string, Totals> = Object.fromEntries(
  (knowledgeMap as { id: string; totals: Totals }[]).map((e) => [e.id, e.totals]),
);

/** Доля пройденного в главе, 0..1. Неизвестная глава — 0, без падения. */
export function fillOf(chapterId: string): number {
  const t = TOTALS[chapterId];
  if (!t) return 0;
  const denom = t.sections + t.quizzes;
  if (denom === 0) return 0;

  const progress = store.getProgress();
  const sections = progress.sections[chapterId]?.length ?? 0;
  // Проверка засчитывается только целиком верной — так же, как это понимало
  // прежнее «пройдена». Иначе сосуд наполнялся бы провалами.
  const quizzes = Object.values(progress.quizzes[chapterId] ?? {}).filter(
    (q) => q.correct === q.total,
  ).length;

  return Math.min(1, (sections + quizzes) / denom);
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
