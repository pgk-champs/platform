import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { store } from '../lib/store';
import NodeNetSim from './NodeNetSim';

beforeEach(() => {
  store.__resetForTests();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function node(i: number) {
  return screen.getByRole('button', { name: new RegExp(`нода node-${i}`) });
}

test('рендерит три ноды, квест и кнопку отправки', () => {
  render(<NodeNetSim />);
  expect(node(0)).toBeTruthy();
  expect(node(1)).toBeTruthy();
  expect(node(2)).toBeTruthy();
  expect(screen.getByText(/Квест: выключи ровно одну ноду/)).toBeTruthy();
  expect(screen.getByText('Отправить транзакцию')).toBeTruthy();
});

test('транзакция при трёх живых нодах: три подтверждения, квест не засчитан', () => {
  render(<NodeNetSim chapterId="waves-first-network" trainerId="trainer-node-net" />);
  fireEvent.click(screen.getByText('Отправить транзакцию'));
  act(() => vi.runAllTimers());
  expect(screen.getByText(/Подтверждений: 3 из 3 — большинство набрано/)).toBeTruthy();
  expect(screen.queryByText(/Выполнено!/)).toBeNull();
  expect(store.getProgress().trainers['waves-first-network']).toBeUndefined();
});

test('квест: одна нода выключена, транзакция проходит на двух — Выполнено и XP', () => {
  render(<NodeNetSim chapterId="waves-first-network" trainerId="trainer-node-net" />);
  fireEvent.click(node(1));
  expect(node(1).getAttribute('aria-label')).toContain('выключена');
  fireEvent.click(screen.getByText('Отправить транзакцию'));
  act(() => vi.runAllTimers());
  expect(screen.getByText(/Подтверждений: 2 из 2 — большинство набрано/)).toBeTruthy();
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(
    store.getProgress().trainers['waves-first-network']?.['trainer-node-net'],
  ).toMatchObject({ result: { solved: true } });
  expect(store.getXp()).toBe(15);
});

test('две выключенные ноды: плашка про кворум вместо кнопки отправки', () => {
  render(<NodeNetSim />);
  fireEvent.click(node(1));
  fireEvent.click(node(2));
  expect(screen.getByText(/Сеть остановилась: нет кворума/)).toBeTruthy();
  expect(screen.queryByText('Отправить транзакцию')).toBeNull();
  // включаем ноду обратно — сеть снова живёт
  fireEvent.click(node(2));
  expect(screen.queryByText(/Сеть остановилась/)).toBeNull();
  expect(screen.getByText('Отправить транзакцию')).toBeTruthy();
});

test('во время отправки ноды не переключаются', () => {
  render(<NodeNetSim />);
  fireEvent.click(screen.getByText('Отправить транзакцию'));
  fireEvent.click(node(0));
  expect(node(0).getAttribute('aria-label')).toContain('работает');
  act(() => vi.runAllTimers());
});
