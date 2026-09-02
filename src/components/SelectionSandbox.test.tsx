import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import SelectionSandbox, { isFreeformValid, missionSolved, type SelectionMission } from './SelectionSandbox';

beforeEach(() => {
  store.__resetForTests();
});

// Выделяет [start, end) внутри текстового узла el и симулирует mouseup/keyup
// зоны — так же, как это делает браузер после реального жеста мыши.
function selectSubstring(container: HTMLElement, textSelector: string, start: number, end: number) {
  const textEl = container.querySelector(textSelector) as HTMLElement;
  const textNode = textEl.firstChild as Text;
  const range = document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, end);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(range);
  const zone = container.querySelector('.selsb-zone') as HTMLElement;
  fireEvent.mouseUp(zone);
}

test('isFreeformValid: диапазон внутри слов — true, по границам слов — false', () => {
  const text = 'Перетаскивание мышью выделяет любой произвольный кусок текста.';
  expect(isFreeformValid(text, 'аскивание мышью выдел')).toBe(true); // оба края внутри слов
  expect(isFreeformValid(text, 'мышью')).toBe(false); // ровно слово, оба края на пробелах
  expect(isFreeformValid(text, 'Пе')).toBe(false); // слишком коротко
  expect(isFreeformValid(text, 'не найдено в тексте')).toBe(false);
});

test('missionSolved: точное совпадение нормализуется (регистр, пробелы, краевая пунктуация)', () => {
  const mission: SelectionMission = { id: 'x', instruction: '', text: 'Пример.', expected: 'Пример' };
  expect(missionSolved(mission, 'Пример.')).toBe(true);
  expect(missionSolved(mission, '  пример  ')).toBe(true);
  expect(missionSolved(mission, 'Прим')).toBe(false);
  expect(missionSolved(mission, '')).toBe(false);
});

test('первая миссия по умолчанию — выделение слова', () => {
  render(<SelectionSandbox />);
  expect(screen.getByText(/Дважды кликни по слову «домашнего»/)).toBeTruthy();
  expect(screen.getByText('Выполнено: 0 из 4')).toBeTruthy();
});

test('точное выделение слова продвигает тренажёр дальше', () => {
  const { container } = render(<SelectionSandbox />);
  // «Слепая печать начинается с домашнего ряда клавиатуры.» — «домашнего» начинается с индекса 27
  selectSubstring(container, '.selsb-text', 27, 36);
  expect(screen.getByText('Выполнено: 1 из 4')).toBeTruthy();
  expect(screen.getByText(/тройной клик выделяет его целиком/)).toBeTruthy();
});

test('неверное выделение не продвигает и показывает текущий выбор', () => {
  const { container } = render(<SelectionSandbox />);
  selectSubstring(container, '.selsb-text', 0, 6); // «Слепая» — не «домашнего»
  expect(screen.getByText('Выполнено: 0 из 4')).toBeTruthy();
  expect(screen.getByText(/Сейчас выделено:/)).toBeTruthy();
  expect(screen.getByText('Слепая')).toBeTruthy();
});

test('простой клик без выделения (пустая selection) не считается попыткой', () => {
  const { container } = render(<SelectionSandbox />);
  window.getSelection()!.removeAllRanges();
  const zone = container.querySelector('.selsb-zone') as HTMLElement;
  fireEvent.mouseUp(zone);
  expect(screen.getByText('Выполнено: 0 из 4')).toBeTruthy();
  expect(screen.queryByText(/Сейчас выделено:/)).toBeNull();
});

test('прохождение всех четырёх миссий (включая протяжку) даёт «Готово!», запись в store и XP', () => {
  const { container } = render(<SelectionSandbox chapterId="typing" trainerId="trainer-selection" />);

  selectSubstring(container, '.selsb-text', 27, 36); // домашнего
  const lineText = 'Тренируйся печатать каждый день хотя бы по десять минут.';
  selectSubstring(container, '.selsb-text', 0, lineText.length); // весь абзац
  const extendText = 'Сначала точность, потом скорость, а награда придёт сама.';
  const extendStart = extendText.indexOf('точность');
  const extendEnd = extendText.indexOf('скорость') + 'скорость'.length;
  selectSubstring(container, '.selsb-text', extendStart, extendEnd);
  selectSubstring(container, '.selsb-text', 5, 26); // протяжка внутри слов «Перетаскивание мышью выделяет...»

  expect(screen.getByText('Готово! Выделение текста опробовано со всех сторон.')).toBeTruthy();
  expect(store.getProgress().trainers.typing?.['trainer-selection']).toMatchObject({
    result: { total: 4, attempts: 4 },
  });
  expect(store.getXp()).toBe(25); // 10 за первое прохождение + 15 за идеальное (0 промахов)
});

test('«Ещё раз» сбрасывает прогресс тренажёра', () => {
  const { container } = render(<SelectionSandbox />);
  selectSubstring(container, '.selsb-text', 27, 36);
  selectSubstring(container, '.selsb-text', 0, 'Тренируйся печатать каждый день хотя бы по десять минут.'.length);
  const extendText = 'Сначала точность, потом скорость, а награда придёт сама.';
  selectSubstring(
    container,
    '.selsb-text',
    extendText.indexOf('точность'),
    extendText.indexOf('скорость') + 'скорость'.length,
  );
  selectSubstring(container, '.selsb-text', 5, 26);
  fireEvent.click(screen.getByText('Ещё раз'));
  expect(screen.getByText('Выполнено: 0 из 4')).toBeTruthy();
});

test('свой набор миссий через проп missions (движок отдельно от данных)', () => {
  const missions: SelectionMission[] = [
    { id: 'link', instruction: 'Выдели ссылку целиком.', text: 'github.com/pgk-champs', expected: 'github.com/pgk-champs' },
  ];
  const { container } = render(<SelectionSandbox missions={missions} chapterId="00-github-start" trainerId="trainer-copy-link" />);
  expect(screen.getByText('Выдели ссылку целиком.')).toBeTruthy();
  selectSubstring(container, '.selsb-text', 0, 'github.com/pgk-champs'.length);
  expect(screen.getByText('Готово! Выделение текста опробовано со всех сторон.')).toBeTruthy();
  expect(store.getProgress().trainers['00-github-start']?.['trainer-copy-link']).toBeTruthy();
});
