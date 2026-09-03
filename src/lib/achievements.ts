// Реестр достижений платформы. evaluate() вызывается после изменений в
// store (см. AchievementsWatcher) и разблокирует всё, что уже выполнено —
// ретро-разблокировка работает сама собой: проверки идут по текущему snapshot.

import { store, type QuizLogEntry } from './store';
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
  'пасхалки',
];

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

function anyExamRatioAtLeast(s: Snapshot, ratio: number): boolean {
  return Object.values(s.exams).some((attempts) =>
    attempts.some((a) => a.total > 0 && a.correct / a.total >= ratio),
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
    // В главе 6 тренажёров (totalTrainers={6} в 03-linux-terminal.mdx):
    // с порогом 4 «эпическое» достижение выдавалось за две трети главы.
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
    desc: 'Открыто 5 исторических врезок «Как это было»',
    icon: '📜',
    category: 'пасхалки',
    rarity: 'редкое',
    check: (s) => s.easter.historyOpened.length >= 5,
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
];

// Гвард от реентрантности: achievements.unlock() пишет в store, что бьёт
// событием 'change', на которое подписан этот же evaluate() (см.
// AchievementsWatcher) — без гварда один вызов мог бы рекурсивно
// перезапускать сам себя посреди цикла по ACHIEVEMENTS.
let evaluating = false;

export function evaluate(): Achievement[] {
  if (evaluating) return [];
  evaluating = true;
  try {
    const snap = store.snapshot();
    const unlocked: Achievement[] = [];
    for (const a of ACHIEVEMENTS) {
      if (store.achievements.isUnlocked(a.id)) continue;
      if (a.check(snap)) {
        store.achievements.unlock(a.id);
        unlocked.push(a);
      }
    }
    return unlocked;
  } finally {
    evaluating = false;
  }
}
