import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { store } from '../lib/store';
import PowMiner from './PowMiner';

// В jsdom нет crypto.subtle — детерминированный мок: вход, оканчивающийся
// на «7» после слова test, даёт хеш с нулевым первым байтом (hex «00…»),
// всё остальное — с первым байтом 0xff. Майнер с данными 'test' и
// сложностью 1 обязан найти nonce = 7 в первой же порции перебора.
function fakeDigest(_alg: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  const text = new TextDecoder().decode(bytes);
  const out = new Uint8Array(32);
  let h = 2166136261;
  for (const b of bytes) h = Math.imul(h ^ b, 16777619) >>> 0;
  for (let i = 0; i < 32; i += 1) {
    h = Math.imul(h ^ (i + 1), 16777619) >>> 0;
    out[i] = h & 0xff;
  }
  out[0] = text === 'test7' ? 0x00 : 0xff;
  return Promise.resolve(out.buffer);
}

beforeEach(() => {
  store.__resetForTests();
  vi.stubGlobal('crypto', { subtle: { digest: fakeDigest } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function setup(props: { chapterId?: string; trainerId?: string } = {}) {
  render(<PowMiner {...props} />);
  const data = screen.getByLabelText('Данные блока');
  fireEvent.change(data, { target: { value: 'test' } });
  // живой хеш пересчитался под новые данные
  await waitFor(() => expect(document.querySelector('.pm-hash')!.textContent).toMatch(/^ff/));
  return data;
}

test('renders data, nonce and difficulty selector; difficulty 1 is default', async () => {
  await setup();
  expect(screen.getByLabelText(/nonce/)).toBeTruthy();
  const pressed = document.querySelector('.pm-diff button[aria-pressed="true"]')!;
  expect(pressed.textContent).toContain('1 ноль');
  expect(pressed.textContent).toContain('16');
});

test('mining iterates nonce until hash starts with a zero, marks trainer done and awards xp', async () => {
  await setup({ chapterId: 'what-is-blockchain', trainerId: 'trainer-pow-miner' });

  fireEvent.click(screen.getByText('Майнить'));

  await waitFor(() => expect(screen.getByText(/Выполнено!/)).toBeTruthy());
  expect(screen.getByText(/nonce = 7/)).toBeTruthy();
  expect(screen.getByText(/попыток: 8/)).toBeTruthy();
  expect(document.querySelector('.pm-zeros')!.textContent).toBe('0');

  const rec = store.getProgress().trainers['what-is-blockchain']?.['trainer-pow-miner'];
  expect(rec?.result).toEqual({ nonce: 7, difficulty: 1, attempts: 8 });
  expect(store.getXp()).toBe(10);
  expect(screen.getByText(/\+10 XP/)).toBeTruthy();
});

test('without chapterId/trainerId a successful mine writes nothing to the store', async () => {
  await setup();
  fireEvent.click(screen.getByText('Майнить'));
  await waitFor(() => expect(screen.getByText(/Выполнено!/)).toBeTruthy());
  expect(store.getProgress().trainers).toEqual({});
  expect(store.getXp()).toBe(0);
});

test('stop button cancels mining', async () => {
  await setup();
  // сложность 4: с мок-хешами ff… решение не найдётся никогда — перебор идёт порциями
  fireEvent.click(screen.getByText(/4 нуля/));
  fireEvent.click(screen.getByText('Майнить'));
  expect(screen.getByText('Стоп')).toBeTruthy();

  fireEvent.click(screen.getByText('Стоп'));
  await waitFor(() => expect(screen.getByText('Майнить')).toBeTruthy());
  expect(screen.queryByText(/Выполнено!/)).toBeNull();
});

test('уход со страницы (unmount) останавливает перебор', async () => {
  const digest = vi.fn(fakeDigest);
  vi.stubGlobal('crypto', { subtle: { digest } });
  const { unmount } = render(<PowMiner />);
  fireEvent.change(screen.getByLabelText('Данные блока'), { target: { value: 'test' } });
  // сложность 4: с мок-хешами ff… решение не найдётся никогда — цикл вечный
  fireEvent.click(screen.getByText(/4 нуля/));
  fireEvent.click(screen.getByText('Майнить'));
  await waitFor(() => expect(digest.mock.calls.length).toBeGreaterThan(64));

  unmount();
  await new Promise((r) => setTimeout(r, 5)); // даём циклу дойти до проверки отмены
  const after = digest.mock.calls.length;
  await new Promise((r) => setTimeout(r, 50));
  expect(digest.mock.calls.length).toBe(after);
});
