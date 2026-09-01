import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import PermQuest, { type PermScenario } from './PermQuest';

const scenarios: PermScenario[] = [
  {
    file: 'secret.txt',
    perm: '640',
    owner: 'alice',
    group: 'dev',
    user: 'bob',
    userGroups: ['dev'],
    action: 'write',
    correct: 'read-only',
    why: 'bob не владелец, но в группе dev: у группы права r-- — только чтение.',
  },
  {
    file: 'run.sh',
    perm: '700',
    owner: 'alice',
    group: 'dev',
    user: 'bob',
    userGroups: ['dev'],
    action: 'execute',
    correct: 'no',
    why: 'Все права только у владельца alice, у группы и остальных — ничего.',
  },
];

beforeEach(() => {
  store.__resetForTests();
});

test('renders scenario card: perm in both notations, question, progress', () => {
  render(<PermQuest scenarios={scenarios} />);
  expect(screen.getByText('Сценарий 1 из 2')).toBeTruthy();
  expect(screen.getByText('640 · rw-r-----')).toBeTruthy();
  expect(screen.getByText('Может ли bob изменить secret.txt?')).toBeTruthy();
});

test('correct answer shows explanation and unlocks next scenario', () => {
  render(<PermQuest scenarios={scenarios} />);
  fireEvent.click(screen.getByText('Только прочитать'));
  expect(screen.getByText('Верно!')).toBeTruthy();
  expect(screen.getByText(/у группы права r--/)).toBeTruthy();
  fireEvent.click(screen.getByText('Дальше →'));
  expect(screen.getByText('Сценарий 2 из 2')).toBeTruthy();
  expect(screen.getByText('Может ли bob запустить run.sh?')).toBeTruthy();
});

test('wrong answer shows explanation, highlights the correct option, locks buttons', () => {
  render(<PermQuest scenarios={scenarios} />);
  const wrong = screen.getByText('Да');
  fireEvent.click(wrong);
  expect(screen.getByText('Не совсем.')).toBeTruthy();
  expect(wrong.className).toContain('pq-wrong');
  expect(screen.getByText('Только прочитать').className).toContain('pq-right');
  expect(screen.getByText('Нет')).toBeDisabled();
});

test('perfect run finishes, marks trainer done and awards xp', () => {
  render(<PermQuest scenarios={scenarios} chapterId="linux" trainerId="perm-quest" />);
  fireEvent.click(screen.getByText('Только прочитать'));
  fireEvent.click(screen.getByText('Дальше →'));
  fireEvent.click(screen.getByText('Нет'));
  fireEvent.click(screen.getByText('Показать результат'));
  expect(screen.getByText(/Все сценарии пройдены: 2 из 2/)).toBeTruthy();
  expect(store.getProgress().trainers.linux?.['perm-quest']).toMatchObject({
    result: { correct: 2, total: 2 },
  });
  expect(store.getXp()).toBe(25);
});

test('imperfect run records result, gives no xp and offers a retry', () => {
  render(<PermQuest scenarios={scenarios} chapterId="linux" trainerId="perm-quest" />);
  fireEvent.click(screen.getByText('Да')); // wrong
  fireEvent.click(screen.getByText('Дальше →'));
  fireEvent.click(screen.getByText('Нет')); // correct
  fireEvent.click(screen.getByText('Показать результат'));
  expect(screen.getByText(/Верно 1 из 2/)).toBeTruthy();
  expect(store.getProgress().trainers.linux?.['perm-quest']).toMatchObject({
    result: { correct: 1, total: 2 },
  });
  expect(store.getXp()).toBe(0);

  fireEvent.click(screen.getByText('Попробовать ещё раз'));
  expect(screen.getByText('Сценарий 1 из 2')).toBeTruthy();
});

test('empty scenarios render nothing without crashing', () => {
  const { container } = render(<PermQuest scenarios={[]} />);
  expect(container.innerHTML).toBe('');
});
