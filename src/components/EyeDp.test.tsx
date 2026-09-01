import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import EyeDp from './EyeDp';

beforeEach(() => {
  store.__resetForTests();
});

function answer(label: string, value: string) {
  fireEvent.click(screen.getByLabelText(label));
  const input = screen.getByLabelText('Твой ответ');
  fireEvent.change(input, { target: { value } });
  fireEvent.submit(input.closest('form')!);
}

test('рисует макет и четыре кликабельных маркера', () => {
  render(<EyeDp />);
  expect(screen.getByLabelText('Макет карточки товара')).toBeTruthy();
  expect(screen.getByLabelText('Отступ карточки')).toBeTruthy();
  expect(screen.getByLabelText('Зазор между строками карточки')).toBeTruthy();
  expect(screen.getByLabelText('Размер шрифта цены')).toBeTruthy();
  expect(screen.getByLabelText('Скругление углов карточки')).toBeTruthy();
});

test('клик по маркеру показывает вопрос с правильной единицей измерения', () => {
  render(<EyeDp />);
  fireEvent.click(screen.getByLabelText('Размер шрифта цены'));
  expect(screen.getByText('Размер шрифта цены: сколько sp?')).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Отступ карточки'));
  expect(screen.getByText('Отступ карточки: сколько dp?')).toBeTruthy();
});

test('допуск ±4: точный ответ и ответ на границе допуска засчитываются', () => {
  const { container } = render(<EyeDp />);
  answer('Отступ карточки', '12');
  expect(container.textContent).toContain('Верно! Отступ карточки — 12dp (Dimens.CardPadding)');
  answer('Размер шрифта цены', '22'); // 18 + 4 — граница допуска
  expect(container.textContent).toContain('Верно! Размер шрифта цены — 18sp (Dimens.PriceFontSize)');
});

test('промах больше допуска — «не совсем» и правильный ответ', () => {
  const { container } = render(<EyeDp />);
  answer('Зазор между строками карточки', '20');
  expect(container.textContent).toContain('Не совсем: Зазор между строками карточки — не 20, а 8dp');
});

test('счёт 4/4: плашка «Выполнено!», запись в store и XP', () => {
  const { container } = render(<EyeDp chapterId="layout-by-mockup" trainerId="trainer-eye-dp" />);
  answer('Отступ карточки', '12');
  answer('Зазор между строками карточки', '8');
  answer('Размер шрифта цены', '18');
  answer('Скругление углов карточки', '8');

  expect(container.textContent).toContain('Выполнено! Глазомер 4 из 4.');
  expect(store.getProgress().trainers['layout-by-mockup']?.['trainer-eye-dp']).toMatchObject({
    result: { correct: 4, total: 4 },
  });
  expect(store.getXp()).toBe(25);
});

test('неидеальный проход: результат в store без XP, «попробовать ещё раз» сбрасывает', () => {
  const { container } = render(<EyeDp chapterId="layout-by-mockup" trainerId="trainer-eye-dp" />);
  answer('Отступ карточки', '100'); // мимо
  answer('Зазор между строками карточки', '8');
  answer('Размер шрифта цены', '18');
  answer('Скругление углов карточки', '8');

  expect(container.textContent).toContain('Верно 3 из 4');
  expect(container.textContent).not.toContain('Выполнено!');
  expect(store.getProgress().trainers['layout-by-mockup']?.['trainer-eye-dp']).toMatchObject({
    result: { correct: 3, total: 4 },
  });
  expect(store.getXp()).toBe(0);

  fireEvent.click(screen.getByText('Попробовать ещё раз'));
  expect(container.textContent).toContain('Найдено размеров: 0 из 4');
});
