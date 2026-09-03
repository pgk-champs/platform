// Единое хранилище платформы поверх localStorage['pgk-store'].
// SSR-safe: каждый доступ к localStorage в try/catch (private mode, quota,
// отсутствие window при сборке Docusaurus). Подписка на изменения — простой
// EventTarget, чтобы виджеты (через useSyncExternalStore) перерисовывались.

const STORAGE_KEY = 'pgk-store';

export type OsId = 'mac' | 'win' | 'linux';
export type IdeId = 'android-studio' | 'webstorm' | 'vscode';
export type BlockKind = 'trainer' | 'quiz' | 'breakdown' | 'vocab' | 'cheatsheet' | 'fact';

// Содержимое, которое избранное сохраняет вместе со ссылкой, чтобы
// /favorites могла отрендерить сам контент (таблицу, слово), а не только
// заголовок-ссылку на блок в главе. Что не распознано ни под один вариант
// (нет payload или незнакомый kind) — рендерится старым способом: заголовок
// + ссылка-якорь на блок.
export type FavPayload =
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'link'; url: string; desc?: string }
  | { kind: 'word'; term: string; translation: string; note?: string };

export type FavoriteItem = {
  id: string;
  type: BlockKind | 'link' | 'word';
  chapterId: string;
  title: string;
  url?: string;
  data?: FavPayload;
  ts: number;
};

// Пользовательский пресет конструктора тренажёров (/gym, пакет gym-v2):
// данные движка отдельно от самого движка, чтобы наставник мог собрать
// свой набор и запустить/пошарить его без правки глав.
export type CustomPresetData =
  | { engine: 'flashcards'; cards: { term: string; translation: string; note?: string }[] }
  | { engine: 'wordorder'; phrase: string }
  | { engine: 'codetyping'; snippets: string[] }
  | { engine: 'predict'; code: string; expected: string };

export type CustomPreset = { id: string; name: string; ts: number } & CustomPresetData;

export type QuizResult = { correct: number; total: number; ts: number };
export type DailyEntry = { correct: number; total: number; ts: number };
export type ExamResult = { correct: number; total: number; ts: number };
export type SimBreaksLog = { count: number; totalSec: number };
export type SimRunResult = { score: number; maxScore: number; ts: number; breaks?: SimBreaksLog };
export type TrainerResult = { result: unknown; ts: number };
export type QuizLogEntry = { chapterId: string; quizId: string; correct: number; total: number; ts: number };

// Пасхалки (пакет easter-history): конами-код, спидран экзамена и открытые
// исторические врезки «Как это было» — по этим флагам работают достижения
// «Старая школа», «Спидраннер» и «Археолог».
export type EasterState = { konami: boolean; speedrun: boolean; historyOpened: string[] };

type State = {
  sections: Record<string, string[]>;
  quizzes: Record<string, Record<string, QuizResult>>;
  trainers: Record<string, Record<string, TrainerResult>>;
  favorites: FavoriteItem[];
  dismissedHints: string[];
  xp: number;
  /** Уже оплаченные разовые начисления — reason из addXp (см. addXp). */
  xpAwarded: string[];
  achievementsUnlocked: string[];
  prefs: { os?: OsId; name?: string; ide?: IdeId };
  tocCollapsed: Record<string, boolean>;
  quizLog: QuizLogEntry[];
  blocksCollapsed: Record<string, boolean>;
  exams: Record<string, ExamResult[]>;
  wordWeights: Record<string, number>;
  daily: Record<string, DailyEntry>;
  simRuns: Record<string, SimRunResult[]>;
  customPresets: CustomPreset[];
  easter: EasterState;
  toursSeen: string[];
};

function emptyState(): State {
  return {
    sections: {},
    quizzes: {},
    trainers: {},
    favorites: [],
    dismissedHints: [],
    xp: 0,
    xpAwarded: [],
    achievementsUnlocked: [],
    prefs: {},
    tocCollapsed: {},
    quizLog: [],
    blocksCollapsed: {},
    exams: {},
    wordWeights: {},
    daily: {},
    simRuns: {},
    customPresets: [],
    easter: { konami: false, speedrun: false, historyOpened: [] },
    toursSeen: [],
  };
}

// Старые записи главы «GitHub с нуля» писались под id с числовым префиксом,
// а knowledge-map (как и Docusaurus) префикс «00-» срезает — переносим прогресс.
const CHAPTER_ID_RENAMES: Record<string, string> = { '00-github-start': 'github-start' };

// Поля, индексированные chapterId: секции (массив id), квизы и тренажёры
// (карта по id блока), экзамены (массив попыток) и флаг свёрнутого оглавления.
const CHAPTER_KEYED = ['sections', 'quizzes', 'trainers', 'exams', 'tocCollapsed'] as const;

// Старая запись + новая под тем же chapterId: массивы склеиваем (старое
// первым — так порядок попыток экзамена остаётся хронологическим), карты
// сливаем, скаляр (флаг оглавления) берём новый, если он есть.
function mergeChapterValue(old: unknown, current: unknown): unknown {
  if (Array.isArray(old)) return [...new Set([...old, ...(Array.isArray(current) ? current : [])])];
  if (old && typeof old === 'object') return { ...(old as object), ...((current as object) ?? {}) };
  return current ?? old;
}

function migrateChapterIds(st: State): State {
  for (const [from, to] of Object.entries(CHAPTER_ID_RENAMES)) {
    for (const key of CHAPTER_KEYED) {
      const map = st[key] as Record<string, unknown>;
      if (!(from in map)) continue;
      map[to] = mergeChapterValue(map[from], map[to]);
      delete map[from];
    }
    // Свёрнутые блоки ключуются как `${chapterId}:${blockId}` (см. Block.tsx).
    const prefix = `${from}:`;
    for (const key of Object.keys(st.blocksCollapsed)) {
      if (!key.startsWith(prefix)) continue;
      const next = `${to}:${key.slice(prefix.length)}`;
      if (st.blocksCollapsed[next] === undefined) st.blocksCollapsed[next] = st.blocksCollapsed[key];
      delete st.blocksCollapsed[key];
    }
    // Записи, где chapterId — поле: журнал квизов и избранное. У избранного
    // старый chapterId зашит ещё и в id блока — без переноса звёздочка в
    // главе не горит, а на /favorites группа висит под сырым id.
    st.quizLog = st.quizLog.map((e) => (e?.chapterId === from ? { ...e, chapterId: to } : e));
    st.favorites = st.favorites.map((f) =>
      f?.chapterId === from
        ? { ...f, chapterId: to, id: f.id.startsWith(prefix) ? `${to}:${f.id.slice(prefix.length)}` : f.id }
        : f,
    );
  }
  return st;
}

// Форма поля из localStorage против дефолта: массив к массиву, объект к
// объекту, число к числу. Сохранённый JSON — данные пользователя, а не
// гарантия (правка руками, старый формат, оборванная запись), и один null
// вместо массива роняет проверку достижений, а с ней — весь сайт: watcher
// смонтирован в Root на каждой странице.
function sameShape(value: unknown, def: unknown): boolean {
  if (Array.isArray(def)) return Array.isArray(value);
  if (def !== null && typeof def === 'object') {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  return typeof value === typeof def;
}

function loadState(): State {
  try {
    if (typeof localStorage === 'undefined') return emptyState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const st = emptyState();
    for (const key of Object.keys(st) as (keyof State)[]) {
      if (sameShape(parsed[key], st[key])) (st as Record<string, unknown>)[key] = parsed[key];
    }
    // easter — единственный вложенный объект с обязательными полями.
    st.easter = { ...emptyState().easter, ...st.easter };
    if (!Array.isArray(st.easter.historyOpened)) st.easter.historyOpened = [];
    return migrateChapterIds(st);
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
// Стрик-множитель (Duolingo combo-bonus): 1 + min(стрик, 10) × 5%, потолок
// +50%. Считается СТРОГО от вчера назад, не включая сегодня — иначе XP за
// самый первый вызов дня, продлевающий стрик именно сегодня, сам себе же
// поднимал бы множитель (self-reference). addXp вызывается только из
// обработчиков/эффектов на клиенте (как и Date.now() уже везде в этом файле),
// поэтому new Date() здесь не ломает SSR.
const STREAK_MULTIPLIER_CAP_DAYS = 10;
const STREAK_MULTIPLIER_STEP = 0.05;

function streakDaysBeforeToday(): number {
  let key = prevDayKey(new Date().toISOString().slice(0, 10));
  let streak = 0;
  while (state.daily[key]) {
    streak += 1;
    key = prevDayKey(key);
  }
  return streak;
}

function currentXpMultiplier(): number {
  return 1 + Math.min(streakDaysBeforeToday(), STREAK_MULTIPLIER_CAP_DAYS) * STREAK_MULTIPLIER_STEP;
}

// reason — адрес события, за которое платят: 'quiz:глава:квиз',
// 'exam:глава', 'sim:модуль', 'trainer:глава:тренажёр'. За один адрес XP
// начисляется ровно один раз за всю историю: раньше защита от повтора жила
// в useRef компонента и умирала вместе со страницей — квиз, экзамен и
// симулятор фармились обычным F5. Уже накопленный XP не трогаем: список
// оплаченных стартует пустым, так что ничего не сгорает.
function addXp(amount: number, reason: string): void {
  if (!amount) return;
  if (state.xpAwarded.includes(reason)) return;
  state.xpAwarded = [...state.xpAwarded, reason];
  state.xp += Math.round(amount * currentXpMultiplier());
  persist();
}

function getXp(): number {
  return state.xp;
}

function getXpMultiplier(): number {
  return currentXpMultiplier();
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

function setName(name: string): void {
  state.prefs = { ...state.prefs, name };
  persist();
}

function getName(): string | undefined {
  return state.prefs.name;
}

function setIde(ide: IdeId): void {
  state.prefs = { ...state.prefs, ide };
  persist();
}

function getIde(): IdeId | undefined {
  return state.prefs.ide;
}

// --- тренировка слов (простое интервальное повторение) ---
// Вес слова 1..4: чем выше, тем чаще слово попадается. Новое слово — 2,
// «знал» — минус 1, «не знал» — плюс 1.
const WORD_WEIGHT_DEFAULT = 2;
const WORD_WEIGHT_MAX = 4;

function gradeWord(term: string, known: boolean): void {
  const w = state.wordWeights[term] ?? WORD_WEIGHT_DEFAULT;
  const next = known ? Math.max(1, w - 1) : Math.min(WORD_WEIGHT_MAX, w + 1);
  state.wordWeights = { ...state.wordWeights, [term]: next };
  persist();
}

function wordWeight(term: string): number {
  return state.wordWeights[term] ?? WORD_WEIGHT_DEFAULT;
}

// Очередь раунда: слова по убыванию веса (незнакомые — первыми, порядок
// внутри одного веса сохраняется), а слова с весом выше дефолтного идут
// вторым кругом в конец — так «не знал» показываются чаще за раунд.
function wordsQueue(terms: string[]): string[] {
  const sorted = [...terms].sort((a, b) => wordWeight(b) - wordWeight(a));
  const repeats = sorted.filter((t) => wordWeight(t) > WORD_WEIGHT_DEFAULT);
  return [...sorted, ...repeats];
}

// --- collapsible TOC state ---
function setTocCollapsed(chapterId: string, collapsed: boolean): void {
  state.tocCollapsed = { ...state.tocCollapsed, [chapterId]: collapsed };
  persist();
}

function isTocCollapsed(chapterId: string): boolean {
  return state.tocCollapsed[chapterId] ?? false;
}

// --- collapsible block state (per blockId, default expanded) ---
function setBlockCollapsed(blockId: string, collapsed: boolean): void {
  state.blocksCollapsed = { ...state.blocksCollapsed, [blockId]: collapsed };
  persist();
}

function isBlockCollapsed(blockId: string): boolean {
  return state.blocksCollapsed[blockId] ?? false;
}

// --- quiz attempt history (derived from quizLog written by markQuizDone) ---
function quizAttempts(chapterId: string, quizId: string): QuizLogEntry[] {
  return state.quizLog.filter((e) => e.chapterId === chapterId && e.quizId === quizId);
}

function quizStats(chapterId: string, quizId: string) {
  const attempts = quizAttempts(chapterId, quizId);
  let best: QuizLogEntry | undefined;
  for (const a of attempts) {
    if (!best || a.correct > best.correct) best = a;
  }
  let streak = 0;
  for (let i = attempts.length - 1; i >= 0; i -= 1) {
    if (attempts[i].correct !== attempts[i].total) break;
    streak += 1;
  }
  return { attempts, best, count: attempts.length, streak };
}

// --- chapter exams (timed final quiz, retakes allowed) ---
function markExamDone(chapterId: string, score: { correct: number; total: number }): void {
  const attempts = state.exams[chapterId] ?? [];
  state.exams = { ...state.exams, [chapterId]: [...attempts, { ...score, ts: Date.now() }] };
  persist();
}

function getExamStats(chapterId: string) {
  const attempts = state.exams[chapterId] ?? [];
  let best: ExamResult | undefined;
  for (const a of attempts) {
    if (!best || a.correct > best.correct) best = a;
  }
  return { attempts, best, count: attempts.length };
}

// --- daily challenge ---
// dateKey — 'YYYY-MM-DD' (new Date().toISOString().slice(0, 10)); дату считает
// вызывающий код в обработчике/эффекте, поэтому store остаётся SSR-safe.
const DAY_MS = 86400000;

function prevDayKey(dateKey: string): string {
  return new Date(new Date(`${dateKey}T00:00:00Z`).getTime() - DAY_MS).toISOString().slice(0, 10);
}

// Вехи-сундучки: разовый бонус XP за серию вызовов дня — 7 и 30 дней подряд.
// Срабатывает ровно один раз за каждый заход серии в эту длину (стрик,
// оборвавшись и набравшись заново, снова пройдёт через 7 — это честно).
const STREAK_MILESTONE_XP: Record<number, number> = { 7: 50, 30: 200 };

/** Записывает прохождение вызова дня. Второй раз за тот же день — false. */
function completeDaily(dateKey: string, score: { correct: number; total: number }): boolean {
  if (state.daily[dateKey]) return false;
  state.daily = { ...state.daily, [dateKey]: { ...score, ts: Date.now() } };
  persist();
  const streak = dailyState(dateKey).streak;
  const bonus = STREAK_MILESTONE_XP[streak];
  // Дата в reason — потому что addXp платит за адрес один раз, а веха
  // честно повторяется: оборвал серию, набрал заново — снова заслужил.
  if (bonus) addXp(bonus, `streak-milestone:${streak}:${dateKey}`);
  return true;
}

/**
 * Состояние вызова дня на дату todayKey: пройден ли сегодня, результат
 * и серия подряд идущих дней. Если сегодня ещё не пройден, серия
 * считается от вчера — день ещё не потерян.
 */
function dailyState(todayKey: string): { done: boolean; today?: DailyEntry; streak: number } {
  const today = state.daily[todayKey];
  let key = today ? todayKey : prevDayKey(todayKey);
  let streak = 0;
  while (state.daily[key]) {
    streak += 1;
    key = prevDayKey(key);
  }
  return { done: !!today, today, streak };
}

// --- симулятор чемпионата (тайм-боксед прогон модуля критериев) ---
function addSimRun(moduleId: string, score: { score: number; maxScore: number; breaks?: SimBreaksLog }): void {
  const runs = state.simRuns[moduleId] ?? [];
  state.simRuns = { ...state.simRuns, [moduleId]: [...runs, { ...score, ts: Date.now() }] };
  persist();
}

function getSimStats(moduleId: string) {
  const runs = state.simRuns[moduleId] ?? [];
  let best: SimRunResult | undefined;
  for (const r of runs) {
    if (!best || r.score > best.score) best = r;
  }
  return { runs, best, count: runs.length };
}

// --- пользовательские пресеты конструктора тренажёров (/gym) ---
function customPresetAdd(preset: Omit<CustomPreset, 'id' | 'ts'>): CustomPreset {
  const item = {
    ...preset,
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
  } as CustomPreset;
  state.customPresets = [...state.customPresets, item];
  persist();
  return item;
}

function customPresetList(): CustomPreset[] {
  return state.customPresets;
}

function customPresetRemove(id: string): void {
  if (!state.customPresets.some((p) => p.id === id)) return;
  state.customPresets = state.customPresets.filter((p) => p.id !== id);
  persist();
}

// --- пасхалки (пакет easter-history) ---
function easterMarkKonami(): void {
  if (state.easter.konami) return;
  state.easter = { ...state.easter, konami: true };
  persist();
}

function easterMarkSpeedrun(): void {
  if (state.easter.speedrun) return;
  state.easter = { ...state.easter, speedrun: true };
  persist();
}

/** Отмечает открытие исторической врезки; повторное открытие не дублируется. */
function easterOpenHistory(id: string): void {
  if (state.easter.historyOpened.includes(id)) return;
  state.easter = { ...state.easter, historyOpened: [...state.easter.historyOpened, id] };
  persist();
}

// --- онбординг-тур (Driver.js): показывается один раз на весь сайт ---
function markTourSeen(id: string): void {
  if (state.toursSeen.includes(id)) return;
  state.toursSeen = [...state.toursSeen, id];
  persist();
}

function isTourSeen(id: string): boolean {
  return state.toursSeen.includes(id);
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
  getXpMultiplier,
  achievements: { unlock: achUnlock, list: achList, isUnlocked: achIsUnlocked },
  prefs: { setOs, getOs, setName, getName, setIde, getIde },
  words: { queue: wordsQueue, grade: gradeWord, weight: wordWeight },
  toc: { setCollapsed: setTocCollapsed, isCollapsed: isTocCollapsed },
  block: { setCollapsed: setBlockCollapsed, isCollapsed: isBlockCollapsed },
  quiz: { attempts: quizAttempts, stats: quizStats },
  markExamDone,
  getExamStats,
  completeDaily,
  dailyState,
  sim: { addRun: addSimRun, stats: getSimStats },
  customPresets: { add: customPresetAdd, list: customPresetList, remove: customPresetRemove },
  easter: { markKonami: easterMarkKonami, markSpeedrun: easterMarkSpeedrun, openHistory: easterOpenHistory },
  tour: { markSeen: markTourSeen, isSeen: isTourSeen },
  snapshot,
  /** Тестовый хелпер: перечитывает состояние из localStorage (как при загрузке страницы). */
  __reloadForTests(): void {
    state = loadState();
    version += 1;
  },
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
