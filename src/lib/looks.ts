// Только тип: без рантайм-импорта store может импортировать ЭТОТ модуль за
// списком обликов, и кольца зависимостей не возникает.
import type { store } from './store';

// Облики — награда, которая НЕ заводит второй шкалы.
//
// Каждый облик висит на уже существующем достижении: он не новая цель, а
// подпись под старой. Отсюда три следствия, ради которых всё и сделано:
//
// 1. Ничего не «покупается». Валюты нет, магазина нет, копить не надо —
//    иначе появился бы второй повод соревноваться, причём за объём, а не за
//    качество (достижения-то как раз проверяют качество: безошибочно, с
//    первой попытки, 0.8 на экзамене).
// 2. Факт разблокировки НИГДЕ не хранится — он ВЫЧИСЛЯЕТСЯ. Это не экономия
//    кода: prefs сливается на сервере поверхностно (server/merge.mjs), по
//    ключу побеждает последняя синхронизация, отката нет. Флаг «открыто» там
//    можно потерять, а достижение — нет.
// 3. В хранилище едет ровно одно новое подполе prefs (seal), и то, что уже
//    было (skin). Оба проверяются белым списком на ЧТЕНИИ.
//
// Виден должен быть и ПУТЬ к закрытому облику: «18 из 25» двигает, а голое
// «25 тренажёров» — нет. Поэтому у каждого облика есть progress().

type Snapshot = ReturnType<typeof store.snapshot>;

export type LookProgress = { now: number; need: number; unit: string };

export type Look = {
  /** Он же значение data-skin: правила лежат в vessels.css. */
  id: string;
  name: string;
  /** Что этот облик говорит о своём носителе. */
  tells: string;
  /** Достижение, на котором он висит. null — дан сразу и всем. */
  achievement: string | null;
  /** Путь к нему, чтобы закрытое не молчало. */
  progress?: (s: Snapshot) => LookProgress;
};

const DAY = 86400000;

/** Сколько тренажёров главы пройдено (мера та же, что у достижения). */
function trainersOf(s: Snapshot, chapterId: string): number {
  return Object.keys(s.trainers[chapterId] ?? {}).length;
}

/** Самая длинная серия вызова дня — по тем же ключам-датам, что и достижение. */
function bestStreak(s: Snapshot): number {
  const days = Object.keys(s.daily).sort();
  let best = 0;
  let run = 0;
  let prev = 0;
  for (const d of days) {
    const t = Date.parse(`${d}T00:00:00`);
    run = prev && t - prev <= DAY * 1.5 ? run + 1 : 1;
    prev = t;
    if (run > best) best = run;
  }
  return best;
}

export const LOOKS: Look[] = [
  { id: 'classic', name: 'Без темы', tells: 'Как задумано', achievement: null },
  { id: 'cola', name: 'Кола', tells: 'Просто нравится', achievement: null },
  { id: 'energy', name: 'Энергетик', tells: 'Просто нравится', achievement: null },
  {
    id: 'terminal',
    name: 'Терминал',
    tells: 'Ты прошёл все тренажёры главы про Linux',
    achievement: 'терминал-прокачан',
    progress: (s) => ({ now: trainersOf(s, 'linux-terminal'), need: 6, unit: 'тренажёров главы' }),
  },
  {
    id: 'chain',
    name: 'Цепь',
    tells: 'Ты прошёл все тренажёры главы про блокчейн',
    achievement: 'блокчейн-мастер',
    progress: (s) => ({ now: trainersOf(s, 'what-is-blockchain'), need: 7, unit: 'тренажёров главы' }),
  },
  {
    id: 'paper',
    name: 'Пергамент',
    tells: 'Ты читаешь исторические врезки, а не пролистываешь',
    achievement: 'археолог',
    progress: (s) => ({ now: s.easter.historyOpened.length, need: 4, unit: 'врезок «Как это было»' }),
  },
  {
    id: 'fire',
    name: 'Огонь',
    tells: 'Ты заходил тридцать дней подряд',
    achievement: '30-дней-подряд',
    progress: (s) => ({ now: bestStreak(s), need: 30, unit: 'дней подряд' }),
  },
  {
    id: 'champion',
    name: 'Чемпион',
    tells: 'Пятнадцатое звание — выше некуда',
    achievement: 'звание-чемпион',
    progress: (s) => ({ now: s.xp, need: 17117, unit: 'XP' }),
  },
];

export const LOOK_IDS = LOOKS.map((l) => l.id);

export function lookById(id: string): Look | undefined {
  return LOOKS.find((l) => l.id === id);
}

/** Открыт ли облик: по выданным достижениям, а не по флагу в хранилище. */
export function lookOpen(look: Look, unlocked: readonly string[]): boolean {
  return look.achievement === null || unlocked.includes(look.achievement);
}

export type LookState = Look & { open: boolean; at: LookProgress | null };

export function looksWithState(s: Snapshot): LookState[] {
  const unlocked = s.achievementsUnlocked;
  return LOOKS.map((l) => ({
    ...l,
    open: lookOpen(l, unlocked),
    at: l.progress ? l.progress(s) : null,
  }));
}

/**
 * Какой облик применять на самом деле. Выбранный, но ещё (или уже) не
 * открытый, молча откатывается: значение в localStorage — данные
 * пользователя, а не гарантия, и достижение может быть сброшено.
 */
export function effectiveLook(chosen: string | undefined, unlocked: readonly string[]): string {
  const l = chosen ? lookById(chosen) : undefined;
  return l && lookOpen(l, unlocked) ? l.id : 'classic';
}
