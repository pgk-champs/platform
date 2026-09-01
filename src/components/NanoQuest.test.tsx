import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import NanoQuest, { matchesStep } from './NanoQuest';

const zone = () => screen.getByRole('group', { name: /Экран nano/ });

beforeEach(() => {
  store.__resetForTests();
});

test('renders nano screen: titlebar, file text, bottom panel with ^O and ^X', () => {
  render(<NanoQuest />);
  expect(screen.getByText('GNU nano 7.2')).toBeTruthy();
  expect(screen.getByText('notes.txt')).toBeTruthy();
  expect(screen.getByText(/port=2222/)).toBeTruthy();
  expect(screen.getByText('^O Write Out')).toBeTruthy();
  expect(screen.getByText('^X Exit')).toBeTruthy();
  // первый шаг — Ctrl+O, подсвечен именно он
  expect(screen.getByText('^O Write Out').className).toContain('nq-key-target');
  expect(screen.getByText('^X Exit').className).not.toContain('nq-key-target');
});

test('wrong key shows a soft hint and does not advance', () => {
  render(<NanoQuest />);
  fireEvent.keyDown(zone(), { key: 'x', code: 'KeyX', ctrlKey: true });
  expect(screen.getByText(/Нажато Ctrl\+X — а сейчас нужно Ctrl\+O/)).toBeTruthy();
  expect(screen.getByText('^O Write Out').className).toContain('nq-key-target');
});

test('keydown default is prevented so the browser does not steal Ctrl+O', () => {
  render(<NanoQuest />);
  const notPrevented = fireEvent.keyDown(zone(), { key: 'o', code: 'KeyO', ctrlKey: true });
  expect(notPrevented).toBe(false); // false = preventDefault был вызван
});

test('scenario 1: Ctrl+O -> filename prompt -> Enter -> Wrote -> Ctrl+X -> scenario 2', () => {
  render(<NanoQuest />);
  fireEvent.keyDown(zone(), { key: 'o', code: 'KeyO', ctrlKey: true });
  expect(screen.getByText('File Name to Write: notes.txt')).toBeTruthy();
  fireEvent.keyDown(zone(), { key: 'Enter', code: 'Enter' });
  expect(screen.getByText('[ Wrote 2 lines ]')).toBeTruthy();
  fireEvent.keyDown(zone(), { key: 'x', code: 'KeyX', ctrlKey: true });
  expect(screen.getByText(/сценарий 1 пройден/)).toBeTruthy();

  fireEvent.click(screen.getByText('Сценарий 2 →'));
  expect(screen.getByText(/Выйди из nano БЕЗ сохранения/)).toBeTruthy();
  expect(screen.getByText('^X Exit').className).toContain('nq-key-target');
});

test('scenario 2: Y at Save modified buffer? warns, N finishes with store mark and xp', () => {
  render(<NanoQuest chapterId="c1" trainerId="t1" />);
  // сценарий 1 целиком
  fireEvent.keyDown(zone(), { key: 'o', code: 'KeyO', ctrlKey: true });
  fireEvent.keyDown(zone(), { key: 'Enter', code: 'Enter' });
  fireEvent.keyDown(zone(), { key: 'x', code: 'KeyX', ctrlKey: true });
  fireEvent.click(screen.getByText('Сценарий 2 →'));

  fireEvent.keyDown(zone(), { key: 'x', code: 'KeyX', ctrlKey: true });
  expect(screen.getByText('Save modified buffer?')).toBeTruthy();
  fireEvent.keyDown(zone(), { key: 'y', code: 'KeyY' });
  expect(screen.getByText(/Y сохранит изменения/)).toBeTruthy();
  fireEvent.keyDown(zone(), { key: 'n', code: 'KeyN' });

  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers.c1?.t1).toMatchObject({
    result: { scenarios: 2 },
  });
  expect(store.getXp()).toBe(25);
});

test('fallback buttons in the panel work instead of real keys', () => {
  render(<NanoQuest />);
  fireEvent.click(screen.getByText('^O Write Out'));
  fireEvent.click(screen.getByText('Enter'));
  fireEvent.click(screen.getByText('^X Exit'));
  expect(screen.getByText(/сценарий 1 пройден/)).toBeTruthy();
});

test('matchesStep distinguishes modifiers', () => {
  const base = { ctrlKey: false, altKey: false, metaKey: false };
  expect(matchesStep('ctrl-o', { ...base, ctrlKey: true, code: 'KeyO' })).toBe(true);
  expect(matchesStep('ctrl-o', { ...base, code: 'KeyO' })).toBe(false);
  expect(matchesStep('enter', { ...base, ctrlKey: true, code: 'Enter' })).toBe(false);
  expect(matchesStep('n', { ...base, code: 'KeyN' })).toBe(true);
});
