import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import MemoryViz, { VAL_ERROR } from './MemoryViz';

beforeEach(() => {
  store.__resetForTests();
});

test('renders both cells with initial values', () => {
  render(<MemoryViz />);
  expect(screen.getByText('val x')).toBeTruthy();
  expect(screen.getByText('var y')).toBeTruthy();
  expect(screen.getByText('5')).toBeTruthy();
  expect(screen.getByText('0')).toBeTruthy();
  expect(screen.queryByText(VAL_ERROR)).toBeNull();
});

test('assigning to var changes its value', () => {
  render(<MemoryViz />);
  const [, varBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(varBtn);
  expect(screen.getByText('15')).toBeTruthy();
  fireEvent.click(varBtn);
  expect(screen.getByText('42')).toBeTruthy();
  // val untouched
  expect(screen.getByText('5')).toBeTruthy();
});

test('assigning to val shows the real compiler error, value stays', () => {
  render(<MemoryViz />);
  const [valBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(valBtn);
  expect(screen.getByText(VAL_ERROR)).toBeTruthy();
  expect(screen.getByText('5')).toBeTruthy();
  expect(screen.getByText('Создать новую val поверх')).toBeTruthy();
});

test('creating a new val on top adds the new cell', () => {
  render(<MemoryViz />);
  const [valBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(valBtn);
  fireEvent.click(screen.getByText('Создать новую val поверх'));
  expect(screen.getByText('val newX')).toBeTruthy();
  expect(screen.getByText('120')).toBeTruthy();
});

test('секция «значение vs ссылка»: две val-переменные, один общий MutableList', () => {
  const { container } = render(<MemoryViz />);
  expect(screen.getByText('Значение vs ссылка')).toBeTruthy();
  expect(screen.getAllByText('val a').length).toBeGreaterThan(0);
  expect(screen.getAllByText('val b').length).toBeGreaterThan(0);
  expect(screen.getAllByText('MutableList').length).toBeGreaterThan(0);
  expect(screen.getByText('Алиса')).toBeTruthy();
  expect(screen.getByText('Богдан')).toBeTruthy();
  // обе стрелки нарисованы
  expect(container.querySelectorAll('.mv2-arrow').length).toBe(2);
  // факт из главы classes-collections
  expect(container.textContent).toContain('Коробка прибита, содержимое меняется');
});

test('add через a виден и через b: объект один, заметка объясняет почему', () => {
  const { container } = render(<MemoryViz />);
  fireEvent.click(screen.getByText('a.add("Соня")'));
  expect(screen.getByText('Соня')).toBeTruthy();
  expect(container.textContent).toContain('объект-то один');
  // анимация течёт по стрелке той переменной, через которую добавляли
  expect(container.querySelectorAll('.mv2-arrow-active').length).toBe(1);
  // следующее имя добавляется уже через b — в тот же список
  fireEvent.click(screen.getByText('b.add("Тимур")'));
  expect(screen.getByText('Тимур')).toBeTruthy();
  expect(container.querySelectorAll('.mv2-item').length).toBe(4);
});

test('список конечен: после всех имён кнопки отключаются', () => {
  render(<MemoryViz />);
  for (const name of ['Соня', 'Тимур', 'Ринат', 'Диана']) {
    fireEvent.click(screen.getByText(`a.add("${name}")`));
  }
  const full = screen.getAllByText('список полон');
  expect(full.length).toBe(2);
  full.forEach((btn) => expect((btn as HTMLButtonElement).disabled).toBe(true));
});

test('all three steps mark trainer done and award xp once', () => {
  render(<MemoryViz chapterId="kotlin-vars" trainerId="trainer-memory-viz" />);
  const [valBtn, varBtn] = screen.getAllByText('Присвоить новое значение');
  fireEvent.click(varBtn);
  fireEvent.click(valBtn);
  fireEvent.click(screen.getByText('Создать новую val поверх'));
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers['kotlin-vars']?.['trainer-memory-viz']).toMatchObject({
    result: { varAssigned: true, valError: true, newVal: true },
  });
  expect(store.getXp()).toBe(25);
  // further clicks do not double the reward
  fireEvent.click(varBtn);
  expect(store.getXp()).toBe(25);
});
