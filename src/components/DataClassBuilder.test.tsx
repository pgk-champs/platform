import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import DataClassBuilder from './DataClassBuilder';

beforeEach(() => {
  store.__resetForTests();
});

function buildCompetitor() {
  fireEvent.change(screen.getByLabelText('имя класса'), { target: { value: 'Competitor' } });
  fireEvent.change(screen.getByLabelText('имя поля 1'), { target: { value: 'name' } });
  fireEvent.change(screen.getByLabelText('имя поля 2'), { target: { value: 'score' } });
}

test('initial state: placeholder code, unmet rules, check disabled, no demo', () => {
  render(<DataClassBuilder />);
  expect(screen.getByTestId('dcb-code').textContent).toBe('data class ___(val ___: String, val ___: Int)');
  expect(screen.getByText('Проверить класс')).toBeDisabled();
  expect(screen.queryByTestId('dcb-demo')).toBeNull();
});

test('code is generated live from class name and fields', () => {
  render(<DataClassBuilder />);
  buildCompetitor();
  expect(screen.getByTestId('dcb-code').textContent).toBe(
    'data class Competitor(val name: String, val score: Int)',
  );
});

test('valid class shows toString/equals/copy examples like in the chapter', () => {
  render(<DataClassBuilder />);
  buildCompetitor();
  expect(screen.getByTestId('dcb-demo')).toBeTruthy();
  expect(screen.getByText('val a = Competitor("Богдан", 91)')).toBeTruthy();
  expect(screen.getByText('Competitor(name=Богдан, score=91)')).toBeTruthy();
  expect(screen.getByText('true')).toBeTruthy();
  expect(screen.getByText('a.copy(score = 96)')).toBeTruthy();
  expect(screen.getByText('Competitor(name=Богдан, score=96)')).toBeTruthy();
});

test('changing a field type updates code and demo values', () => {
  render(<DataClassBuilder />);
  buildCompetitor();
  fireEvent.change(screen.getByLabelText('тип поля 2'), { target: { value: 'Boolean' } });
  expect(screen.getByTestId('dcb-code').textContent).toBe(
    'data class Competitor(val name: String, val score: Boolean)',
  );
  expect(screen.getByText('val a = Competitor("Богдан", true)')).toBeTruthy();
  // copy для Boolean подставляет противоположное значение
  expect(screen.getByText('a.copy(score = false)')).toBeTruthy();
});

test('lowercase class name and duplicate field names keep rules unmet', () => {
  render(<DataClassBuilder />);
  fireEvent.change(screen.getByLabelText('имя класса'), { target: { value: 'competitor' } });
  fireEvent.change(screen.getByLabelText('имя поля 1'), { target: { value: 'score' } });
  fireEvent.change(screen.getByLabelText('имя поля 2'), { target: { value: 'score' } });
  const rules = screen.getAllByText(/Имя класса|Имена полей/);
  expect(rules[0].className).not.toContain('dcb-rule-ok');
  expect(screen.getByText(/Имена полей не повторяются/).className).not.toContain('dcb-rule-ok');
  expect(screen.getByText('Проверить класс')).toBeDisabled();
});

test('fields can grow to 4 and shrink to 2, buttons respect the limits', () => {
  render(<DataClassBuilder />);
  const add = screen.getByText('+ поле');
  fireEvent.click(add);
  fireEvent.click(add);
  expect(screen.getByLabelText('имя поля 4')).toBeTruthy();
  expect(add).toBeDisabled();
  fireEvent.click(screen.getByLabelText('убрать поле 4'));
  fireEvent.click(screen.getByLabelText('убрать поле 3'));
  expect(screen.queryByLabelText('имя поля 3')).toBeNull();
  expect(screen.getByLabelText('убрать поле 1')).toBeDisabled();
});

test('checking a valid class marks trainer done, awards xp and shows the plaque', () => {
  render(<DataClassBuilder chapterId="classes-collections" trainerId="dcb" />);
  buildCompetitor();
  fireEvent.click(screen.getByText('Проверить класс'));
  expect(screen.getByText(/Выполнено! Класс собран/)).toBeTruthy();
  expect(store.getProgress().trainers['classes-collections']?.dcb).toMatchObject({
    result: { className: 'Competitor', fields: 2 },
  });
  expect(store.getXp()).toBe(25);
});
