import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import GymBuilder, { encodePreset, decodePreset, parseCards, buildPresetData, type SharedPreset } from './GymBuilder';

beforeEach(() => {
  store.__resetForTests();
  window.location.hash = '';
});

// --- сериализация в URL-hash ---

test('encode/decode туда-обратно с кириллицей для всех движков', () => {
  const presets: SharedPreset[] = [
    {
      name: 'Словарь недели №3 — «git»',
      engine: 'flashcards',
      cards: [{ term: 'pull request', translation: 'запрос на слияние', note: 'жаргон: «пулреквест»' }],
    },
    { name: 'Фраза', engine: 'wordorder', phrase: 'проверь мой pull request пожалуйста' },
    { name: 'Печать', engine: 'codetyping', snippets: ['val приветствие = "Привет!"', 'git commit -m "фикс"'] },
    { name: 'Предскажи', engine: 'predict', code: 'fun main() {\n    println("Привет")\n}', expected: 'Привет' },
  ];
  for (const p of presets) {
    const encoded = encodePreset(p);
    // encoded должен быть безопасен для URL-hash (никаких сырых + / =)
    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodePreset(encoded)).toEqual(p);
  }
});

test('decode мусора и битых структур возвращает null, не бросает', () => {
  expect(decodePreset('не base64 вообще')).toBeNull();
  expect(decodePreset(btoa('{"broken json'))).toBeNull();
  expect(decodePreset(encodeURIComponent(btoa(JSON.stringify({ name: 'x', engine: 'unknown' }))))).toBeNull();
  // wordorder из одного слова — невалидный набор
  expect(
    decodePreset(encodeURIComponent(btoa(JSON.stringify({ name: 'x', engine: 'wordorder', phrase: 'one' })))),
  ).toBeNull();
  // flashcards без переводов — тоже
  expect(
    decodePreset(encodeURIComponent(btoa(JSON.stringify({ name: 'x', engine: 'flashcards', cards: [{ term: 'a' }] })))),
  ).toBeNull();
});

// --- валидация форм ---

test('parseCards: формат «слово — перевод», ошибка называет строку', () => {
  const ok = parseCards('pull request — запрос на слияние\n\nbranch - ветка');
  expect(ok.cards).toEqual([
    { term: 'pull request', translation: 'запрос на слияние' },
    { term: 'branch', translation: 'ветка' },
  ]);
  expect(parseCards('pull request — запрос\nстрока без разделителя').error).toMatch(/Строка 2/);
  expect(parseCards('   \n').error).toMatch(/хотя бы одну карточку/);
});

test('buildPresetData: дружелюбные ошибки для каждого движка', () => {
  expect(buildPresetData('wordorder', { ...empty(), phrase: 'одно' }).error).toMatch(/минимум два слова/);
  expect(buildPresetData('codetyping', { ...empty(), snippetsText: '  \n ' }).error).toMatch(/хотя бы одну строку/);
  expect(buildPresetData('predict', { ...empty(), expected: '4' }).error).toMatch(/Вставь код/);
  expect(buildPresetData('predict', { ...empty(), code: 'println(4)' }).error).toMatch(/ожидаемый вывод/);
  expect(buildPresetData('wordorder', { ...empty(), phrase: '  раз   два  ' }).data).toEqual({
    engine: 'wordorder',
    phrase: 'раз два',
  });
});

function empty() {
  return { cardsText: '', phrase: '', snippetsText: '', code: '', expected: '' };
}

// --- компонент ---

function openBuilder() {
  const utils = render(<GymBuilder />);
  // details/summary: Fold открыт кликом по заголовку
  fireEvent.click(screen.getByText('Создать свой тренажёр'));
  return utils;
}

test('форма: невалидный ввод показывает ошибку, валидный запускает движок', () => {
  openBuilder();
  fireEvent.click(screen.getByRole('button', { name: 'Собери фразу' }));
  const area = screen.getByPlaceholderText('please review my pull request');
  fireEvent.change(area, { target: { value: 'одно' } });
  fireEvent.click(screen.getAllByRole('button', { name: 'Запустить' })[0]);
  expect(screen.getByText(/минимум два слова/)).toBeTruthy();

  fireEvent.change(area, { target: { value: 'собери меня скорее' } });
  fireEvent.click(screen.getAllByRole('button', { name: 'Запустить' })[0]);
  // движок WordOrder отрендерился с нашими словами
  expect(screen.getByText(/Запущено/)).toBeTruthy();
  expect(document.querySelector('.wo-bank')).toBeTruthy();
  expect(screen.getByText('скорее')).toBeTruthy();
});

test('сохранение пресета: без имени — ошибка, с именем — в store, удаление работает', () => {
  openBuilder();
  const area = screen.getByPlaceholderText(/pull request — запрос/);
  fireEvent.change(area, { target: { value: 'branch — ветка' } });
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить пресет' }));
  expect(screen.getByText(/Дай набору имя/)).toBeTruthy();
  expect(store.customPresets.list()).toHaveLength(0);

  fireEvent.change(screen.getByPlaceholderText('Словарь недели 3'), { target: { value: 'Мой словарь' } });
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить пресет' }));
  const saved = store.customPresets.list();
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({
    name: 'Мой словарь',
    engine: 'flashcards',
    cards: [{ term: 'branch', translation: 'ветка' }],
  });
  // пресет виден в списке и удаляется
  expect(screen.getByText('Мои пресеты')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Удалить набор Мой словарь' }));
  expect(store.customPresets.list()).toHaveLength(0);
});

test('ссылка #preset=: баннер с именем, «Запустить» и «Сохранить себе» работают', () => {
  const preset: SharedPreset = {
    name: 'Набор наставника',
    engine: 'flashcards',
    cards: [{ term: 'merge', translation: 'слияние' }],
  };
  window.location.hash = `#preset=${encodePreset(preset)}`;
  render(<GymBuilder />);
  expect(screen.getByText(/Вам передали набор «Набор наставника»/)).toBeTruthy();

  // первый «Запустить» — в баннере (он рендерится выше формы)
  fireEvent.click(screen.getAllByRole('button', { name: 'Запустить' })[0]);
  expect(screen.getByText(/Запущено: «Набор наставника»/)).toBeTruthy();
  expect(document.querySelector('.fc-card')).toBeTruthy(); // Flashcards отрендерились

  fireEvent.click(screen.getByRole('button', { name: 'Сохранить себе' }));
  expect(store.customPresets.list()[0]).toMatchObject({ name: 'Набор наставника', engine: 'flashcards' });
  // баннер после сохранения исчез
  expect(screen.queryByText(/Вам передали набор/)).toBeNull();
});

test('битая ссылка #preset=: аккуратное сообщение вместо падения', () => {
  window.location.hash = '#preset=мусор';
  render(<GymBuilder />);
  expect(screen.getByText(/Ссылка с набором повреждена/)).toBeTruthy();
});
