import { store } from './store';
import { sealOptions, effectiveSeal } from './seal';
import { ACHIEVEMENTS } from './achievements';

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('носить можно только выданное', () => {
  // Флага «можно носить» нигде нет: он выводится из достижений на каждом
  // показе. Сбросили прогресс — печать исчезла сама.
  expect(effectiveSeal('первая-прочитанная-глава', [])).toBeNull();
  const a = effectiveSeal('первая-прочитанная-глава', ['первая-прочитанная-глава']);
  expect(a?.title).toBe('Первая прочитанная глава');
});

test('выдуманный id не носится и не роняет', () => {
  expect(effectiveSeal('нетакого', ['нетакого'])).toBeNull();
  expect(effectiveSeal(undefined, [])).toBeNull();
  expect(effectiveSeal('', [])).toBeNull();
});

test('в выборе только открытые, и порядок — как в реестре', () => {
  const two = [ACHIEVEMENTS[3].id, ACHIEVEMENTS[1].id];
  const opts = sealOptions(two);
  expect(opts).toHaveLength(2);
  expect(opts[0].id).toBe(ACHIEVEMENTS[1].id);
  expect(sealOptions([])).toEqual([]);
});

test('store хранит выбор и умеет его снять', () => {
  store.prefs.setSeal('первая-прочитанная-глава');
  expect(store.prefs.getSeal()).toBe('первая-прочитанная-глава');
  store.prefs.setSeal('');
  expect(store.prefs.getSeal()).toBeUndefined();
});

test('выбранный трек Маршрута переживает перезагрузку', () => {
  expect(store.prefs.getTrack()).toBeUndefined();
  store.prefs.setTrack('блокчейн');
  expect(store.prefs.getTrack()).toBe('блокчейн');
});
