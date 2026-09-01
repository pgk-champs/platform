import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import WordExport from './WordExport';

// jsdom не реализует createObjectURL/click — стабим, чтобы поймать скачивание.
let clicked: { download: string; href: string }[];

beforeEach(() => {
  store.__resetForTests();
  clicked = [];
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clicked.push({ download: this.download, href: this.href });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('пустой набор: файла нет, показана подсказка', () => {
  render(<WordExport />);
  fireEvent.click(screen.getByRole('button', { name: 'Экспорт в Anki (CSV)' }));
  expect(clicked).toHaveLength(0);
  expect(screen.getByText(/Пока нечего экспортировать/)).toBeTruthy();
});

test('избранное слово уходит в CSV и TSV', () => {
  store.favorites.add({
    id: 'it-english:w1',
    type: 'word',
    chapterId: 'it-english',
    title: 'error',
    data: { kind: 'word', term: 'error', translation: 'ошибка' },
  });
  render(<WordExport />);

  fireEvent.click(screen.getByRole('button', { name: 'Экспорт в Anki (CSV)' }));
  expect(clicked).toHaveLength(1);
  expect(clicked[0].download).toBe('pgk-words-anki.csv');

  fireEvent.click(screen.getByRole('button', { name: 'Quizlet (TSV)' }));
  expect(clicked).toHaveLength(2);
  expect(clicked[1].download).toBe('pgk-words-quizlet.tsv');
});
