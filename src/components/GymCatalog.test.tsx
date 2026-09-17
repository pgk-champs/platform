import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import { RUNNABLE } from '../lib/gym';
import GymCatalog from './GymCatalog';

// В jsdom нет стабильного crypto.subtle — подменяем digest детерминированной
// свёрткой, как в тестах HashPlayground (крипто-карточки хешируют в useEffect).
function fakeDigest(_alg: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  let h = 2166136261;
  for (const b of bytes) h = Math.imul(h ^ b, 16777619) >>> 0;
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    h = Math.imul(h ^ (i + 1), 16777619) >>> 0;
    out[i] = h & 0xff;
  }
  return Promise.resolve(out.buffer);
}

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
  vi.stubGlobal('crypto', { subtle: { digest: fakeDigest } });
});

afterEach(() => vi.unstubAllGlobals());

test('показаны все 46 механик, а не одиннадцать', () => {
  const { container } = render(<GymCatalog />);
  expect(container.querySelectorAll('.gc-card')).toHaveLength(46);
});

test('механика, которой не было в старом зале, теперь видна', () => {
  render(<GymCatalog />);
  // Раньше все три жили только внутри своей единственной главы.
  expect(screen.getByText('Охота на ошибки')).toBeInTheDocument();
  expect(screen.getByText('PoW-майнер')).toBeInTheDocument();
  expect(screen.getByText('Глазомер')).toBeInTheDocument();
});

test('незапускаемая механика ведёт на якорь в главе', () => {
  const { container } = render(<GymCatalog />);
  const card = [...container.querySelectorAll('.gc-card')].find((c) =>
    c.textContent?.includes('Охота на ошибки'),
  )!;
  const link = card.querySelector('a')!;
  expect(link.getAttribute('href')).toMatch(/^\/docs\/.+#trainer-/);
});

test('поиск сужает сетку', () => {
  const { container } = render(<GymCatalog />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'глазомер' } });
  expect(container.querySelectorAll('.gc-card')).toHaveLength(1);
});

test('чип трека отбирает механики', () => {
  const { container } = render(<GymCatalog />);
  fireEvent.click(screen.getByRole('button', { name: /^Блокчейн/ }));
  const n = container.querySelectorAll('.gc-card').length;
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThan(46);
});

test('пустая выдача объясняет себя, а не молчит', () => {
  render(<GymCatalog />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'йцукенг' } });
  expect(screen.getByText(/ничего не нашлось/i)).toBeInTheDocument();
});

test('честная строка про прогресс на месте', () => {
  render(<GymCatalog />);
  expect(screen.getByText(/не идут в прогресс глав/i)).toBeInTheDocument();
});

test('метка «запускается» не врёт', () => {
  // RUNNABLE живёт в lib (её читает чип), RUNNERS — в компоненте (у них
  // демо-данные). Два списка об одном и том же: разойдутся — чип насчитает
  // кнопок больше, чем их есть.
  const { container } = render(<GymCatalog />);
  expect(container.querySelectorAll('.gc-tag-run')).toHaveLength(RUNNABLE.length);
  expect(container.querySelectorAll('.gc-run')).toHaveLength(RUNNABLE.length);
});
