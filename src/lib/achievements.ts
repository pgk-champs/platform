// Реестр достижений платформы. evaluate() вызывается после изменений в
// store (см. AchievementsWatcher) и разблокирует всё, что уже выполнено —
// ретро-разблокировка работает сама собой: проверки идут по текущему snapshot.

import { store, type QuizLogEntry } from './store';
import { levelForXp } from './levels';
import knowledgeMap from '../data/knowledge-map.json';

type Snapshot = ReturnType<typeof store.snapshot>;

export type AchievementCategory =
  | 'обучение'
  | 'печать'
  | 'git'
  | 'терминал'
  | 'язык'
  | 'блокчейн'
  | 'чемпионат'
  | 'серии'
  | 'треки'
  | 'мастерство'
  | 'вклад'
  | 'пасхалки';

export type AchievementRarity = 'обычное' | 'редкое' | 'эпическое';

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  check: (snap: Snapshot) => boolean;
  /**
   * Сколько уже есть — для ступеней лестниц. Порог берётся из самого id
   * («25-тренажёров» → 25), поэтому здесь только счётчик. Проставляется
   * автоматически ниже, руками у каждой ступени не пишется.
   */
  progress?: (snap: Snapshot) => number;
  /**
   * Скрытое: пока не выдано, страница печатает «???» вместо названия и
   * описания. Нужно, чтобы находка оставалась находкой; на счётчик
   * «столько-то из стольких» скрытые влияют наравне с остальными — иначе
   * витрина врала бы о размере коллекции.
   */
  hidden?: boolean;
};

/**
 * Награда за разблокировку. Раньше достижение не давало ничего, кроме тоста
 * на семь секунд, — коллекционировать было незачем. Числа намеренно скромные:
 * XP за сами дела уже начислен, это добавка, а не вторая экономика. Сумма по
 * всем 110 достижениям — около 2 700 XP при потолке шкалы 17 137.
 */
export const RARITY_XP: Record<AchievementRarity, number> = {
  обычное: 10,
  редкое: 25,
  эпическое: 50,
};

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'обучение',
  'печать',
  'git',
  'терминал',
  'язык',
  'блокчейн',
  'чемпионат',
  'серии',
  'треки',
  'мастерство',
  'вклад',
  'пасхалки',
];

// Порядок показа: сперва категория, внутри неё — от обычного к эпическому.
// В объявлении лестница ломалась у «обучения», «языка» и «серий»: эпическое
// стояло вперемешку с обычным, и сетка читалась как случайная. Сортируем при
// показе, а не перекладываем массив руками: объявления группируются по смыслу.
const RARITY_ORDER: Record<AchievementRarity, number> = { обычное: 0, редкое: 1, эпическое: 2 };

export function sortAchievements(list: Achievement[]): Achievement[] {
  return [...list].sort(
    (a, b) =>
      ACHIEVEMENT_CATEGORIES.indexOf(a.category) - ACHIEVEMENT_CATEGORIES.indexOf(b.category) ||
      RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity],
  );
}

function isPerfect(q: QuizLogEntry): boolean {
  return q.total > 0 && q.correct === q.total;
}

function trailingPerfectQuizStreak(snap: Snapshot): number {
  let streak = 0;
  for (let i = snap.quizLog.length - 1; i >= 0; i -= 1) {
    if (!isPerfect(snap.quizLog[i])) break;
    streak += 1;
  }
  return streak;
}

// --- хелперы по данным store ---

function trainerDone(s: Snapshot, chapterId: string, trainerId: string): boolean {
  return !!s.trainers[chapterId]?.[trainerId];
}

function chapterTrainerCount(s: Snapshot, chapterId: string): number {
  return Object.keys(s.trainers[chapterId] ?? {}).length;
}

// Результаты тренажёров печати: CodeTyping пишет { cpm, accuracy }.
function typingResults(s: Snapshot): { cpm: number; accuracy: number }[] {
  const out: { cpm: number; accuracy: number }[] = [];
  for (const byId of Object.values(s.trainers)) {
    for (const entry of Object.values(byId)) {
      const r = entry.result as { cpm?: unknown; accuracy?: unknown } | undefined;
      if (typeof r?.cpm === 'number' && typeof r?.accuracy === 'number') {
        out.push({ cpm: r.cpm, accuracy: r.accuracy });
      }
    }
  }
  return out;
}

// Главы Фундамента — из карты знаний, чтобы новая глава попадала сюда сама.
const FOUNDATION_IDS = (knowledgeMap as { id: string; path: string }[])
  .filter((e) => e.path.startsWith('foundation/'))
  .map((e) => e.id);

// Экзамены глав и экзамены блоков лежат в одном s.exams: блочные под ключом
// `block:<id>`. Раньше фильтра не было, и «Экзамен на отлично» приходило за
// экзамен по БЛОКУ глав — за то, чего достижение не обещало.
function anyExamRatioAtLeast(s: Snapshot, ratio: number): boolean {
  return Object.entries(s.exams).some(
    ([id, attempts]) =>
      !id.startsWith('block:') && attempts.some((a) => a.total > 0 && a.correct / a.total >= ratio),
  );
}

function anySimRatioAtLeast(s: Snapshot, ratio: number): boolean {
  return Object.values(s.simRuns).some((runs) =>
    runs.some((r) => r.maxScore > 0 && r.score / r.maxScore >= ratio),
  );
}

const DAY_MS = 86400000;

function nextDayKey(k: string): string {
  return new Date(new Date(`${k}T00:00:00Z`).getTime() + DAY_MS).toISOString().slice(0, 10);
}

// Максимальная серия подряд идущих дней вызова дня (по ключам 'YYYY-MM-DD').
function maxDailyStreak(s: Snapshot): number {
  const keys = Object.keys(s.daily).sort();
  let best = 0;
  let cur = 0;
  let prev = '';
  for (const k of keys) {
    cur = prev !== '' && nextDayKey(prev) === k ? cur + 1 : 1;
    if (cur > best) best = cur;
    prev = k;
  }
  return best;
}

// Все временные метки активности: квизы, тренажёры, экзамены, симулятор,
// вызовы дня, избранное. ts везде пишется Date.now() в обработчике события.
function allActivityTs(s: Snapshot): number[] {
  const ts: number[] = [];
  for (const e of s.quizLog) ts.push(e.ts);
  for (const byId of Object.values(s.trainers)) for (const e of Object.values(byId)) ts.push(e.ts);
  for (const attempts of Object.values(s.exams)) for (const a of attempts) ts.push(a.ts);
  for (const runs of Object.values(s.simRuns)) for (const r of runs) ts.push(r.ts);
  for (const d of Object.values(s.daily)) ts.push(d.ts);
  for (const f of s.favorites) ts.push(f.ts);
  return ts;
}

function powDifficulty(s: Snapshot): number {
  const r = s.trainers['what-is-blockchain']?.['trainer-pow-miner']?.result as
    | { difficulty?: unknown }
    | undefined;
  return typeof r?.difficulty === 'number' ? r.difficulty : 0;
}

// --- счётчики для лестниц ---
//
// Лестница считается по РАЗНЫМ сущностям, а не по длине журнала: иначе один
// квиз, пересданный десять раз, закрывал бы ступень «десять квизов».

function trainersDone(s: Snapshot): number {
  let n = 0;
  for (const byId of Object.values(s.trainers)) n += Object.keys(byId).length;
  return n;
}

/** Сколько РАЗНЫХ материалов приняли в каталог. Считаем по множеству id из
 *  меток `ok:<id>`, а не по длине community — там же лежат и метки sub:. */
function acceptedMaterials(s: Snapshot): number {
  const ids = new Set<string>();
  for (const m of s.community) if (m.startsWith('ok:')) ids.add(m.slice(3));
  return ids.size;
}

function perfectQuizIds(s: Snapshot): Set<string> {
  const out = new Set<string>();
  for (const e of s.quizLog) if (isPerfect(e)) out.add(`${e.chapterId}:${e.quizId}`);
  return out;
}

/** Квизы, взятые С ПЕРВОЙ попытки: по первой записи о каждом. */
function firstTryQuizIds(s: Snapshot): Set<string> {
  const seen = new Set<string>();
  const out = new Set<string>();
  for (const e of s.quizLog) {
    const k = `${e.chapterId}:${e.quizId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (isPerfect(e)) out.add(k);
  }
  return out;
}

// Экзамены глав и экзамены блоков лежат в одном s.exams и различаются только
// префиксом ключа. Старое «Экзамен на отлично» этого не знало и засчитывало
// блочный экзамен как экзамен главы.
function chapterExamsPassed(s: Snapshot, ratio = 0.8): number {
  return Object.entries(s.exams).filter(
    ([id, att]) => !id.startsWith('block:') && att.some((a) => a.total > 0 && a.correct / a.total >= ratio),
  ).length;
}

function blockExamsPassed(s: Snapshot, ratio = 0.8): number {
  return Object.entries(s.exams).filter(
    ([id, att]) => id.startsWith('block:') && att.some((a) => a.total > 0 && a.correct / a.total >= ratio),
  ).length;
}

// --- главы до крышки ---
//
// Мера та же, что у сосудов Маршрута (src/lib/chapterFill.ts), но читает
// snapshot, а не store: внутри evaluate() снимок уже на руках. Результат
// кешируется на один проход — шесть достижений подряд спрашивают один и тот
// же список из 137 глав, а evaluate() зовётся на КАЖДОЕ изменение store.

const TOTALS: Record<string, { sections: number; quizzes: number; trainers: number }> = Object.fromEntries(
  (knowledgeMap as { id: string; totals: { sections: number; quizzes: number; trainers: number } }[]).map((e) => [
    e.id,
    e.totals,
  ]),
);

const ALL_IDS = (knowledgeMap as { id: string }[]).map((e) => e.id);

function trackIds(track: string): string[] {
  return (knowledgeMap as { id: string; track: string }[]).filter((e) => e.track === track).map((e) => e.id);
}

function chapterFilled(s: Snapshot, id: string): boolean {
  const t = TOTALS[id];
  if (!t) return false;
  const denom = t.sections + t.quizzes + t.trainers;
  if (denom === 0) return false;
  const sec = (s.sections[id] ?? []).length;
  const qz = Object.values(s.quizzes[id] ?? {}).filter((q) => q.correct === q.total).length;
  const tr = Math.min(Object.keys(s.trainers[id] ?? {}).length, t.trainers);
  return sec + qz + tr >= denom;
}

let fillCache: { key: string; ids: string[] } | null = null;

function filledChapters(s: Snapshot): string[] {
  let sec = 0;
  for (const a of Object.values(s.sections)) sec += a.length;
  const key = `${sec}:${s.quizLog.length}:${trainersDone(s)}`;
  if (fillCache?.key === key) return fillCache.ids;
  const ids = ALL_IDS.filter((id) => chapterFilled(s, id));
  fillCache = { key, ids };
  return ids;
}

// --- время: «когда», а не «сколько» ---

function activityWeekdays(s: Snapshot): Set<number> {
  return new Set(allActivityTs(s).map((ts) => new Date(ts).getDay()));
}

function busiestDayCount(s: Snapshot): number {
  const by: Record<string, number> = {};
  for (const ts of allActivityTs(s)) {
    const d = new Date(ts);
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    by[k] = (by[k] ?? 0) + 1;
  }
  return Math.max(0, ...Object.values(by));
}

function longestGapDays(s: Snapshot): number {
  const ts = allActivityTs(s).sort((a, b) => a - b);
  let gap = 0;
  for (let i = 1; i < ts.length; i += 1) gap = Math.max(gap, (ts[i] - ts[i - 1]) / DAY_MS);
  return gap;
}

export const ACHIEVEMENTS: Achievement[] = [
  // --- обучение ---
  {
    id: 'первая-прочитанная-глава',
    title: 'Первая прочитанная глава',
    desc: 'Прочитана хотя бы одна секция главы',
    icon: '📖',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => Object.keys(s.sections).length >= 1,
  },
  {
    id: 'первый-квиз',
    title: 'Первый квиз',
    desc: 'Пройден первый квиз',
    icon: '📝',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => s.quizLog.length >= 1,
  },
  {
    id: 'квиз-на-100',
    title: 'Квиз на 100%',
    desc: 'Квиз пройден без единой ошибки',
    icon: '💯',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => s.quizLog.some(isPerfect),
  },
  {
    id: 'первый-тренажёр',
    title: 'Первый тренажёр',
    desc: 'Завершён первый тренажёр',
    icon: '🏋️',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => Object.values(s.trainers).some((byId) => Object.keys(byId).length > 0),
  },
  {
    id: '5-в-избранном',
    title: '5 в избранном',
    desc: 'В избранном 5 материалов',
    icon: '⭐',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => s.favorites.length >= 5,
  },
  {
    id: '3-главы',
    title: '3 главы',
    desc: 'Начаты 3 главы',
    icon: '🗺️',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => Object.keys(s.sections).length >= 3,
  },
  {
    id: '100-xp',
    title: '100 XP',
    desc: 'Набрано 100 очков опыта',
    icon: '⚡',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => s.xp >= 100,
  },
  {
    id: '500-xp',
    title: '500 XP',
    desc: 'Набрано 500 очков опыта',
    icon: '🔋',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => s.xp >= 500,
  },
  {
    id: '10-квизов',
    title: 'Десять квизов',
    desc: 'Пройдено 10 квизов',
    icon: '🎓',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => s.quizLog.length >= 10,
  },
  {
    id: 'экзамен-на-отлично',
    title: 'Экзамен на отлично',
    desc: 'Экзамен главы сдан на «Отлично» — 80% и выше',
    icon: '🏅',
    category: 'обучение',
    rarity: 'редкое',
    // Порог — тот же, с которого сам экзамен ставит «Отлично» (PASS_PCT в
    // ChapterExam). При 90% и экзаменах на 6–8 вопросов достижение требовало
    // фактически безошибочной работы (7 из 8 — это 87,5%): студент видел
    // «Отлично», а достижение не приходило.
    check: (s) => anyExamRatioAtLeast(s, 0.8),
  },
  {
    id: 'весь-фундамент',
    title: 'Весь Фундамент',
    desc: 'Начаты все главы трека «Фундамент»',
    icon: '🏛️',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => FOUNDATION_IDS.length > 0 && FOUNDATION_IDS.every((id) => (s.sections[id] ?? []).length > 0),
  },

  // --- печать ---
  {
    id: '80-зн-мин',
    title: '80 зн/мин',
    desc: 'Скорость печати 80 знаков в минуту в тренажёре',
    icon: '⌨️',
    category: 'печать',
    rarity: 'обычное',
    check: (s) => typingResults(s).some((r) => r.cpm >= 80),
  },
  {
    id: '120-зн-мин',
    title: '120 зн/мин',
    desc: 'Скорость печати 120 знаков в минуту в тренажёре',
    icon: '🚀',
    category: 'печать',
    rarity: 'редкое',
    check: (s) => typingResults(s).some((r) => r.cpm >= 120),
  },
  {
    id: 'скорость-чемпионата',
    title: 'Скорость чемпионата',
    desc: 'Скорость печати 150 знаков в минуту в тренажёре',
    icon: '🏎️',
    category: 'печать',
    rarity: 'эпическое',
    check: (s) => typingResults(s).some((r) => r.cpm >= 150),
  },
  {
    id: 'ни-одной-опечатки',
    title: 'Ни одной опечатки',
    desc: 'Тренажёр печати пройден с точностью 100%',
    icon: '🎯',
    category: 'печать',
    rarity: 'редкое',
    check: (s) => typingResults(s).some((r) => r.accuracy >= 100),
  },

  // --- git ---
  {
    id: 'первый-коммит',
    title: 'Первый коммит',
    desc: 'Пройден git-симулятор первого коммита',
    icon: '🌱',
    category: 'git',
    rarity: 'обычное',
    check: (s) => trainerDone(s, 'git-first-commit', 'trainer-gitsim-first-commit'),
  },
  {
    id: 'конфликт-побеждён',
    title: 'Конфликт побеждён',
    desc: 'Разрешён merge-конфликт в git-симуляторе',
    icon: '⚔️',
    category: 'git',
    rarity: 'редкое',
    check: (s) => trainerDone(s, 'git-branches', 'trainer-gitsim-conflict'),
  },
  {
    id: 'ревьюер',
    title: 'Ревьюер',
    desc: 'Пройден тренажёр ревью pull request',
    icon: '🔍',
    category: 'git',
    rarity: 'редкое',
    check: (s) => trainerDone(s, 'git-remote', 'trainer-pr-review'),
  },
  {
    id: 'мастер-веток',
    title: 'Мастер веток',
    desc: 'Пройдены все git-симуляторы главы про ветки: merge, fast-forward и конфликт',
    icon: '🌳',
    category: 'git',
    rarity: 'эпическое',
    check: (s) =>
      trainerDone(s, 'git-branches', 'trainer-gitsim-merge') &&
      trainerDone(s, 'git-branches', 'trainer-gitsim-ff-vs-merge') &&
      trainerDone(s, 'git-branches', 'trainer-gitsim-conflict'),
  },

  // --- терминал ---
  {
    id: 'первая-команда',
    title: 'Первая команда',
    desc: 'Завершён первый тренажёр главы про Linux и терминал',
    icon: '💻',
    category: 'терминал',
    rarity: 'обычное',
    check: (s) => chapterTrainerCount(s, 'linux-terminal') >= 1,
  },
  {
    id: 'строитель-дерева',
    title: 'Строитель дерева',
    desc: 'Пройден квест «Построй дерево проекта» в настоящем терминале',
    icon: '🌲',
    category: 'терминал',
    rarity: 'редкое',
    check: (s) => trainerDone(s, 'linux-terminal', 'trainer-terminal-quest'),
  },
  {
    id: 'права-разгаданы',
    title: 'Права разгаданы',
    desc: 'Пройден квест про права доступа к файлам',
    icon: '🔐',
    category: 'терминал',
    rarity: 'редкое',
    check: (s) => trainerDone(s, 'files-packages-ssh', 'trainer-perm-quest'),
  },
  {
    id: 'терминал-прокачан',
    title: 'Терминал прокачан',
    desc: 'Пройдены все 6 тренажёров главы про Linux и терминал',
    icon: '🧙',
    category: 'терминал',
    rarity: 'эпическое',
    // В главе 03-linux-terminal.mdx ровно 6 тренажёров с trainerId
    // (totalTrainers={6}); порог обязан совпадать, иначе достижение
    // недостижимо. При изменении числа тренажёров в главе — поправить и здесь.
    check: (s) => chapterTrainerCount(s, 'linux-terminal') >= 6,
  },

  // --- язык ---
  {
    id: 'первое-слово',
    title: 'Первое слово',
    desc: 'Первое слово отмечено в тренировке слов',
    icon: '🔤',
    category: 'язык',
    rarity: 'обычное',
    check: (s) => Object.keys(s.wordWeights).length >= 1,
  },
  {
    id: '50-слов',
    title: '50 слов изучено',
    desc: 'В тренировке слов отмечено 50 разных слов',
    icon: '📚',
    category: 'язык',
    rarity: 'редкое',
    check: (s) => Object.keys(s.wordWeights).length >= 50,
  },
  {
    id: 'разбор-ошибок',
    title: 'Разбор ошибок',
    desc: 'Завершён первый тренажёр главы про IT-английский',
    icon: '🧩',
    category: 'язык',
    rarity: 'обычное',
    check: (s) => chapterTrainerCount(s, 'it-english') >= 1,
  },
  {
    id: 'полиглот',
    title: 'Полиглот',
    desc: 'В тренировке слов отмечено 100 разных слов',
    icon: '🌍',
    category: 'язык',
    rarity: 'эпическое',
    check: (s) => Object.keys(s.wordWeights).length >= 100,
  },

  // --- блокчейн ---
  {
    id: 'первый-хеш',
    title: 'Первый хеш',
    desc: 'Испытан лавинный эффект в песочнице SHA-256',
    icon: '#️⃣',
    category: 'блокчейн',
    rarity: 'обычное',
    check: (s) => trainerDone(s, 'what-is-blockchain', 'trainer-hash-playground'),
  },
  {
    id: 'pow-сложность-3',
    title: 'PoW: сложность 3',
    desc: 'В PoW-майнере найден nonce на сложности 3 и выше',
    icon: '⛏️',
    category: 'блокчейн',
    rarity: 'редкое',
    check: (s) => powDifficulty(s) >= 3,
  },
  {
    id: 'цепь-восстановлена',
    title: 'Цепь восстановлена',
    desc: 'Испорченная цепочка блоков починена перемайниванием',
    icon: '🔗',
    category: 'блокчейн',
    rarity: 'редкое',
    check: (s) => trainerDone(s, 'what-is-blockchain', 'trainer-blockchain-demo'),
  },
  {
    id: 'блокчейн-мастер',
    title: 'Блокчейн-мастер',
    desc: 'Пройдены все 7 тренажёров главы «Что такое блокчейн»',
    icon: '🧱',
    category: 'блокчейн',
    rarity: 'эпическое',
    check: (s) => chapterTrainerCount(s, 'what-is-blockchain') >= 7,
  },

  // --- чемпионат ---
  {
    id: 'место-в-лидерборде',
    title: 'Место в лидерборде',
    desc: 'Завершён прогон симулятора чемпионата — результат записан в рекорды',
    icon: '🏁',
    category: 'чемпионат',
    rarity: 'обычное',
    check: (s) => Object.values(s.simRuns).some((runs) => runs.length > 0),
  },
  {
    id: 'половина-критериев',
    title: 'Половина критериев',
    desc: 'В симуляторе набрано 50% максимального балла',
    icon: '⚖️',
    category: 'чемпионат',
    rarity: 'редкое',
    check: (s) => anySimRatioAtLeast(s, 0.5),
  },
  {
    id: 'результат-чемпиона',
    title: 'Результат чемпиона',
    desc: 'В симуляторе набрано 90% максимального балла',
    icon: '🏆',
    category: 'чемпионат',
    rarity: 'эпическое',
    check: (s) => anySimRatioAtLeast(s, 0.9),
  },

  // --- серии ---
  {
    id: 'серия-3-квизов',
    title: 'Серия из 3 квизов',
    desc: '3 квиза подряд без единой ошибки',
    icon: '🔥',
    category: 'серии',
    rarity: 'редкое',
    check: (s) => trailingPerfectQuizStreak(s) >= 3,
  },
  {
    id: 'серия-5-квизов',
    title: 'Серия из 5 квизов',
    desc: '5 квизов подряд без единой ошибки',
    icon: '💥',
    category: 'серии',
    rarity: 'эпическое',
    check: (s) => trailingPerfectQuizStreak(s) >= 5,
  },
  {
    id: 'вызов-дня',
    title: 'Вызов принят',
    desc: 'Пройден первый вызов дня',
    icon: '📅',
    category: 'серии',
    rarity: 'обычное',
    check: (s) => Object.keys(s.daily).length >= 1,
  },
  {
    id: '3-дня-подряд',
    title: '3 дня подряд',
    desc: 'Вызов дня пройден 3 дня подряд',
    icon: '🗓️',
    category: 'серии',
    rarity: 'редкое',
    check: (s) => maxDailyStreak(s) >= 3,
  },
  {
    id: '7-дней-подряд',
    title: '7 дней подряд',
    desc: 'Вызов дня пройден 7 дней подряд',
    icon: '🌟',
    category: 'серии',
    rarity: 'эпическое',
    check: (s) => maxDailyStreak(s) >= 7,
  },
  {
    id: 'полночь',
    title: 'Полночь',
    desc: 'Активность на платформе после полуночи (00:00–04:59)',
    icon: '🌙',
    category: 'серии',
    rarity: 'редкое',
    check: (s) => allActivityTs(s).some((ts) => new Date(ts).getHours() < 5),
  },

  // --- пасхалки ---
  {
    id: 'старая-школа',
    title: 'Старая школа',
    desc: 'Введён конами-код: ↑↑↓↓←→←→BA',
    icon: '🕹️',
    category: 'пасхалки',
    rarity: 'редкое',
    check: (s) => s.easter.konami,
  },
  {
    id: 'археолог',
    title: 'Археолог',
    // Порог 4, а не 5: врезок всего восемь — четыре в фундаменте, три в
    // мобилке, одна в блокчейне. При пороге 5 студент блокчейна обязан был
    // найти ВСЕ доступные ему пять, а студент мобилки — пять из семи. Страж
    // в scripts/history-notes.test.mjs считает врезки по трекам и требует
    // запаса хотя бы в одну: появятся врезки — порог можно поднять.
    desc: 'Открыто 4 исторических врезки «Как это было»',
    icon: '📜',
    category: 'пасхалки',
    rarity: 'редкое',
    check: (s) => s.easter.historyOpened.length >= 4,
  },
  {
    id: 'спидраннер',
    title: 'Спидраннер',
    desc: 'Экзамен главы сдан быстрее половины лимита времени',
    icon: '⏱️',
    category: 'пасхалки',
    rarity: 'эпическое',
    check: (s) => s.easter.speedrun,
  },
  // ===== лестницы, завершающие и «за стиль» (21.09.2026) =====
  // Разобрано по категориям; порядок на странице всё равно задаёт
  // sortAchievements. Мета-достижения стоят В КОНЦЕ массива: они читают
  // s.achievementsUnlocked, а snapshot() отдаёт живой state — значит внутри
  // одного прохода evaluate() считаются только те, что выданы ВЫШЕ.
  {
    id: '25-квизов-без-ошибок',
    title: 'Двадцать пять чистых',
    desc: '25 разных квизов пройдены без единой ошибки',
    icon: '✅',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => perfectQuizIds(s).size >= 25,
  },
  {
    id: '50-квизов-без-ошибок',
    title: 'Полсотни чистых',
    desc: '50 разных квизов пройдены без единой ошибки',
    icon: '🧮',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => perfectQuizIds(s).size >= 50,
  },
  {
    id: '100-квизов-без-ошибок',
    title: 'Сотня чистых',
    desc: '100 разных квизов пройдены без единой ошибки',
    icon: '🎖️',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => perfectQuizIds(s).size >= 100,
  },
  {
    id: '200-квизов-без-ошибок',
    title: 'Двести чистых',
    desc: '200 разных квизов пройдены без единой ошибки',
    icon: '🏵️',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => perfectQuizIds(s).size >= 200,
  },
  {
    id: '10-тренажёров',
    title: 'Десять подходов',
    desc: 'Завершено 10 тренажёров',
    icon: '🥊',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => trainersDone(s) >= 10,
  },
  {
    id: '25-тренажёров',
    title: 'Двадцать пять подходов',
    desc: 'Завершено 25 тренажёров',
    icon: '🏋️‍♂️',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => trainersDone(s) >= 25,
  },
  {
    id: '50-тренажёров',
    title: 'Полсотни подходов',
    desc: 'Завершено 50 тренажёров',
    icon: '💪',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => trainersDone(s) >= 50,
  },
  {
    id: '100-тренажёров',
    title: 'Сто подходов',
    desc: 'Завершено 100 тренажёров',
    icon: '🦾',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => trainersDone(s) >= 100,
  },
  {
    id: 'глава-до-крышки',
    title: 'Глава до крышки',
    desc: 'Одна глава налита целиком: секции, квизы и тренажёры',
    icon: '🥛',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => filledChapters(s).length >= 1,
  },
  {
    id: '5-глав-до-крышки',
    title: 'Пять до крышки',
    desc: '5 глав налиты целиком',
    icon: '🧊',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => filledChapters(s).length >= 5,
  },
  {
    id: '15-глав-до-крышки',
    title: 'Пятнадцать до крышки',
    desc: '15 глав налиты целиком',
    icon: '🏺',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => filledChapters(s).length >= 15,
  },
  {
    id: '40-глав-до-крышки',
    title: 'Сорок до крышки',
    desc: '40 глав налиты целиком',
    icon: '🌊',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => filledChapters(s).length >= 40,
  },
  {
    id: '1000-xp',
    title: 'Тысяча XP',
    desc: 'Набрано 1000 очков опыта',
    icon: '🔌',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => s.xp >= 1000,
  },
  {
    id: '2500-xp',
    title: 'Две с половиной тысячи',
    desc: 'Набрано 2500 очков опыта',
    icon: '🔆',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => s.xp >= 2500,
  },
  {
    id: '5000-xp',
    title: 'Пять тысяч',
    desc: 'Набрано 5000 очков опыта',
    icon: '⚙️',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => s.xp >= 5000,
  },
  {
    id: 'звание-инженер',
    title: 'Инженер',
    desc: 'Взято восьмое звание — «Инженер»',
    icon: '🛠️',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => levelForXp(s.xp).level >= 8,
  },
  {
    id: 'звание-мастер',
    title: 'Мастер',
    desc: 'Взято двенадцатое звание — «Мастер»',
    icon: '🎩',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => levelForXp(s.xp).level >= 12,
  },
  {
    id: 'звание-чемпион',
    title: 'Чемпион',
    desc: 'Взято последнее звание — «Чемпион»',
    icon: '👑',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => levelForXp(s.xp).level >= 15,
  },
  {
    id: '15-в-избранном',
    title: 'Пятнадцать в избранном',
    desc: 'В избранном 15 материалов',
    icon: '📌',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => s.favorites.length >= 15,
  },
  {
    id: '40-в-избранном',
    title: 'Сорок в избранном',
    desc: 'В избранном 40 материалов',
    icon: '🗃️',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => s.favorites.length >= 40,
  },
  {
    id: '100-в-избранном',
    title: 'Сто в избранном',
    desc: 'В избранном 100 материалов',
    icon: '🏛️',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => s.favorites.length >= 100,
  },
  {
    id: 'избранное-из-10-глав',
    title: 'Со всех полок',
    desc: 'В избранном есть материалы из 10 разных глав',
    icon: '🧺',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => new Set(s.favorites.map((f) => f.chapterId)).size >= 10,
  },
  {
    id: '5-экзаменов',
    title: 'Пять экзаменов',
    desc: 'Экзамены пяти глав сданы на «Отлично»',
    icon: '📋',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => chapterExamsPassed(s) >= 5,
  },
  {
    id: '15-экзаменов',
    title: 'Пятнадцать экзаменов',
    desc: 'Экзамены пятнадцати глав сданы на «Отлично»',
    icon: '🗂️',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => chapterExamsPassed(s) >= 15,
  },
  {
    id: '40-экзаменов',
    title: 'Сорок экзаменов',
    desc: 'Экзамены сорока глав сданы на «Отлично»',
    icon: '🎓',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => chapterExamsPassed(s) >= 40,
  },
  {
    id: 'первый-блочный-экзамен',
    title: 'Экзамен блока',
    desc: 'Сдан первый экзамен блока глав',
    icon: '🧱',
    category: 'обучение',
    rarity: 'обычное',
    check: (s) => blockExamsPassed(s) >= 1,
  },
  {
    id: 'половина-блоков',
    title: 'Шесть блоков',
    desc: 'Сданы экзамены шести блоков из двенадцати',
    icon: '🧩',
    category: 'обучение',
    rarity: 'редкое',
    check: (s) => blockExamsPassed(s) >= 6,
  },
  {
    id: 'все-блоки',
    title: 'Все двенадцать блоков',
    desc: 'Сданы экзамены всех двенадцати блоков платформы',
    icon: '🏗️',
    category: 'обучение',
    rarity: 'эпическое',
    check: (s) => blockExamsPassed(s) >= 12,
  },
  {
    id: 'фундамент-до-крышки',
    title: 'Фундамент залит',
    desc: 'Все 10 глав трека «Фундамент» налиты до крышки',
    icon: '🏛️',
    category: 'треки',
    rarity: 'эпическое',
    check: (s) => { const ids = trackIds('foundation'); const full = new Set(filledChapters(s)); return ids.length > 0 && ids.every((id) => full.has(id)); },
  },
  {
    id: 'углубление-до-крышки',
    title: 'Углубление пройдено',
    desc: 'Все 9 глав трека «Углубление» налиты до крышки',
    icon: '🔬',
    category: 'треки',
    rarity: 'эпическое',
    check: (s) => { const ids = trackIds('advanced'); const full = new Set(filledChapters(s)); return ids.length > 0 && ids.every((id) => full.has(id)); },
  },
  {
    id: 'мобилка-10-глав',
    title: 'Десять глав мобилки',
    desc: '10 глав трека «Мобильная разработка» налиты до крышки',
    icon: '📱',
    category: 'треки',
    rarity: 'редкое',
    check: (s) => { const ids = new Set(trackIds('mobile')); return filledChapters(s).filter((id) => ids.has(id)).length >= 10; },
  },
  {
    id: 'блокчейн-10-глав',
    title: 'Десять глав блокчейна',
    desc: '10 глав трека «Блокчейн» налиты до крышки',
    icon: '⛓️',
    category: 'треки',
    rarity: 'редкое',
    check: (s) => { const ids = new Set(trackIds('blockchain')); return filledChapters(s).filter((id) => ids.has(id)).length >= 10; },
  },
  {
    id: 'экскурсия-по-ide',
    title: 'Экскурсия по IDE',
    desc: 'Пройден тур по Android Studio',
    icon: '🧭',
    category: 'треки',
    rarity: 'обычное',
    check: (s) => trainerDone(s, 'android-studio', 'trainer-ide-tour'),
  },
  {
    id: 'первый-экран',
    title: 'Первый экран',
    desc: 'Собран первый экран в предпросмотре Compose',
    icon: '🖼️',
    category: 'треки',
    rarity: 'обычное',
    check: (s) => trainerDone(s, 'first-compose-screen', 'trainer-compose-preview'),
  },
  {
    id: 'рекомпозиция-поймана',
    title: 'Рекомпозиция поймана',
    desc: 'Пройден счётчик рекомпозиций в главе про состояние',
    icon: '🔁',
    category: 'треки',
    rarity: 'редкое',
    check: (s) => trainerDone(s, 'state-events', 'trainer-recomposition-counter'),
  },
  {
    id: 'своя-сеть',
    title: 'Своя сеть',
    desc: 'Поднята нода в симуляторе сети Waves',
    icon: '🛰️',
    category: 'треки',
    rarity: 'редкое',
    check: (s) => trainerDone(s, 'waves-first-network', 'trainer-node-net'),
  },
  {
    id: 'регулярка-приручена',
    title: 'Регулярка приручена',
    desc: 'Пройдены оба тренажёра главы про регулярные выражения',
    icon: '🪤',
    category: 'треки',
    rarity: 'редкое',
    check: (s) => chapterTrainerCount(s, 'grep-regex') >= 2,
  },
  {
    id: 'все-тренажёры-печати',
    title: 'Клавиатура покорена',
    desc: 'Пройдены все 8 тренажёров главы про печать',
    icon: '⌨️',
    category: 'печать',
    rarity: 'эпическое',
    check: (s) => chapterTrainerCount(s, 'typing') >= 8,
  },
  {
    id: 'весь-зал',
    title: 'Весь зал',
    desc: 'Опробованы все механики, запускаемые прямо в Зале',
    icon: '🏟️',
    category: 'мастерство',
    rarity: 'эпическое',
    check: (s) => Object.keys(s.trainers.gym ?? {}).length >= 11,
  },
  {
    id: 'все-модули-симулятора',
    title: 'Семь модулей',
    desc: 'Прогнаны все 7 модулей симулятора чемпионата',
    icon: '🧾',
    category: 'чемпионат',
    rarity: 'редкое',
    check: (s) => Object.keys(s.simRuns).length >= 7,
  },
  {
    id: 'без-перерыва',
    title: 'Без перерыва',
    desc: 'Модуль симулятора пройден на 70% без единого перерыва',
    icon: '⏳',
    category: 'чемпионат',
    rarity: 'редкое',
    check: (s) => Object.values(s.simRuns).some((runs) => runs.some((r) => r.maxScore > 0 && r.score / r.maxScore >= 0.7 && (r.breaks?.count ?? 0) === 0)),
  },
  {
    id: 'отдых-по-графику',
    title: 'Отдых по графику',
    desc: 'Перерыв взят — и модуль всё равно сдан на половину',
    icon: '☕',
    category: 'чемпионат',
    rarity: 'обычное',
    hidden: true,
    check: (s) => Object.values(s.simRuns).some((runs) => runs.some((r) => (r.breaks?.count ?? 0) >= 1 && r.maxScore > 0 && r.score / r.maxScore >= 0.5)),
  },
  {
    id: 'экзамен-без-единой',
    title: 'Без единой ошибки',
    desc: 'Экзамен главы сдан на 100%',
    icon: '🥇',
    category: 'мастерство',
    rarity: 'редкое',
    check: (s) => Object.entries(s.exams).some(([id, att]) => !id.startsWith('block:') && att.some((a) => a.total >= 6 && a.correct === a.total)),
  },
  {
    id: '20-с-первой-попытки',
    title: 'С первой попытки',
    desc: '20 квизов взяты с первой попытки, без пересдач',
    icon: '🎯',
    category: 'мастерство',
    rarity: 'редкое',
    check: (s) => firstTryQuizIds(s).size >= 20,
  },
  {
    id: 'глава-без-ошибок',
    title: 'Глава без единой ошибки',
    desc: 'Все квизы одной главы взяты с первой попытки',
    icon: '🪞',
    category: 'мастерство',
    rarity: 'эпическое',
    check: (s) => { const first = firstTryQuizIds(s); return ALL_IDS.some((id) => { const need = TOTALS[id]?.quizzes ?? 0; if (need === 0) return false; let n = 0; for (const k of first) if (k.startsWith(`${id}:`)) n += 1; return n >= need; }); },
  },
  {
    id: '10-целей-тренажёров',
    title: 'Десять целей',
    desc: 'Десять тренажёров закрыты по цели, а не просто пройдены',
    icon: '🎪',
    category: 'мастерство',
    rarity: 'редкое',
    check: (s) => s.xpAwarded.filter((r) => r.startsWith('trainer-goal:')).length >= 10,
  },
  {
    id: 'быстро-и-чисто',
    title: 'Быстро и чисто',
    desc: '120 знаков в минуту при точности 98% в одном прогоне',
    icon: '🪶',
    category: 'печать',
    rarity: 'эпическое',
    check: (s) => typingResults(s).some((r) => r.cpm >= 120 && r.accuracy >= 98),
  },
  {
    id: 'жаворонок',
    title: 'Жаворонок',
    desc: 'Занятие между 5:00 и 8:00 утра',
    icon: '🌅',
    category: 'серии',
    rarity: 'редкое',
    hidden: true,
    check: (s) => allActivityTs(s).some((ts) => { const h = new Date(ts).getHours(); return h >= 5 && h < 8; }),
  },
  {
    id: 'вся-неделя',
    title: 'Вся неделя',
    desc: 'Занятия были во все семь дней недели',
    icon: '📆',
    category: 'серии',
    rarity: 'редкое',
    check: (s) => activityWeekdays(s).size >= 7,
  },
  {
    id: 'возвращение',
    title: 'Возвращение',
    desc: 'Перерыв больше двух недель — и снова за учёбу',
    icon: '🚪',
    category: 'серии',
    rarity: 'редкое',
    hidden: true,
    check: (s) => longestGapDays(s) >= 14,
  },
  {
    id: 'марафон',
    title: 'Марафон',
    desc: '20 заданий за один день',
    icon: '🏃',
    category: 'серии',
    rarity: 'эпическое',
    check: (s) => busiestDayCount(s) >= 20,
  },
  {
    id: '14-дней-подряд',
    title: 'Две недели подряд',
    desc: 'Вызов дня пройден 14 дней подряд',
    icon: '🌗',
    category: 'серии',
    rarity: 'эпическое',
    check: (s) => maxDailyStreak(s) >= 14,
  },
  {
    id: '30-дней-подряд',
    title: 'Месяц подряд',
    desc: 'Вызов дня пройден 30 дней подряд',
    icon: '🌕',
    category: 'серии',
    rarity: 'эпическое',
    check: (s) => maxDailyStreak(s) >= 30,
  },
  {
    id: '10-вызовов-дня',
    title: 'Десять вызовов',
    desc: 'Пройдено 10 вызовов дня',
    icon: '🗒️',
    category: 'серии',
    rarity: 'обычное',
    check: (s) => Object.keys(s.daily).length >= 10,
  },
  {
    id: '50-вызовов-дня',
    title: 'Полсотни вызовов',
    desc: 'Пройдено 50 вызовов дня',
    icon: '📔',
    category: 'серии',
    rarity: 'редкое',
    check: (s) => Object.keys(s.daily).length >= 50,
  },
  {
    id: '25-слов',
    title: 'Двадцать пять слов',
    desc: 'В тренировке слов отмечено 25 разных слов',
    icon: '🔡',
    category: 'язык',
    rarity: 'обычное',
    check: (s) => Object.keys(s.wordWeights).length >= 25,
  },
  {
    id: 'знаю-с-ходу',
    title: 'Знаю с ходу',
    desc: '30 слов доведены до лёгкого веса — узнаются сразу',
    icon: '🧠',
    category: 'язык',
    rarity: 'редкое',
    check: (s) => Object.values(s.wordWeights).filter((w) => w === 1).length >= 30,
  },
  {
    id: 'первый-свой-набор',
    title: 'Свой набор',
    desc: 'В конструкторе собран первый набор упражнений',
    icon: '🧰',
    category: 'вклад',
    rarity: 'обычное',
    check: (s) => s.customPresets.length >= 1,
  },
  {
    id: '5-своих-наборов',
    title: 'Пять наборов',
    desc: 'В конструкторе собрано 5 наборов',
    icon: '📦',
    category: 'вклад',
    rarity: 'редкое',
    check: (s) => s.customPresets.length >= 5,
  },
  {
    id: '20-своих-наборов',
    title: 'Двадцать наборов',
    desc: 'В конструкторе собрано 20 наборов',
    icon: '🗄️',
    category: 'вклад',
    rarity: 'эпическое',
    check: (s) => s.customPresets.length >= 20,
  },
  {
    id: 'все-четыре-движка',
    title: 'Все четыре движка',
    desc: 'Свои наборы собраны на всех движках конструктора',
    icon: '🎛️',
    category: 'вклад',
    rarity: 'редкое',
    check: (s) => new Set(s.customPresets.map((p) => p.engine)).size >= 4,
  },
  {
    id: 'полный-архив',
    title: 'Полный архив',
    desc: 'Открыты все восемь исторических врезок «Как это было»',
    icon: '🏺',
    category: 'пасхалки',
    rarity: 'эпическое',
    check: (s) => s.easter.historyOpened.length >= 8,
  },
  {
    id: 'упорство',
    title: 'Упорство',
    desc: 'Один и тот же квиз сдавался пять раз — и всё-таки сдан',
    icon: '🪨',
    category: 'пасхалки',
    rarity: 'редкое',
    hidden: true,
    check: (s) => { const by: Record<string, number> = {}; for (const e of s.quizLog) { const k = `${e.chapterId}:${e.quizId}`; by[k] = (by[k] ?? 0) + 1; if (by[k] >= 5 && isPerfect(e)) return true; } return false; },
  },
  {
    id: 'я-сам',
    title: 'Я сам',
    desc: 'Закрыто десять подсказок, ни одной не дочитав',
    icon: '🙈',
    category: 'пасхалки',
    rarity: 'редкое',
    hidden: true,
    check: (s) => s.dismissedHints.length >= 10,
  },
  {
    id: 'поделился',
    title: 'Поделился',
    desc: 'Прислан материал в каталог сообщества',
    icon: '📨',
    category: 'вклад',
    rarity: 'обычное',
    check: (s) => s.community.some((m) => m.startsWith('sub:')),
  },
  {
    id: 'приняли',
    title: 'Приняли',
    desc: 'Материал прошёл проверку и появился в каталоге',
    icon: '🎁',
    category: 'вклад',
    rarity: 'редкое',
    check: (s) => s.community.some((m) => m.startsWith('ok:')),
  },
  // «Поделился»/«Приняли» — это «в первый раз». Дальше — лестница по числу
  // РАЗНЫХ принятых материалов: одна отправка, дважды одобренная задним
  // числом, не должна закрывать ступень выше «одного».
  {
    id: '3-принятых-материалов',
    title: 'Постоянный автор',
    desc: 'Принято 3 разных материала в каталог',
    icon: '🧰',
    category: 'вклад',
    rarity: 'обычное',
    check: (s) => acceptedMaterials(s) >= 3,
  },
  {
    id: '10-принятых-материалов',
    title: 'Опора каталога',
    desc: 'Принято 10 разных материалов в каталог',
    icon: '🏛️',
    category: 'вклад',
    rarity: 'редкое',
    check: (s) => acceptedMaterials(s) >= 10,
  },
  {
    id: '25-принятых-материалов',
    title: 'Легенда каталога',
    desc: 'Принято 25 разных материалов в каталог',
    icon: '👑',
    category: 'вклад',
    rarity: 'эпическое',
    check: (s) => acceptedMaterials(s) >= 25,
  },
  // --- мета: только в самом конце ---
  {
    id: '20-достижений',
    title: 'Двадцать достижений',
    desc: 'Открыто 20 достижений',
    icon: '🎁',
    category: 'мастерство',
    rarity: 'редкое',
    check: (s) => s.achievementsUnlocked.length >= 20,
  },
  {
    id: '40-достижений',
    title: 'Сорок достижений',
    desc: 'Открыто 40 достижений',
    icon: '🏆',
    category: 'мастерство',
    rarity: 'эпическое',
    check: (s) => s.achievementsUnlocked.length >= 40,
  },
  {
    id: 'по-всем-фронтам',
    title: 'По всем фронтам',
    desc: 'Есть хотя бы одно достижение в каждой категории',
    icon: '🧭',
    category: 'мастерство',
    rarity: 'эпическое',
    check: (s) => { const un = new Set(s.achievementsUnlocked); const cats = new Set(ACHIEVEMENTS.filter((a) => a.id !== 'по-всем-фронтам' && un.has(a.id)).map((a) => a.category)); return ACHIEVEMENT_CATEGORIES.every((c) => cats.has(c)); },
  },
];

// ─── Путь к закрытой ступени ──────────────────────────────────────────────
//
// Витрина печатала только условие: «25 тренажёров» и молчание про «у тебя
// 18». К такой награде не идут — её не видно приближающейся. У ступеней
// лестниц порог уже зашит в id, поэтому достаточно СЧЁТЧИКА на семейство:
// семнадцать строк вместо progress у каждой из сорока с лишним ступеней.

const LADDER: Record<string, (s: Snapshot) => number> = {
  'в-избранном': (s) => s.favorites.length,
  главы: (s) => Object.keys(s.sections).length,
  xp: (s) => s.xp,
  квизов: (s) => s.quizLog.length,
  'зн-мин': (s) => Math.max(0, ...typingResults(s).map((r) => r.cpm)),
  слов: (s) => Object.keys(s.wordWeights).length,
  'дня-подряд': (s) => maxDailyStreak(s),
  'дней-подряд': (s) => maxDailyStreak(s),
  'квизов-без-ошибок': (s) => perfectQuizIds(s).size,
  тренажёров: (s) => trainersDone(s),
  'глав-до-крышки': (s) => filledChapters(s).length,
  экзаменов: (s) => chapterExamsPassed(s),
  'с-первой-попытки': (s) => firstTryQuizIds(s).size,
  'целей-тренажёров': (s) => s.xpAwarded.filter((r) => r.startsWith('trainer-goal:')).length,
  'вызовов-дня': (s) => Object.keys(s.daily).length,
  'своих-наборов': (s) => s.customPresets.length,
  достижений: (s) => s.achievementsUnlocked.length,
  'принятых-материалов': acceptedMaterials,
};

/** Порог ступени — из её же id, чтобы число не пришлось дублировать. */
export function stepGoal(id: string): number | null {
  const m = /^(\d+)-/.exec(id);
  return m ? Number(m[1]) : null;
}

for (const a of ACHIEVEMENTS) {
  const m = /^(\d+)-(.+)$/.exec(a.id);
  if (m && LADDER[m[2]]) a.progress = LADDER[m[2]];
}

// Гвард от реентрантности: achievements.unlock() пишет в store, что бьёт
// событием 'change', на которое подписан этот же evaluate() (см.
// AchievementsWatcher) — без гварда один вызов мог бы рекурсивно
// перезапускать сам себя посреди цикла по ACHIEVEMENTS.
let evaluating = false;

export function evaluate(): Achievement[] {
  if (evaluating) return [];
  evaluating = true;
  try {
    const unlocked: Achievement[] = [];
    // Проходов несколько: награда за достижение — это XP, а XP сам по себе
    // открывает достижения («Тысяча XP», «Инженер»), как и число уже
    // открытых («Двадцать достижений»). Один проход оставил бы их до
    // следующего чиха в store. Цикл конечен: каждый следующий круг требует
    // хотя бы одной новой разблокировки, а их всего сто десять.
    for (;;) {
      const snap = store.snapshot();
      const round: Achievement[] = [];
      for (const a of ACHIEVEMENTS) {
        if (store.achievements.isUnlocked(a.id)) continue;
        if (a.check(snap)) {
          store.achievements.unlock(a.id);
          round.push(a);
        }
      }
      if (round.length === 0) break;
      // reason детерминированный — addXp платит за него ровно один раз, так
      // что повторный проход по уже выданному ничего не начислит.
      for (const a of round) store.addXp(RARITY_XP[a.rarity], `ach:${a.id}`);
      unlocked.push(...round);
    }
    return unlocked;
  } finally {
    evaluating = false;
  }
}
