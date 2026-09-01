import { render, screen, fireEvent } from '@testing-library/react';
import HistoryNote from './HistoryNote';
import { store } from '../lib/store';

beforeEach(() => store.__resetForTests());

test('рендерит свёрнутую врезку с заголовком и содержимым', () => {
  render(<HistoryNote id="git-2005">Линус написал git в 2005</HistoryNote>);
  expect(screen.getByText('Как это было')).toBeTruthy();
  expect(screen.getByText('Линус написал git в 2005')).not.toBeVisible();
});

test('открытие трекается в store для достижения «Археолог»', () => {
  render(<HistoryNote id="git-2005">факт</HistoryNote>);
  fireEvent.click(screen.getByText('Как это было'));
  expect(store.snapshot().easter.historyOpened).toEqual(['git-2005']);
});

test('повторное открытие той же врезки не дублируется', () => {
  render(<HistoryNote id="git-2005">факт</HistoryNote>);
  const summary = screen.getByText('Как это было');
  fireEvent.click(summary); // открыть
  fireEvent.click(summary); // закрыть
  fireEvent.click(summary); // открыть снова
  expect(store.snapshot().easter.historyOpened).toEqual(['git-2005']);
});

test('разные врезки копятся отдельными id', () => {
  render(
    <>
      <HistoryNote id="git-2005">a</HistoryNote>
      <HistoryNote id="unix-1969">b</HistoryNote>
    </>,
  );
  for (const s of screen.getAllByText('Как это было')) fireEvent.click(s);
  expect(store.snapshot().easter.historyOpened).toEqual(['git-2005', 'unix-1969']);
});
