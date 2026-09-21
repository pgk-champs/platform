// Слияние прогресса двух устройств «по лучшему»: ученик мог заниматься и на
// ноутбуке, и на телефоне до входа — при синхронизации ни одна попытка не
// должна потеряться. Та же семантика используется на клиенте, поэтому логика
// вынесена отдельным чистым модулем и покрыта тестом.

const uniq = (a) => [...new Set(a)];
// Плоский объект-карта: всё, что не такой объект (строка, число, массив, null),
// в слиянии считаем пустой картой — иначе Object.keys("bad") даёт индексы букв.
const obj = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});

/** Объединяет два массива строк без потерь и без дублей. */
function mergeArray(a, b) {
  return uniq([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]);
}

/** Для карт «глава → массив» объединяет массивы по каждому ключу. */
function mergeMapOfArrays(a = {}, b = {}) {
  a = obj(a); b = obj(b);
  const out = {};
  for (const k of uniq([...Object.keys(a), ...Object.keys(b)])) {
    out[k] = mergeArray(a[k], b[k]);
  }
  return out;
}

/** Для вложенных карт «глава → {id → результат}» берёт по каждому id лучший
 *  результат через переданную функцию сравнения. */
function mergeMapOfRecords(a = {}, b = {}, pickBetter) {
  a = obj(a); b = obj(b);
  const out = {};
  for (const k of uniq([...Object.keys(a), ...Object.keys(b)])) {
    const ra = a[k] || {};
    const rb = b[k] || {};
    const rec = {};
    for (const id of uniq([...Object.keys(ra), ...Object.keys(rb)])) {
      rec[id] = id in ra && id in rb ? pickBetter(ra[id], rb[id]) : (ra[id] ?? rb[id]);
    }
    out[k] = rec;
  }
  return out;
}

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : 0);

/**
 * Сливает две снимка прогресса. Результат не хуже каждого из входов:
 * прочитанные секции и достижения — объединение, очки/уровень — максимум,
 * попытки квизов/экзаменов — с наибольшим результатом.
 */
export function mergeProgress(a = {}, b = {}) {
  a = a && typeof a === 'object' ? a : {};
  b = b && typeof b === 'object' ? b : {};
  const betterByCorrect = (x, y) => (num(y.correct) > num(x.correct) ? y : x);
  const betterByTs = (x, y) => (num(y.ts) >= num(x.ts) ? { ...x, ...y } : { ...y, ...x });

  // Формы полей — как в src/lib/store.ts. simRuns и daily это КАРТЫ, а не
  // плоские структуры; xpAwarded и dismissedHints — массивы, которые тоже надо
  // объединять, иначе после входа очки начислятся заново.
  const betterByEntry = (x, y) => (num(y.correct) > num(x.correct) ? y : x);
  // Надгробия: что студент убрал руками и когда. Без них слияние — чистое
  // объединение, и снятая звёздочка возвращалась через пять секунд после
  // автосинка. Молча, и так каждый раз. Дата обязательна: надгробие живёт на
  // сервере, и без сравнения по времени оно запрещало бы добавить то же
  // самое заново навсегда. Побеждает более поздняя правка.
  const removed = tombstones(a.removed, b.removed);

  return {
    ...a,
    ...b,
    sections: mergeMapOfArrays(a.sections, b.sections),
    quizzes: mergeMapOfRecords(a.quizzes, b.quizzes, betterByCorrect),
    trainers: mergeMapOfRecords(a.trainers, b.trainers, betterByTs),
    exams: mergeMapOfArraysBest(a.exams, b.exams),
    simRuns: mergeMapOfArraysBest(a.simRuns, b.simRuns),
    daily: mergeMapOfEntries(a.daily, b.daily, betterByEntry),
    favorites: mergeFavorites(a.favorites, b.favorites, removed),
    achievementsUnlocked: mergeArray(a.achievementsUnlocked, b.achievementsUnlocked),
    dismissedHints: mergeArray(a.dismissedHints, b.dismissedHints),
    xpAwarded: mergeArray(a.xpAwarded, b.xpAwarded),
    xp: Math.max(num(a.xp), num(b.xp)),
    quizLog: dedupeLog([...(Array.isArray(a.quizLog) ? a.quizLog : []), ...(Array.isArray(b.quizLog) ? b.quizLog : [])]),
    wordWeights: mergeWordWeights(a.wordWeights, b.wordWeights),
    tocCollapsed: { ...obj(a.tocCollapsed), ...obj(b.tocCollapsed) },
    blocksCollapsed: { ...obj(a.blocksCollapsed), ...obj(b.blocksCollapsed) },
    prefs: { ...obj(a.prefs), ...obj(b.prefs) },
    customPresets: mergePresets(a.customPresets, b.customPresets, removed),
    removed: [...removed.entries()].map(([id, ts]) => ({ id, ts })).slice(-500),
    easter: mergeEaster(a.easter, b.easter),
    toursSeen: mergeArray(a.toursSeen, b.toursSeen),
  };
}

// Карта «ключ → одна запись»: по каждому ключу берём лучшую через pickBetter.
function mergeMapOfEntries(a, b, pickBetter) {
  a = obj(a);
  b = obj(b);
  const out = {};
  for (const k of uniq([...Object.keys(a), ...Object.keys(b)])) {
    out[k] = k in a && k in b ? pickBetter(a[k], b[k]) : (a[k] ?? b[k]);
  }
  return out;
}

// Экзамены — карта «глава → массив попыток»; храним все попытки обоих устройств.
function mergeMapOfArraysBest(a = {}, b = {}) {
  a = obj(a); b = obj(b);
  const out = {};
  for (const k of uniq([...Object.keys(a), ...Object.keys(b)])) {
    out[k] = [...(Array.isArray(a[k]) ? a[k] : []), ...(Array.isArray(b[k]) ? b[k] : [])];
  }
  return out;
}

// Избранное — массив объектов; ключ уникальности — chapterId+blockId (или id).
/** id → время удаления; из двух надгробий одного id берём позднее. */
function tombstones(a = [], b = []) {
  const out = new Map();
  for (const r of [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]) {
    if (!r || typeof r.id !== 'string') continue;
    const ts = num(r.ts);
    if (!out.has(r.id) || out.get(r.id) < ts) out.set(r.id, ts);
  }
  return out;
}

/** Убрано ли позже, чем добавлено. Без ts у записи считаем, что раньше. */
function killed(removed, key, item) {
  const at = removed.get(key);
  return at !== undefined && at >= num(item && item.ts);
}

function mergeFavorites(a = [], b = [], removed = new Map()) {
  const seen = new Map();
  for (const f of [...(a || []), ...(b || [])]) {
    const key = f && (f.id ?? `${f.chapterId}:${f.blockId}`);
    if (key != null && !seen.has(key) && !killed(removed, key, f)) seen.set(key, f);
  }
  return [...seen.values()];
}

function mergeWordWeights(a = {}, b = {}) {
  const out = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) out[k] = Math.max(num(out[k]), num(v));
  return out;
}


function mergePresets(a = [], b = [], removed = new Map()) {
  const seen = new Map();
  for (const p of [...(a || []), ...(b || [])]) {
    const key = p && (p.id ?? JSON.stringify(p));
    if (key != null && !seen.has(key) && !killed(removed, key, p)) seen.set(key, p);
  }
  return [...seen.values()];
}

function mergeEaster(a = {}, b = {}) {
  a = a || {};
  b = b || {};
  return {
    konami: !!(a.konami || b.konami),
    speedrun: !!(a.speedrun || b.speedrun),
    historyOpened: mergeArray(a.historyOpened, b.historyOpened),
  };
}

// Логи попыток: склеиваем и убираем полные дубли по метке времени + телу.
function dedupeLog(list) {
  const seen = new Set();
  const out = [];
  for (const e of list) {
    const key = JSON.stringify(e);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  }
  return out;
}
