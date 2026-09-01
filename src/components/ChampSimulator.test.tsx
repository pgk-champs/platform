import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { store } from '../lib/store';
import ChampSimulator from './ChampSimulator';

beforeEach(() => {
  store.__resetForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

function startModule(title: string) {
  const card = screen.getByText(title).closest('.sim-card') as HTMLElement;
  fireEvent.click(within(card).getByText('Начать спринт'));
}

test('select screen lists official modules with time limit, points and "not yet passed"', () => {
  render(<ChampSimulator />);
  const card = screen.getByText('Ж. Подготовка продукта').closest('.sim-card') as HTMLElement;
  expect(within(card).getByText(/⏱ 1:00:00/)).toBeTruthy();
  expect(within(card).getByText(/7 баллов/)).toBeTruthy();
  expect(screen.getAllByText('Ещё не пройден').length).toBeGreaterThan(0);
});

test('starting a module opens the sprint screen at its official time limit', () => {
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  expect(screen.getByText('1:00:00')).toBeTruthy();
  expect(screen.getByText('Набрано 0 из 7')).toBeTruthy();
});

test('checking a measurable item adds its score to the live total', () => {
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]); // «Создана презентация.» — 0.4
  expect(screen.getByText('Набрано 0.4 из 7')).toBeTruthy();
  fireEvent.click(checkboxes[0]); // снятие галочки возвращает 0
  expect(screen.getByText('Набрано 0 из 7')).toBeTruthy();
});

test('dragging a judgement slider adds its value to the live total', () => {
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  const sliders = screen.getAllByRole('slider');
  fireEvent.change(sliders[0], { target: { value: '0.9' } }); // максимум первого судейского аспекта
  expect(screen.getByText('Набрано 0.9 из 7')).toBeTruthy();
  fireEvent.change(sliders[0], { target: { value: '0.3' } });
  expect(screen.getByText('Набрано 0.3 из 7')).toBeTruthy();
});

test('timer counts down; pause stops it; reset restores full time and clears checks', () => {
  vi.useFakeTimers();
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getAllByRole('checkbox')[0]);

  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(screen.getByText('59:55')).toBeTruthy();

  fireEvent.click(screen.getByText('Пауза'));
  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(screen.getByText('59:55')).toBeTruthy(); // на паузе не двигается

  fireEvent.click(screen.getByText('Сбросить'));
  expect(screen.getByText('1:00:00')).toBeTruthy();
  expect(screen.getByText('Набрано 0 из 7')).toBeTruthy();
});

test('timer reaching zero finishes the sprint automatically and logs the run', () => {
  vi.useFakeTimers();
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getAllByRole('checkbox')[0]); // 0.4 из 7 — низкий процент
  act(() => {
    vi.advanceTimersByTime(60 * 60 * 1000);
  });
  expect(screen.getByText('Потренируйся ещё')).toBeTruthy();
  expect(screen.getByText(/Набрано 0.4 из 7/)).toBeTruthy();
  expect(store.sim.stats('zh').count).toBe(1);
});

test('finishing a perfect module scores full marks, "Отлично" and XP once per visit', () => {
  render(<ChampSimulator />);
  startModule('Г. Хранение информации'); // все 30 критериев измеримые, максимум 10 баллов
  for (const cb of screen.getAllByRole('checkbox')) fireEvent.click(cb);
  fireEvent.click(screen.getByText('Завершить спринт'));

  expect(screen.getByText('Отлично')).toBeTruthy();
  expect(screen.getByText(/Набрано 10 из 10/)).toBeTruthy();
  expect(store.getXp()).toBe(20); // 10 баллов × 2 XP
  const stats = store.sim.stats('g');
  expect(stats.count).toBe(1);
  expect(stats.best).toMatchObject({ score: 10, maxScore: 10 });

  // повторный прогон в той же сессии обновляет попытки, но не удваивает XP
  fireEvent.click(screen.getByText('Попробовать снова'));
  expect(screen.getByText('Набрано 0 из 10')).toBeTruthy(); // чек-лист сброшен
  fireEvent.click(screen.getByText('Завершить спринт')); // ничего не отмечено — 0 баллов
  expect(store.getXp()).toBe(20); // не изменилось
  expect(store.sim.stats('g').count).toBe(2);
});

test('"Отправить в лидерборд" opens a leaderboard issue with the correct JSON', () => {
  vi.useFakeTimers();
  const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getAllByRole('checkbox')[0]); // 0.4 из 7
  act(() => {
    vi.advanceTimersByTime(10_000); // 10с прошло из отведённого часа
  });
  fireEvent.click(screen.getByText('Завершить спринт'));

  fireEvent.click(screen.getByText('Отправить в лидерборд 🏆'));
  expect(openSpy).toHaveBeenCalledTimes(1);
  const url = new URL(openSpy.mock.calls[0][0] as string);
  expect(url.origin + url.pathname).toBe('https://github.com/pgk-champs/leaderboard/issues/new');
  expect(url.searchParams.get('template')).toBe('result.yml');
  expect(url.searchParams.get('title')).toBe('Результат: Ж. Подготовка продукта');
  const payload = JSON.parse(url.searchParams.get('result') as string);
  expect(payload.module).toBe('zh');
  expect(payload.score).toBe(0.4);
  expect(payload.maxScore).toBe(7);
  expect(payload.durationSec).toBe(10);
  expect(payload.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  openSpy.mockRestore();
});

test('"Выбрать другой модуль" returns to the module grid', () => {
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getByText('Завершить спринт'));
  fireEvent.click(screen.getByText('Выбрать другой модуль'));
  expect(screen.getAllByText('Начать спринт').length).toBe(7);
  expect(screen.getAllByText(/⏱/).length).toBeGreaterThan(1);
});
