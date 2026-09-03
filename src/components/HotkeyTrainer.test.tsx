import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
// @ts-ignore — в проекте нет @types/react-dom; серверный рендер нужен,
// чтобы проверить: первый рендер не заглядывает в store (hydration mismatch).
import { renderToStaticMarkup } from 'react-dom/server';
import HotkeyTrainer, { parseCombo } from './HotkeyTrainer';
import { detectOs } from '../lib/os';

const items = [
  { action: 'Закомментировать строку', mac: '⌘/', win: 'Ctrl+/', linux: 'Ctrl+/' },
  { action: 'Показать панель Project', mac: '⌘1', win: 'Alt+1', linux: 'Alt+1', browserReserved: true },
];

beforeEach(() => {
  store.__resetForTests();
  store.prefs.setOs('win');
});

const zone = () => screen.getByRole('group', { name: /Зона тренировки/ });

test('parseCombo understands mac symbols and plus notation, rejects non-key notation', () => {
  expect(parseCombo('⌘/')).toEqual({ ctrl: false, alt: false, shift: false, meta: true, code: 'Slash' });
  expect(parseCombo('⌥⌘L')).toEqual({ ctrl: false, alt: true, shift: false, meta: true, code: 'KeyL' });
  expect(parseCombo('⇧F6')).toEqual({ ctrl: false, alt: false, shift: true, meta: false, code: 'F6' });
  expect(parseCombo('Ctrl+Alt+L')).toEqual({ ctrl: true, alt: true, shift: false, meta: false, code: 'KeyL' });
  expect(parseCombo('Shift+F10')).toEqual({ ctrl: false, alt: false, shift: true, meta: false, code: 'F10' });
  expect(parseCombo('Alt+1')).toEqual({ ctrl: false, alt: true, shift: false, meta: false, code: 'Digit1' });
  expect(parseCombo('Shift, дважды')).toBeNull();
});

test('shows the task for the chosen OS and hides the combo until the hint is opened', () => {
  render(<HotkeyTrainer items={items} />);
  expect(screen.getByText('Закомментировать строку')).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Windows' }).getAttribute('aria-selected')).toBe('true');
  expect(screen.queryByText('Ctrl+/')).toBeNull();
  fireEvent.click(screen.getByText('Показать подсказку'));
  expect(screen.getByText('Ctrl+/')).toBeTruthy();
});

test('wrong press shows what was pressed, correct real press advances the series', () => {
  render(<HotkeyTrainer items={items} />);
  expect(screen.getByText('Выполнено: 0 из 2')).toBeTruthy();

  fireEvent.keyDown(zone(), { key: 'k', code: 'KeyK', ctrlKey: true });
  expect(screen.getByText('Ctrl+K')).toBeTruthy();
  expect(screen.getByText(/не то сочетание/)).toBeTruthy();
  expect(screen.getByText('Выполнено: 0 из 2')).toBeTruthy();

  fireEvent.keyDown(zone(), { key: '/', code: 'Slash', ctrlKey: true });
  expect(screen.getByText('Выполнено: 1 из 2')).toBeTruthy();
});

test('browserReserved item is checked with a confirm button and an honest browser warning', () => {
  render(<HotkeyTrainer items={items} />);
  fireEvent.keyDown(zone(), { key: '/', code: 'Slash', ctrlKey: true });
  // второй элемент — Alt+1 с browserReserved: зоны нажатия нет, есть предупреждение
  expect(screen.getByText(/перехватит браузер/)).toBeTruthy();
  expect(screen.queryByRole('group', { name: /Зона тренировки/ })).toBeNull();
  fireEvent.click(screen.getByText('Понятно — дальше'));
  expect(screen.getByText(/Готово! Все 2 сочетаний выполнены/)).toBeTruthy();
});

test('flawless full series records the trainer in store and awards first + flawless xp', () => {
  render(<HotkeyTrainer items={items} chapterId="android-studio" trainerId="hotkeys" />);
  fireEvent.keyDown(zone(), { key: '/', code: 'Slash', ctrlKey: true });
  fireEvent.click(screen.getByText('Понятно — дальше'));
  expect(store.getProgress().trainers['android-studio']?.hotkeys?.result).toEqual({ total: 2, mistakes: 0 });
  expect(store.getXp()).toBe(25); // 10 за первое прохождение + 15 за серию без промахов
});

test('a run with a mistake records the mistake count and skips the flawless bonus', () => {
  render(<HotkeyTrainer items={items} chapterId="android-studio" trainerId="hotkeys" />);
  fireEvent.keyDown(zone(), { key: 'k', code: 'KeyK', ctrlKey: true }); // промах
  fireEvent.keyDown(zone(), { key: '/', code: 'Slash', ctrlKey: true });
  fireEvent.click(screen.getByText('Понятно — дальше'));
  expect(store.getProgress().trainers['android-studio']?.hotkeys?.result).toEqual({ total: 2, mistakes: 1 });
  expect(store.getXp()).toBe(10);
});

test('without chapterId/trainerId nothing is written to the store', () => {
  render(<HotkeyTrainer items={items} />);
  fireEvent.keyDown(zone(), { key: '/', code: 'Slash', ctrlKey: true });
  fireEvent.click(screen.getByText('Понятно — дальше'));
  expect(store.getProgress().trainers).toEqual({});
  expect(store.getXp()).toBe(0);
});

// --- ОС по умолчанию: определяется по браузеру, а не «всегда macOS» ---

function withPlatform(platform: string, fn: () => void) {
  const orig = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform');
  Object.defineProperty(navigator, 'platform', { value: platform, configurable: true });
  try {
    fn();
  } finally {
    delete (navigator as unknown as Record<string, unknown>).platform;
    if (orig) Object.defineProperty(Navigator.prototype, 'platform', orig);
  }
}

test('detectOs читает платформу браузера, а незнакомую считает Windows', () => {
  withPlatform('MacIntel', () => expect(detectOs()).toBe('mac'));
  withPlatform('Win32', () => expect(detectOs()).toBe('win'));
  withPlatform('Linux x86_64', () => expect(detectOs()).toBe('linux'));
  withPlatform('', () => expect(detectOs()).toBe('win'));
});

test('без сохранённого выбора ОС берётся из браузера: у Windows-студента вкладка Windows, а не macOS', () => {
  store.__resetForTests(); // ОС ещё не выбрана
  withPlatform('Win32', () => {
    render(<HotkeyTrainer items={items} />);
    expect(screen.getByRole('tab', { name: 'Windows' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'macOS' }).getAttribute('aria-selected')).toBe('false');
    expect(store.prefs.getOs()).toBe('win');
  });
});

test('на маке автоопределение выбирает macOS, а ручной выбор студента автоопределение не перебивает', () => {
  store.__resetForTests();
  withPlatform('MacIntel', () => {
    const first = render(<HotkeyTrainer items={items} />);
    expect(screen.getByRole('tab', { name: 'macOS' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('tab', { name: 'Ubuntu' }));
    first.unmount();

    render(<HotkeyTrainer items={items} />);
    expect(screen.getByRole('tab', { name: 'Ubuntu' }).getAttribute('aria-selected')).toBe('true');
  });
});

test('серверный рендер не заглядывает в store: ОС по умолчанию — Windows', () => {
  store.prefs.setOs('mac');
  const html = renderToStaticMarkup(<HotkeyTrainer items={items} />);
  expect(html).toMatch(/aria-selected="true"[^>]*>Windows</);
  expect(html).toMatch(/aria-selected="false"[^>]*>macOS</);
});
