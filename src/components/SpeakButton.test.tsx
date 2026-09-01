import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { store } from '../lib/store';
import SpeakButton from './SpeakButton';
import Flashcards from './Flashcards';

class FakeUtterance {
  text: string;
  lang = '';
  constructor(text: string) {
    this.text = text;
  }
}

const speak = vi.fn();
const cancel = vi.fn();
const win = window as unknown as Record<string, unknown>;

beforeEach(() => {
  store.__resetForTests();
  speak.mockClear();
  cancel.mockClear();
  win.SpeechSynthesisUtterance = FakeUtterance;
  win.speechSynthesis = { speak, cancel };
});

afterEach(() => {
  delete win.speechSynthesis;
  delete win.SpeechSynthesisUtterance;
});

test('произносит слово с lang en-US по умолчанию, обрывая предыдущую озвучку', () => {
  render(<SpeakButton text="variable" />);
  fireEvent.click(screen.getByRole('button', { name: 'Произнести: variable' }));
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(speak).toHaveBeenCalledTimes(1);
  const utterance = speak.mock.calls[0][0] as FakeUtterance;
  expect(utterance.text).toBe('variable');
  expect(utterance.lang).toBe('en-US');
});

test('lang можно переопределить', () => {
  render(<SpeakButton text="Fehler" lang="de-DE" />);
  fireEvent.click(screen.getByRole('button', { name: 'Произнести: Fehler' }));
  expect((speak.mock.calls[0][0] as FakeUtterance).lang).toBe('de-DE');
});

test('без SpeechSynthesis API кнопка не рендерится (graceful degradation)', () => {
  delete win.speechSynthesis;
  delete win.SpeechSynthesisUtterance;
  const { container } = render(<SpeakButton text="x" />);
  expect(container.querySelector('button')).toBeNull();
});

test('Flashcards: у term есть кнопка озвучки, клик по ней не переворачивает карточку', () => {
  render(<Flashcards cards={[{ term: 'variable', translation: 'переменная' }]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Произнести: variable' }));
  expect(speak).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('переменная')).toBeNull();
  expect((speak.mock.calls[0][0] as FakeUtterance).text).toBe('variable');
});

test('Flashcards: озвучка следует за текущей карточкой', () => {
  const cards = [
    { term: 'variable', translation: 'переменная' },
    { term: 'function', translation: 'функция' },
  ];
  render(<Flashcards cards={cards} />);
  fireEvent.click(screen.getByText('Дальше'));
  fireEvent.click(screen.getByRole('button', { name: 'Произнести: function' }));
  expect((speak.mock.calls[0][0] as FakeUtterance).text).toBe('function');
});
