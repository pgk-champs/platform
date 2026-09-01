import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareResult from './ShareResult';

afterEach(() => {
  vi.restoreAllMocks();
});

test('без navigator.share — копирует текст со ссылкой в буфер', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

  render(<ShareResult text="Набрал 5/10" url="https://pgk.example/sim" />);
  fireEvent.click(screen.getByRole('button', { name: 'Поделиться' }));

  await waitFor(() => expect(screen.getByText('Скопировано!')).toBeTruthy());
  expect(writeText).toHaveBeenCalledWith('Набрал 5/10\nhttps://pgk.example/sim');
});

test('ссылки Telegram и VK предзаполнены текстом и url', () => {
  render(<ShareResult text="Набрал 5/10" url="https://pgk.example/sim" />);
  const tg = screen.getByRole('link', { name: 'Telegram' }) as HTMLAnchorElement;
  const vk = screen.getByRole('link', { name: 'VK' }) as HTMLAnchorElement;
  expect(tg.href).toContain('t.me/share/url?url=https%3A%2F%2Fpgk.example%2Fsim');
  expect(tg.href).toContain('text=');
  expect(vk.href).toContain('vk.com/share.php?url=https%3A%2F%2Fpgk.example%2Fsim');
});

test('с navigator.share — вызывает системный диалог', async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { value: share, configurable: true });

  render(<ShareResult text="Набрал 5/10" url="https://pgk.example/sim" />);
  fireEvent.click(screen.getByRole('button', { name: 'Поделиться' }));

  await waitFor(() =>
    expect(share).toHaveBeenCalledWith({ text: 'Набрал 5/10', url: 'https://pgk.example/sim' }),
  );

  // прибираем за собой, чтобы не протёк в другие тесты
  delete (navigator as { share?: unknown }).share;
});
