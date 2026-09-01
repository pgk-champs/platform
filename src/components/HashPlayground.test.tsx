import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { store } from '../lib/store';
import HashPlayground from './HashPlayground';

// В jsdom нет crypto.subtle — подменяем digest детерминированной функцией
// (FNV-подобная свёртка), чувствительной к каждому байту входа.
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
  store.__resetForTests();
  vi.stubGlobal('crypto', { subtle: { digest: fakeDigest } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const currentHash = (container: HTMLElement) =>
  container.querySelector('.hp-hash:not(.hp-hash-prev)')?.textContent ?? '';

test('computes 64-char hex hash of the initial text on mount', async () => {
  const { container } = render(<HashPlayground />);
  await waitFor(() => expect(currentHash(container)).toMatch(/^[0-9a-f]{64}$/));
  // до первого изменения сравнивать не с чем
  expect(screen.queryByText('Предыдущий SHA-256')).toBeNull();
  expect(screen.queryByText(/Изменилось hex-символов/)).toBeNull();
});

test('editing text shows previous hash for comparison and counts changed hex chars', async () => {
  const { container } = render(<HashPlayground />);
  await waitFor(() => expect(currentHash(container)).toMatch(/^[0-9a-f]{64}$/));
  const before = currentHash(container);

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Привет, блокчейн!!' } });

  await screen.findByText('Предыдущий SHA-256');
  const prev = container.querySelector('.hp-hash-prev')?.textContent;
  expect(prev).toBe(before);
  expect(currentHash(container)).not.toBe(before);
  const counter = screen.getByText(/Изменилось hex-символов: \d+ из 64/);
  expect(counter.textContent).toContain('лавинный эффект');
  // изменившиеся символы подсвечены
  expect(container.querySelectorAll('.hp-diff').length).toBeGreaterThan(0);
});

test('with chapterId/trainerId the first observed change marks trainer done and awards xp', async () => {
  const { container } = render(<HashPlayground chapterId="crypto" trainerId="hash" />);
  await waitFor(() => expect(currentHash(container)).toMatch(/^[0-9a-f]{64}$/));

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'другой текст' } });

  await waitFor(() => expect(store.getProgress().trainers.crypto?.hash).toBeTruthy());
  expect(store.getXp()).toBe(10);
  await screen.findByText(/\+10 XP/);
});

test('without chapterId/trainerId nothing is written to the store', async () => {
  const { container } = render(<HashPlayground />);
  await waitFor(() => expect(currentHash(container)).toMatch(/^[0-9a-f]{64}$/));

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'другой текст' } });
  await screen.findByText('Предыдущий SHA-256');

  expect(store.getProgress().trainers).toEqual({});
  expect(store.getXp()).toBe(0);
});
