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

// Чекбоксы критериев (без служебного «звук по окончании» из панели перерывов).
function criteriaCheckboxes() {
  return screen.getAllByRole('checkbox').filter((cb) => cb.closest('.sim-item'));
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
  const checkboxes = criteriaCheckboxes();
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
  fireEvent.click(criteriaCheckboxes()[0]);

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
  fireEvent.click(criteriaCheckboxes()[0]); // 0.4 из 7 — низкий процент
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
  for (const cb of criteriaCheckboxes()) fireEvent.click(cb);
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
  fireEvent.click(criteriaCheckboxes()[0]); // 0.4 из 7
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

// --- sim-v2: перерывы + «чистый таймер» ---

test('break freezes the main timer, ticks down itself and is logged in card and store', () => {
  vi.useFakeTimers();
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(screen.getByText('59:55')).toBeTruthy();

  fireEvent.click(screen.getByText('Перерыв 10 мин'));
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  expect(screen.getByText('59:55')).toBeTruthy(); // основной таймер замер
  expect(screen.getByText('Перерыв: 9:00')).toBeTruthy(); // перерыв тикает вниз

  fireEvent.click(screen.getByText('Завершить перерыв')); // досрочно, отгуляна 1 минута
  act(() => {
    vi.advanceTimersByTime(1_000);
  });
  expect(screen.getByText('59:54')).toBeTruthy(); // основной снова идёт

  fireEvent.click(screen.getByText('Завершить спринт'));
  expect(screen.getByText(/Перерывы: 1, суммарно 1:00/)).toBeTruthy();
  expect(store.sim.stats('zh').runs[0].breaks).toEqual({ count: 1, totalSec: 60 });
});

test('custom break input starts a break of the given minutes', () => {
  vi.useFakeTimers();
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.change(screen.getByLabelText('Свой перерыв, минут'), { target: { value: '5' } });
  fireEvent.click(screen.getByText('Свой перерыв'));
  expect(screen.getByText('Перерыв: 5:00')).toBeTruthy();
});

test('run without breaks stores no breaks field and shows no breaks row', () => {
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getByText('Завершить спринт'));
  expect(screen.queryByText(/Перерывы:/)).toBeNull();
  expect(store.sim.stats('zh').runs[0].breaks).toBeUndefined();
});

test('break end plays a beep only when the sound checkbox is on', () => {
  vi.useFakeTimers();
  const osc = {
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    onended: null as null | (() => void),
  };
  const gain = { connect: vi.fn(), gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } };
  const ctx = { createOscillator: () => osc, createGain: () => gain, destination: {}, currentTime: 0, close: vi.fn() };
  const ctorSpy = vi.fn(() => ctx);
  vi.stubGlobal('AudioContext', ctorSpy);

  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');

  // без галочки — тишина
  fireEvent.click(screen.getByText('Перерыв 10 мин'));
  act(() => {
    vi.advanceTimersByTime(600_000);
  });
  expect(ctorSpy).not.toHaveBeenCalled();

  // с галочкой — короткий beep
  fireEvent.click(screen.getByLabelText('звук по окончании'));
  fireEvent.click(screen.getByText('Перерыв 10 мин'));
  act(() => {
    vi.advanceTimersByTime(600_000);
  });
  expect(ctorSpy).toHaveBeenCalledTimes(1);
  expect(osc.start).toHaveBeenCalled();
  expect(store.sim.stats('zh').count).toBe(0); // спринт ещё идёт, перерывы копятся в логе

  fireEvent.click(screen.getByText('Завершить спринт'));
  expect(store.sim.stats('zh').runs[0].breaks).toEqual({ count: 2, totalSec: 1200 });

  vi.unstubAllGlobals();
});

test('clean timer requests fullscreen and shows a huge-timer overlay; exit closes it', () => {
  const req = vi.fn().mockResolvedValue(undefined);
  (document.documentElement as unknown as { requestFullscreen: unknown }).requestFullscreen = req;
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getByText('Чистый таймер'));
  expect(req).toHaveBeenCalledTimes(1);

  const zen = document.querySelector('.sim-zen') as HTMLElement;
  expect(zen).toBeTruthy();
  expect(within(zen).getByText('1:00:00')).toBeTruthy(); // огромные цифры времени
  expect(within(zen).getByText('Ж. Подготовка продукта')).toBeTruthy(); // название модуля
  expect(within(zen).getByText('Набрано 0 из 7')).toBeTruthy(); // счёт

  fireEvent.click(within(zen).getByText('Выйти'));
  expect(document.querySelector('.sim-zen')).toBeNull();
  delete (document.documentElement as unknown as { requestFullscreen?: unknown }).requestFullscreen;
});

test('clean timer falls back to a plain overlay when Fullscreen API is unavailable', () => {
  // jsdom не реализует requestFullscreen — это и есть fallback-сценарий
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getByText('Чистый таймер'));
  expect(document.querySelector('.sim-zen')).toBeTruthy();
});

test('clean timer works during a break: shows the break countdown', () => {
  vi.useFakeTimers();
  render(<ChampSimulator />);
  startModule('Ж. Подготовка продукта');
  fireEvent.click(screen.getByText('Перерыв 15 мин'));
  fireEvent.click(screen.getByText('Чистый таймер'));

  const zen = document.querySelector('.sim-zen') as HTMLElement;
  expect(within(zen).getByText('Перерыв')).toBeTruthy();
  expect(within(zen).getByText('15:00')).toBeTruthy();
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  expect(within(zen).getByText('14:00')).toBeTruthy();
});
