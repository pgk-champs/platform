import { store } from './store';

// Настройки чтения. Значение уезжает в атрибут на <html> и правит вид всего
// сайта, поэтому на ЧТЕНИИ оно проверяется списком: в localStorage может
// лежать что угодно — чужая вкладка, ручная правка, старый формат.

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('по умолчанию — обычный кегль и полное движение', () => {
  expect(store.prefs.getRead()).toBe('m');
  expect(store.prefs.getMotion()).toBe('full');
});

test('запоминает выбор и переживает перезагрузку', () => {
  store.prefs.setRead('xl');
  store.prefs.setMotion('calm');
  expect(JSON.parse(localStorage.getItem('pgk-store')!).prefs).toMatchObject({ read: 'xl', motion: 'calm' });
});

test('мусор откатывается к безопасному значению, а не ломает вид', () => {
  store.prefs.setRead('гигантский');
  expect(store.prefs.getRead()).toBe('m');
  store.prefs.setMotion('дискотека');
  expect(store.prefs.getMotion()).toBe('full');
});

test('кегль и движение не мешают друг другу', () => {
  store.prefs.setRead('l');
  store.prefs.setMotion('calm');
  expect(store.prefs.getRead()).toBe('l');
  expect(store.prefs.getMotion()).toBe('calm');
  store.prefs.setMotion('full');
  expect(store.prefs.getRead()).toBe('l');
});

test('облик и настройки чтения живут в одном prefs и не затирают друг друга', () => {
  store.prefs.setSkin('cola');
  store.prefs.setRead('xl');
  store.prefs.setSeal('первая-прочитанная-глава');
  expect(store.prefs.getSkin()).toBe('cola');
  expect(store.prefs.getRead()).toBe('xl');
  expect(store.prefs.getSeal()).toBe('первая-прочитанная-глава');
});
