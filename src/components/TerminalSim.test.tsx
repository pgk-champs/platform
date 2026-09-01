import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import TerminalSim from './TerminalSim';

beforeEach(() => {
  store.__resetForTests();
});

function input(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement;
}

function run(cmd: string) {
  fireEvent.change(input(), { target: { value: cmd } });
  fireEvent.keyDown(input(), { key: 'Enter' });
}

test('pwd shows home, unknown command errors like bash', () => {
  render(<TerminalSim />);
  run('pwd');
  expect(screen.getByText('/home/student')).toBeTruthy();
  run('foobar');
  expect(screen.getByText('bash: foobar: command not found')).toBeTruthy();
});

test('mkdir/cd/echo/cat flow: prompt follows cwd, redirect writes file', () => {
  render(<TerminalSim />);
  run('mkdir docs');
  run('cd docs');
  expect(screen.getAllByText(/student@pgk:~\/docs\$/).length).toBeGreaterThan(0);
  run('echo "привет мир" > note.txt');
  run('cat note.txt');
  expect(screen.getByText('привет мир')).toBeTruthy();
  run('cat nope.txt');
  expect(screen.getByText('cat: nope.txt: No such file or directory')).toBeTruthy();
});

test('echo >> appends, ls -l shows dir and file entries', () => {
  render(<TerminalSim initialFs={{ docs: {}, 'a.txt': 'hi' }} />);
  run('echo one > log.txt');
  run('echo two >> log.txt');
  run('cat log.txt');
  expect(screen.getByText('one')).toBeTruthy();
  expect(screen.getByText('two')).toBeTruthy();
  run('ls -l');
  expect(screen.getByText(/drwxr-xr-x 1 student student\s+4096 docs/)).toBeTruthy();
  expect(screen.getByText(/-rw-r--r-- 1 student student\s+2 a\.txt/)).toBeTruthy();
});

test('rm -rf / is refused with the real failsafe message', () => {
  render(<TerminalSim initialFs={{ 'a.txt': 'hi' }} />);
  run('rm -rf /');
  expect(screen.getByText("rm: it is dangerous to operate recursively on '/'")).toBeTruthy();
  expect(screen.getByText('rm: use --no-preserve-root to override this failsafe')).toBeTruthy();
  run('ls');
  expect(screen.getByText('a.txt')).toBeTruthy();
});

test('quest completes: plaque, markTrainerDone and XP once', () => {
  render(
    <TerminalSim
      quest={{ title: 'Создай сайт', requiredPaths: ['projects/site/index.html'] }}
      chapterId="terminal"
      trainerId="quest1"
    />,
  );
  expect(screen.queryByText('Выполнено!')).toBeNull();
  run('mkdir -p projects/site');
  run('touch projects/site/index.html');
  expect(screen.getByText('Выполнено!')).toBeTruthy();
  expect(store.getProgress().trainers.terminal.quest1).toBeTruthy();
  expect(store.getXp()).toBe(10);
});

test('quest with forbiddenPaths waits until the file is removed', () => {
  render(
    <TerminalSim
      initialFs={{ 'trash.tmp': 'x' }}
      quest={{ title: 'Наведи порядок', requiredPaths: [], forbiddenPaths: ['trash.tmp'] }}
    />,
  );
  run('pwd');
  expect(screen.queryByText('Выполнено!')).toBeNull();
  run('rm trash.tmp');
  expect(screen.getByText('Выполнено!')).toBeTruthy();
});

test('arrow up recalls history, Tab completes a directory name', () => {
  render(<TerminalSim initialFs={{ projects: {} }} />);
  run('pwd');
  fireEvent.keyDown(input(), { key: 'ArrowUp' });
  expect(input().value).toBe('pwd');
  fireEvent.change(input(), { target: { value: 'cd pro' } });
  fireEvent.keyDown(input(), { key: 'Tab' });
  expect(input().value).toBe('cd projects/');
});

test('cp -r copies a directory, plain cp on directory refuses', () => {
  render(<TerminalSim initialFs={{ src: { 'a.txt': 'data' } }} />);
  run('cp src backup');
  expect(screen.getByText("cp: -r not specified; omitting directory 'src'")).toBeTruthy();
  run('cp -r src backup');
  run('cat backup/a.txt');
  expect(screen.getByText('data')).toBeTruthy();
  run('rm src/a.txt');
  run('cat backup/a.txt');
  expect(screen.getAllByText('data').length).toBe(2);
});
