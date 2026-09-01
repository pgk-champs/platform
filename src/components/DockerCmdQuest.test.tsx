import { render, screen, fireEvent, within } from '@testing-library/react';
import { store } from '../lib/store';
import DockerCmdQuest, { type CmdStep } from './DockerCmdQuest';

const steps: CmdStep[] = [
  { cmd: 'docker run --rm <генератор конфигов>', why: 'сначала конфиги и ключи нод' },
  { cmd: 'docker compose up -d', why: 'поднять все три ноды в фоне' },
  { cmd: 'docker compose logs -f node-0', why: 'убедиться по журналам, что нода живёт' },
  { cmd: 'docker compose down -v', why: 'остановить сеть и удалить тома' },
];

beforeEach(() => {
  store.__resetForTests();
});

function bank() {
  return within(screen.getByLabelText('Карточки команд'));
}

function pickAll(order: CmdStep[]) {
  for (const s of order) fireEvent.click(bank().getByText(s.cmd));
}

test('карточки перетасованы, кнопка проверки заблокирована до полного порядка', () => {
  render(<DockerCmdQuest steps={steps} />);
  for (const s of steps) expect(bank().getByText(s.cmd)).toBeTruthy();
  expect(screen.getByText('Проверить порядок')).toBeDisabled();
  fireEvent.click(bank().getByText(steps[0].cmd));
  expect(screen.getByText('Проверить порядок')).toBeDisabled();
});

test('правильный порядок: Выполнено, объяснение каждой команды, store и XP', () => {
  render(<DockerCmdQuest steps={steps} chapterId="waves-first-network" trainerId="trainer-cmd-order" />);
  pickAll(steps);
  fireEvent.click(screen.getByText('Проверить порядок'));
  expect(screen.getByText(/Выполнено! Порядок верный/)).toBeTruthy();
  for (const s of steps) expect(screen.getByText(new RegExp(s.why))).toBeTruthy();
  expect(
    store.getProgress().trainers['waves-first-network']?.['trainer-cmd-order'],
  ).toMatchObject({ result: { solved: true, total: 4 } });
  expect(store.getXp()).toBe(15);
});

test('неправильный порядок: сообщение о первом сбитом шаге, можно переставить', () => {
  render(<DockerCmdQuest steps={steps} chapterId="waves-first-network" trainerId="trainer-cmd-order" />);
  pickAll([steps[1], steps[0], steps[2], steps[3]]);
  fireEvent.click(screen.getByText('Проверить порядок'));
  expect(screen.getByText(/Шаг 1 не на своём месте/)).toBeTruthy();
  expect(store.getXp()).toBe(0);

  // возвращаем все карточки и выстраиваем правильно
  const seq = () => within(screen.getByLabelText('Твой порядок команд'));
  for (const s of steps) fireEvent.click(seq().getByText(s.cmd));
  pickAll(steps);
  fireEvent.click(screen.getByText('Проверить порядок'));
  expect(screen.getByText(/Выполнено! Порядок верный/)).toBeTruthy();
});

test('пустой список шагов не рендерит ничего', () => {
  const { container } = render(<DockerCmdQuest steps={[]} />);
  expect(container.innerHTML).toBe('');
});
