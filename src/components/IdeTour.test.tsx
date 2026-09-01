import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import IdeTour from './IdeTour';

beforeEach(() => {
  store.__resetForTests();
});

// Порядок вопросов викторины, как в компоненте.
const QUIZ_TITLES = [
  'Logcat',
  'Project — дерево файлов',
  'Панель Gradle',
  'Terminal',
  'Тулбар с Run',
  'Редактор',
];

const zoneBtn = (title: string) => screen.getByRole('button', { name: title });

test('explore mode: clicking a zone opens a card with the chapter description', () => {
  render(<IdeTour />);
  expect(screen.getByText(/Кликай по панелям схемы/)).toBeTruthy();
  fireEvent.click(zoneBtn('Logcat'));
  expect(screen.getByText(/Журнал запущенного приложения/)).toBeTruthy();
  fireEvent.click(zoneBtn('Редактор'));
  expect(screen.getByText(/красной волнистой линией/)).toBeTruthy();
  expect(screen.queryByText(/Журнал запущенного приложения/)).toBeNull();
});

test('quiz mode: wrong click gives a friendly hint, right click advances to the next prompt', () => {
  render(<IdeTour />);
  fireEvent.click(screen.getByRole('button', { name: 'Викторина: найди панель' }));
  expect(screen.getByText(/Покажи, где/)).toBeTruthy();
  expect(screen.getByText('Logcat', { selector: 'strong' })).toBeTruthy();

  fireEvent.click(zoneBtn('Редактор'));
  expect(screen.getByText(/Это Редактор, а найти нужно: Logcat/)).toBeTruthy();

  fireEvent.click(zoneBtn('Logcat'));
  expect(screen.getByText(/Верно! Это Logcat/)).toBeTruthy();
  expect(screen.getByText('Project — дерево файлов', { selector: 'strong' })).toBeTruthy();
});

test('a flawless quiz run marks the trainer done and awards first + flawless xp', () => {
  render(<IdeTour chapterId="android-studio" trainerId="ide-tour" />);
  fireEvent.click(screen.getByRole('button', { name: 'Викторина: найди панель' }));
  for (const title of QUIZ_TITLES) fireEvent.click(zoneBtn(title));

  expect(screen.getByText(/Викторина пройдена/)).toBeTruthy();
  expect(screen.getByText(/Ни одного промаха/)).toBeTruthy();
  expect(store.getProgress().trainers['android-studio']?.['ide-tour']?.result).toEqual({
    total: 6,
    mistakes: 0,
  });
  expect(store.getXp()).toBe(25); // 10 за первое прохождение + 15 за прогон без промахов
});

test('a run with a mistake records it and skips the flawless bonus', () => {
  render(<IdeTour chapterId="android-studio" trainerId="ide-tour" />);
  fireEvent.click(screen.getByRole('button', { name: 'Викторина: найди панель' }));
  fireEvent.click(zoneBtn('Terminal')); // промах: первым спрашивают Logcat
  for (const title of QUIZ_TITLES) fireEvent.click(zoneBtn(title));

  expect(store.getProgress().trainers['android-studio']?.['ide-tour']?.result).toEqual({
    total: 6,
    mistakes: 1,
  });
  expect(store.getXp()).toBe(10);
});

test('without chapterId/trainerId the quiz works but writes nothing to the store', () => {
  render(<IdeTour />);
  fireEvent.click(screen.getByRole('button', { name: 'Викторина: найди панель' }));
  for (const title of QUIZ_TITLES) fireEvent.click(zoneBtn(title));
  expect(screen.getByText(/Викторина пройдена/)).toBeTruthy();
  expect(store.getProgress().trainers).toEqual({});
  expect(store.getXp()).toBe(0);
});
