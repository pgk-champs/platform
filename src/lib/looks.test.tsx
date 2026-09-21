import { store } from './store';
import { LOOKS, LOOK_IDS, effectiveLook, looksWithState, lookOpen } from './looks';
import { ACHIEVEMENTS, evaluate } from './achievements';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('каждый облик висит на существующем достижении', () => {
  // Опечатка в id означала бы облик, который нельзя открыть никогда, и
  // молчаливо: проверка просто не найдёт его в списке выданных.
  const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
  for (const l of LOOKS) {
    if (l.achievement) expect(ids.has(l.achievement)).toBe(true);
  }
  expect(LOOKS.filter((l) => l.achievement === null)).toHaveLength(3);
});

test('у каждого заслуженного облика есть видимый путь', () => {
  // «25 тренажёров» без «у тебя 18» не двигает — к такой награде не идут.
  for (const l of LOOKS) {
    if (!l.achievement) continue;
    expect(l.progress, `${l.id}: нет прогресса`).toBeTruthy();
    const at = l.progress!(store.snapshot());
    expect(at.need).toBeGreaterThan(0);
    expect(at.unit.length).toBeGreaterThanOrEqual(2); // «XP» короче прочих
  }
});

test('путь доходит ровно туда, где выдают достижение', () => {
  // Если мера облика разойдётся с мерой достижения, полоса будет врать:
  // «6 из 6», а облик закрыт. Проверяем на настоящем прохождении.
  for (const t of ['trainer-fs-tree', 'trainer-mini-fm', 'trainer-chmod', 'trainer-nano', 'trainer-perm', 'trainer-git-status']) {
    store.markTrainerDone('linux-terminal', t, { ok: true });
  }
  const at = LOOKS.find((l) => l.id === 'terminal')!.progress!(store.snapshot());
  expect(at.now).toBeGreaterThanOrEqual(at.need);
  evaluate();
  expect(lookOpen(LOOKS.find((l) => l.id === 'terminal')!, store.achievements.list())).toBe(true);
});

test('невыданный облик не применяется, даже если выбран', () => {
  // Значение в localStorage — данные пользователя, а не гарантия.
  expect(effectiveLook('champion', [])).toBe('classic');
  expect(effectiveLook('champion', ['звание-чемпион'])).toBe('champion');
  expect(effectiveLook('выдуманный', [])).toBe('classic');
  expect(effectiveLook(undefined, [])).toBe('classic');
  expect(effectiveLook('cola', [])).toBe('cola');
});

test('store знает все облики и отбрасывает чужие', () => {
  for (const id of LOOK_IDS) {
    store.prefs.setSkin(id);
    expect(store.prefs.getSkin()).toBe(id);
  }
  store.prefs.setSkin('нетакого');
  expect(store.prefs.getSkin()).toBe('classic');
});

test('состояние витрины: открытые и закрытые считаются по достижениям', () => {
  const было = looksWithState(store.snapshot());
  expect(было.filter((l) => l.open)).toHaveLength(3);
  store.achievements.unlock('археолог');
  const стало = looksWithState(store.snapshot());
  expect(стало.find((l) => l.id === 'paper')!.open).toBe(true);
});
