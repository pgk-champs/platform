import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { store } from '../lib/store';
import SignDemo from './SignDemo';

// В jsdom нет crypto.subtle — мокаем ECDSA детерминированной свёрткой:
// «подпись» вычисляется из байтов сообщения, verify пересчитывает её заново
// и сравнивает, поэтому изменённое сообщение честно проваливает проверку.
function fakeSig(data: BufferSource): ArrayBuffer {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  let h = 2166136261;
  for (const b of bytes) h = Math.imul(h ^ b, 16777619) >>> 0;
  const out = new Uint8Array(64);
  for (let i = 0; i < 64; i += 1) {
    h = Math.imul(h ^ (i + 1), 16777619) >>> 0;
    out[i] = h & 0xff;
  }
  return out.buffer;
}

const fakeSubtle = {
  generateKey: () => Promise.resolve({ publicKey: { type: 'public' }, privateKey: { type: 'private' } }),
  exportKey: () => Promise.resolve(new Uint8Array(65).fill(0xab).buffer),
  sign: (_a: unknown, _k: unknown, data: BufferSource) => Promise.resolve(fakeSig(data)),
  verify: (_a: unknown, _k: unknown, sig: BufferSource, data: BufferSource) => {
    const a = new Uint8Array(sig instanceof Uint8Array ? sig.buffer : (sig as ArrayBuffer));
    const b = new Uint8Array(fakeSig(data));
    return Promise.resolve(a.length === b.length && a.every((v, i) => v === b[i]));
  },
};

beforeEach(() => {
  store.__resetForTests();
  vi.stubGlobal('crypto', { subtle: fakeSubtle });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('до создания ключей «Подписать» и «Проверить» неактивны; ключи показывают публичный укороченно', async () => {
  render(<SignDemo />);
  expect(screen.getByText('Подписать')).toBeDisabled();
  expect(screen.getByText('Проверить')).toBeDisabled();

  fireEvent.click(screen.getByText('Создать ключи'));
  await screen.findByText('Открытый ключ (можно показывать всем)');
  const pub = screen.getByText(/^ab/).textContent!;
  expect(pub).toContain('…');
  expect(pub.length).toBeLessThan(40); // укороченный, не весь hex
  expect(screen.getByText('Подписать')).not.toBeDisabled();
});

test('подписать → проверить: зелёная галочка, подпись верна', async () => {
  render(<SignDemo />);
  fireEvent.click(screen.getByText('Создать ключи'));
  await screen.findByText('Открытый ключ (можно показывать всем)');

  fireEvent.click(screen.getByText('Подписать'));
  await screen.findByText(/Подпись \(ECDSA P-256/);

  fireEvent.click(screen.getByText('Проверить'));
  await screen.findByText(/✓ Подпись верна/);
});

test('изменение сообщения после подписи: проверка падает с объяснением про точное содержимое', async () => {
  render(<SignDemo />);
  fireEvent.click(screen.getByText('Создать ключи'));
  await screen.findByText('Открытый ключ (можно показывать всем)');
  fireEvent.click(screen.getByText('Подписать'));
  await screen.findByText(/Подпись \(ECDSA P-256/);

  fireEvent.change(screen.getByLabelText('Сообщение'), { target: { value: 'Alice -> Bob: 500 монет' } });
  await screen.findByText(/Сообщение изменилось после подписания/);

  fireEvent.click(screen.getByText('Проверить'));
  await screen.findByText(/✗ Проверка провалилась/);
  expect(screen.getByText(/привязана к точному содержимому/)).toBeTruthy();
});

test('увидел и успех, и провал → «Выполнено!», запись в store и XP', async () => {
  render(<SignDemo chapterId="what-is-blockchain" trainerId="trainer-sign-demo" />);
  fireEvent.click(screen.getByText('Создать ключи'));
  await screen.findByText('Открытый ключ (можно показывать всем)');
  fireEvent.click(screen.getByText('Подписать'));
  await screen.findByText(/Подпись \(ECDSA P-256/);

  fireEvent.click(screen.getByText('Проверить'));
  await screen.findByText(/✓ Подпись верна/);
  expect(screen.queryByText(/Выполнено!/)).toBeNull();

  fireEvent.change(screen.getByLabelText('Сообщение'), { target: { value: 'подменённый текст' } });
  fireEvent.click(screen.getByText('Проверить'));
  await screen.findByText(/Выполнено!/);

  expect(store.getProgress().trainers['what-is-blockchain']?.['trainer-sign-demo']).toBeTruthy();
  expect(store.getXp()).toBeGreaterThan(0);

  // повторный провал/успех не начисляет XP второй раз
  const xp = store.getXp();
  fireEvent.click(screen.getByText('Проверить'));
  await waitFor(() => expect(store.getXp()).toBe(xp));
});
