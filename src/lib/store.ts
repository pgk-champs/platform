// Единое хранилище платформы поверх localStorage['pgk-store'].
// SSR-safe: каждый доступ к localStorage в try/catch (private mode, quota,
// отсутствие window при сборке Docusaurus). Подписка на изменения — простой
// EventTarget, чтобы виджеты (через useSyncExternalStore) перерисовывались.

const STORAGE_KEY = 'pgk-store';

export type OsId = 'mac' | 'win' | 'linux';
export type BlockKind = 'trainer' | 'quiz' | 'breakdown' | 'vocab' | 'cheatsheet' | 'fact';

export type FavoriteItem = {
  id: string;
  type: BlockKind | 'link' | 'word';
  chapterId: string;
  title: string;
  url?: string;
  data?: unknown;
  ts: number;
};

export type QuizResult = { correct: number; total: number; ts: number };
export type TrainerResult = { result: unknown; ts: number };
export type QuizLogEntry = { chapterId: string; quizId: string; correct: number; total: number; ts: number };

type State = {
  sections: Record<string, string[]>;
  quizzes: Record<string, Record<string, QuizResult>>;
  trainers: Record<string, Record<string, TrainerResult>>;
  favorites: FavoriteItem[];
  dismissedHints: string[];
  xp: number;
  achievementsUnlocked: string[];
  prefs: { os?: OsId };
  tocCollapsed: Record<string, boolean>;
  quizLog: QuizLogEntry[];
};

function emptyState(): State {
  return {
    sections: {},
    quizzes: {},
    trainers: {},
    favorites: [],
    dismissedHints: [],
    xp: 0,
    achievementsUnlocked: [],
    prefs: {},
    tocCollapsed: {},
    quizLog: [],
  };
}

function loadState(): State {
  try {
    if (typeof localStorage === 'undefined') return emptyState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

let state = loadState();
let version = 0;
const bus = typeof EventTarget !== 'undefined' ? new EventTarget() : null;

function persist(): void {
  version += 1;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore: private mode / quota / SSR
  }
  bus?.dispatchEvent(new Event('change'));
}

function subscribe(cb: () => void): () => void {
  if (!bus) return () => {};
  bus.addEventListener('change', cb);
  return () => bus.removeEventListener('change', cb);
}

function getVersion(): number {
  return version;
}

// --- sections ---
function setSectionRead(chapterId: string, sectionId: string): void {
  const list = state.sections[chapterId] ?? [];
  if (!list.includes(sectionId)) {
    state.sections = { ...state.sections, [chapterId]: [...list, sectionId] };
    persist();
  }
}

function isSectionRead(chapterId: string, sectionId: string): boolean {
  return !!state.sections[chapterId]?.includes(sectionId);
}

// --- quizzes ---
function markQuizDone(chapterId: string, quizId: string, score: { correct: number; total: number }): void {
  const ts = Date.now();
  const chapterQuizzes = state.quizzes[chapterId] ?? {};
  state.quizzes = { ...state.quizzes, [chapterId]: { ...chapterQuizzes, [quizId]: { ...score, ts } } };
  state.quizLog = [...state.quizLog, { chapterId, quizId, ...score, ts }];
  persist();
}

// --- trainers ---
function markTrainerDone(chapterId: string, trainerId: string, result: unknown): void {
  const chapterTrainers = state.trainers[chapterId] ?? {};
  state.trainers = {
    ...state.trainers,
    [chapterId]: { ...chapterTrainers, [trainerId]: { result, ts: Date.now() } },
  };
  persist();
}

// --- favorites ---
function favAdd(item: Omit<FavoriteItem, 'ts'>): void {
  if (state.favorites.some((f) => f.id === item.id)) return;
  state.favorites = [...state.favorites, { ...item, ts: Date.now() }];
  persist();
}

function favRemove(id: string): void {
  if (!state.favorites.some((f) => f.id === id)) return;
  state.favorites = state.favorites.filter((f) => f.id !== id);
  persist();
}

function favList(filter?: { type?: FavoriteItem['type']; chapterId?: string }): FavoriteItem[] {
  return state.favorites.filter(
    (f) => (!filter?.type || f.type === filter.type) && (!filter?.chapterId || f.chapterId === filter.chapterId),
  );
}

function favIsFavorite(id: string): boolean {
  return state.favorites.some((f) => f.id === id);
}

// --- hints ---
function dismissHint(hintId: string): void {
  if (!state.dismissedHints.includes(hintId)) {
    state.dismissedHints = [...state.dismissedHints, hintId];
    persist();
  }
}

function isHintDismissed(hintId: string): boolean {
  return state.dismissedHints.includes(hintId);
}

// --- xp ---
function addXp(amount: number, reason: string): void {
  if (!amount) return;
  state.xp += amount;
  persist();
  // ponytail: причина пока не логируется отдельным списком — незачем, пока
  // никто её не читает; добавить xpLog, когда появится отчёт/лента событий.
  void reason;
}

function getXp(): number {
  return state.xp;
}

// --- achievements ---
function achUnlock(id: string): boolean {
  if (state.achievementsUnlocked.includes(id)) return false;
  state.achievementsUnlocked = [...state.achievementsUnlocked, id];
  persist();
  return true;
}

function achList(): string[] {
  return state.achievementsUnlocked;
}

function achIsUnlocked(id: string): boolean {
  return state.achievementsUnlocked.includes(id);
}

// --- prefs ---
function setOs(os: OsId): void {
  state.prefs = { ...state.prefs, os };
  persist();
}

function getOs(): OsId | undefined {
  return state.prefs.os;
}

// --- collapsible TOC state ---
function setTocCollapsed(chapterId: string, collapsed: boolean): void {
  state.tocCollapsed = { ...state.tocCollapsed, [chapterId]: collapsed };
  persist();
}

function isTocCollapsed(chapterId: string): boolean {
  return state.tocCollapsed[chapterId] ?? false;
}

// --- progress / snapshot ---
function getProgress() {
  return { sections: state.sections, quizzes: state.quizzes, trainers: state.trainers };
}

function snapshot(): Readonly<State> {
  return state;
}

export const store = {
  subscribe,
  getVersion,
  getProgress,
  setSectionRead,
  isSectionRead,
  markQuizDone,
  markTrainerDone,
  favorites: { add: favAdd, remove: favRemove, list: favList, isFavorite: favIsFavorite },
  dismissHint,
  isHintDismissed,
  addXp,
  getXp,
  achievements: { unlock: achUnlock, list: achList, isUnlocked: achIsUnlocked },
  prefs: { setOs, getOs },
  toc: { setCollapsed: setTocCollapsed, isCollapsed: isTocCollapsed },
  snapshot,
  /** Тестовый хелпер: сбрасывает состояние в памяти и в localStorage. */
  __resetForTests(): void {
    state = emptyState();
    version = 0;
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
