import { render, screen, fireEvent, within } from '@testing-library/react';
import { store } from '../lib/store';
import WizardOrder, { type WizardStep } from './WizardOrder';

const steps: WizardStep[] = [
  { text: 'Открыть New Project', why: 'всё начинается со стартового экрана' },
  { text: 'Выбрать Empty Activity', why: 'шаблон определяет заготовку проекта' },
  { text: 'Дождаться Gradle sync', why: 'без sync собирать нечего' },
  { text: 'Нажать Run', why: 'запуск — только после синхронизации' },
];

beforeEach(() => {
  store.__resetForTests();
});

function bank() {
  return within(screen.getByLabelText('Карточки шагов'));
}

function pickAll(order: WizardStep[]) {
  for (const s of order) fireEvent.click(bank().getByText(s.text));
}

test('карточки перетасованы, проверка заблокирована до полного порядка', () => {
  render(<WizardOrder steps={steps} />);
  for (const s of steps) expect(bank().getByText(s.text)).toBeTruthy();
  expect(screen.getByText('Проверить порядок')).toBeDisabled();
  fireEvent.click(bank().getByText(steps[0].text));
  expect(screen.getByText('Проверить порядок')).toBeDisabled();
});

test('правильный порядок: Выполнено, объяснение почему, store и XP', () => {
  render(<WizardOrder steps={steps} chapterId="android-studio" trainerId="trainer-wizard-order" />);
  pickAll(steps);
  fireEvent.click(screen.getByText('Проверить порядок'));
  expect(screen.getByText(/Выполнено! Все 4 шагов мастера/)).toBeTruthy();
  expect(screen.getByText('Почему такой порядок:')).toBeTruthy();
  for (const s of steps) expect(screen.getByText(new RegExp(s.why))).toBeTruthy();
  expect(
    store.getProgress().trainers['android-studio']?.['trainer-wizard-order'],
  ).toMatchObject({ result: { solved: true, total: 4 } });
  expect(store.getXp()).toBe(15);
});

test('неправильный порядок: названы все сбитые позиции, можно переставить', () => {
  render(<WizardOrder steps={steps} chapterId="android-studio" trainerId="trainer-wizard-order" />);
  pickAll([steps[1], steps[0], steps[2], steps[3]]);
  fireEvent.click(screen.getByText('Проверить порядок'));
  expect(screen.getByText(/Не на своём месте: позиции 1, 2/)).toBeTruthy();
  expect(store.getXp()).toBe(0);

  // возвращаем карточки и выстраиваем правильно
  const seq = () => within(screen.getByLabelText('Твой порядок шагов'));
  for (const s of steps) fireEvent.click(seq().getByText(s.text));
  pickAll(steps);
  fireEvent.click(screen.getByText('Проверить порядок'));
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
});

test('пустой список шагов не рендерит ничего', () => {
  const { container } = render(<WizardOrder steps={[]} />);
  expect(container.innerHTML).toBe('');
});
