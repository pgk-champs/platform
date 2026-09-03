import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import SshQuest from './SshQuest';

beforeEach(() => store.__resetForTests());

function type(cmd: string) {
  const input = screen.getByLabelText('Командная строка тренажёра SSH');
  fireEvent.change(input, { target: { value: cmd } });
  fireEvent.submit(input.closest('form')!);
}

test('ssh до починки прав отвечает «too open» и не пускает', () => {
  render(<SshQuest chapterId="ssh-keys-deep" trainerId="ssh-connect" />);
  type('ssh island@server');
  expect(screen.getByText(/are too open/)).toBeTruthy();
  expect(store.getProgress().trainers['ssh-keys-deep']).toBeUndefined();
});

test('права 600 есть, но ключа нет на сервере — Permission denied (publickey)', () => {
  render(<SshQuest chapterId="ssh-keys-deep" trainerId="ssh-connect" />);
  type('chmod 600 ~/.ssh/id_ed25519');
  type('ssh island@server');
  expect(screen.getByText(/Permission denied \(publickey\)/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
});

test('правильный порядок: chmod 600 → ssh-copy-id → ssh — подключение, XP один раз', () => {
  render(<SshQuest chapterId="ssh-keys-deep" trainerId="ssh-connect" />);
  type('chmod 600 ~/.ssh/id_ed25519');
  type('ssh-copy-id island@server');
  type('ssh island@server');
  expect(screen.getByText(/Вход по ключу выполнен/)).toBeTruthy();
  expect(store.getProgress().trainers['ssh-keys-deep']?.['ssh-connect']).toMatchObject({ result: { connected: true } });
  expect(store.getXp()).toBe(15);
});

test('ls -l показывает права ключа и меняется после chmod', () => {
  render(<SshQuest chapterId="ssh-keys-deep" trainerId="ssh-connect" />);
  type('ls -l ~/.ssh');
  expect(screen.getByText(/-rw-r--r-- 1 student student 411 id_ed25519/)).toBeTruthy();
  type('chmod 600 ~/.ssh/id_ed25519');
  type('ls -l ~/.ssh');
  expect(screen.getByText(/-rw------- 1 student student 411 id_ed25519/)).toBeTruthy();
});
