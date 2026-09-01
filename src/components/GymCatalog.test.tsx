import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
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
  store.__resetForTests();
  vi.stubGlobal('crypto', { subtle: { digest: fakeDigest } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('каталог рендерит все секции', () => {
  render(<GymCatalog />);
  for (const section of ['Печать', 'Терминал', 'Git', 'Крипто', 'Compose', 'Права', 'Клавиши', 'Разное']) {
    expect(screen.getByRole('heading', { level: 2, name: section })).toBeInTheDocument();
  }
});

test('каждая карточка подписана главой со ссылкой', () => {
  render(<GymCatalog />);
  const refs = screen.getAllByText(/встречается в главе/);
  expect(refs).toHaveLength(11);
  // Ссылка ведёт на главу по пути из knowledge-map (без .mdx).
  const typingLink = screen.getByRole('link', { name: '«Печать и клавиатура»' });
  expect(typingLink).toHaveAttribute('href', '/docs/foundation/typing');
});

test('карточки тренажёров на месте', () => {
  render(<GymCatalog />);
  for (const name of [
    'Слепая печать',
    'Терминал Linux',
    'Git-тренажёр',
    'Хеш-площадка',
    'Цепочка блоков',
    'Цифровая подпись',
    'Конструктор Compose-экрана',
    'Калькулятор chmod',
    'Горячие клавиши IDE',
    'Собери фразу',
    'Предскажи вывод',
  ]) {
    expect(screen.getByText(name)).toBeInTheDocument();
  }
});

test('git-сценарии переключаются', () => {
  render(<GymCatalog />);
  const branches = screen.getByRole('button', { name: 'Ветки и merge' });
  fireEvent.click(branches);
  expect(branches.className).toContain('button--primary');
  expect(screen.getByRole('button', { name: 'Свободный режим' }).className).toContain('button--secondary');
});
