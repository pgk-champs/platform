import { store } from './store';

// Оформление сосудов живёт там же, где остальные настройки — в prefs store.
// Значение уходит в атрибут data-skin, поэтому на чтении оно проверяется по
// списку: неизвестная тема должна откатываться к classic, а не превращать
// сосуды в прозрачные прямоугольники без переменных.

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('по умолчанию тема classic', () => {
  expect(store.prefs.getSkin()).toBe('classic');
});

test('выбор запоминается', () => {
  store.prefs.setSkin('cola');
  expect(store.prefs.getSkin()).toBe('cola');
});

test('выбор переживает перезагрузку страницы', () => {
  store.prefs.setSkin('energy');
  store.__reloadForTests();
  expect(store.prefs.getSkin()).toBe('energy');
});

test('неизвестная тема откатывается к classic', () => {
  store.prefs.setSkin('beer' as never);
  expect(store.prefs.getSkin()).toBe('classic');
});
