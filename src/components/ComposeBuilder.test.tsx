import { render, screen, fireEvent, within } from '@testing-library/react';
import { store } from '../lib/store';
import ComposeBuilder, { shuffledIndices } from './ComposeBuilder';

const lines = ['services:', '  node-0:', '    image: wavesenterprise/node:v1.16.0', '    ports:'];

beforeEach(() => {
  store.__resetForTests();
});

function bank() {
  return within(screen.getByLabelText('Строки файла'));
}
function file() {
  return within(screen.getByLabelText('Твой docker-compose.yml'));
}

test('строки перемешаны, но детерминированно и не в готовый ответ', () => {
  const idx = shuffledIndices(lines.length, lines.join('\n'));
  expect(idx).toEqual(shuffledIndices(lines.length, lines.join('\n')));
  expect(idx).not.toEqual([0, 1, 2, 3]);
  expect([...idx].sort()).toEqual([0, 1, 2, 3]);
});

test('сборка в правильном порядке: Выполнено, store и XP', () => {
  render(<ComposeBuilder lines={lines} chapterId="waves-first-network" trainerId="trainer-compose-builder" />);
  for (const l of lines) fireEvent.click(bank().getByText(l.trim()));
  expect(screen.getByText(/Выполнено! Файл собран правильно/)).toBeTruthy();
  expect(
    store.getProgress().trainers['waves-first-network']?.['trainer-compose-builder'],
  ).toMatchObject({ result: { solved: true } });
  expect(store.getXp()).toBe(10);
});

test('неправильный порядок: сообщение с номером первой сбитой строки', () => {
  render(<ComposeBuilder lines={lines} />);
  fireEvent.click(bank().getByText('node-0:'));
  for (const l of ['services:', 'image: wavesenterprise/node:v1.16.0', 'ports:']) {
    fireEvent.click(bank().getByText(l));
  }
  expect(screen.getByText(/Строка 1 не на своём месте/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
});

test('клик по собранной строке возвращает её, Сбросить очищает всё', () => {
  render(<ComposeBuilder lines={lines} />);
  fireEvent.click(bank().getByText('services:'));
  fireEvent.click(file().getByText('services:'));
  expect(screen.queryByLabelText('Твой docker-compose.yml')!.textContent).toContain('Нажимай строки внизу');

  fireEvent.click(bank().getByText('services:'));
  fireEvent.click(bank().getByText('node-0:'));
  fireEvent.click(screen.getByText('Сбросить'));
  expect(file().queryByText('services:')).toBeNull();
});

test('пустой список строк не рендерит ничего', () => {
  const { container } = render(<ComposeBuilder lines={[]} />);
  expect(container.innerHTML).toBe('');
});
