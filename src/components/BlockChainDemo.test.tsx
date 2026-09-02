import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { store } from '../lib/store';
import BlockChainDemo from './BlockChainDemo';

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

const okBlocks = (c: HTMLElement) => c.querySelectorAll('.bcd-block.bcd-ok').length;

async function renderSealed(props?: { chapterId?: string; trainerId?: string }) {
  const utils = render(<BlockChainDemo {...props} />);
  await waitFor(() => expect(okBlocks(utils.container)).toBe(4));
  return utils;
}

test('seals a valid 4-block chain on mount: genesis prevHash, all blocks ok, mining disabled', async () => {
  const { container } = await renderSealed();
  expect(screen.getAllByText('✓ в порядке').length).toBe(4);
  // prevHash первого блока — генезис из нулей (усечённый вид)
  expect(container.textContent).toContain('0000000000…000000');
  expect(screen.getByRole('button', { name: /Пересчитать цепь/ })).toBeDisabled();
  expect(screen.getByText(/Цепь цела/)).toBeTruthy();
});

test('tampering with block 2 marks it changed and breaks blocks 3-4', async () => {
  const { container } = await renderSealed();

  const inputs = screen.getAllByRole('textbox');
  fireEvent.change(inputs[1], { target: { value: 'Боб → Ира: 999999 монет' } });

  await waitFor(() => expect(container.querySelectorAll('.bcd-block.bcd-broken').length).toBe(2));
  expect(container.querySelectorAll('.bcd-block.bcd-tampered').length).toBe(1);
  expect(okBlocks(container)).toBe(1); // блок 1 до места разрыва остаётся зелёным
  expect(screen.getAllByText(/цепь порвана/i).length).toBeGreaterThanOrEqual(2);
  expect(screen.getByRole('button', { name: /Пересчитать цепь/ })).not.toBeDisabled();
});

test('mining repairs the chain, explains why, marks trainer done and awards xp', async () => {
  const { container } = await renderSealed({ chapterId: 'crypto', trainerId: 'chain' });

  fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'подделка' } });
  await waitFor(() => expect(container.querySelectorAll('.bcd-block.bcd-broken').length).toBe(2));

  fireEvent.click(screen.getByRole('button', { name: /Пересчитать цепь/ }));

  await waitFor(() => expect(okBlocks(container)).toBe(4));
  expect(container.querySelectorAll('.bcd-block.bcd-broken').length).toBe(0);
  await screen.findByText(/Цепь пересчитана/);
  expect(store.getProgress().trainers.crypto?.chain).toMatchObject({ result: { repaired: true } });
  expect(store.getXp()).toBe(15);
  await screen.findByText(/\+15 XP/);
});

test('without chapterId/trainerId break-and-repair writes nothing to the store', async () => {
  const { container } = await renderSealed();

  fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: 'подделка' } });
  await waitFor(() =>
    expect(container.querySelectorAll('.bcd-block.bcd-broken').length).toBeGreaterThan(0),
  );
  fireEvent.click(screen.getByRole('button', { name: /Пересчитать цепь/ }));
  await waitFor(() => expect(okBlocks(container)).toBe(4));

  await screen.findByText(/Цепь пересчитана/);
  expect(store.getProgress().trainers).toEqual({});
  expect(store.getXp()).toBe(0);
});
