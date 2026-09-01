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

test('grep: по файлу и через конвейер, ошибки как у настоящего grep', () => {
  render(<TerminalSim initialFs={{ 'log.txt': 'ошибка раз\nвсё хорошо\nошибка два' }} />);
  run('grep ошибка log.txt');
  expect(screen.getByText('ошибка раз')).toBeTruthy();
  expect(screen.getByText('ошибка два')).toBeTruthy();
  expect(screen.queryByText('всё хорошо')).toBeNull();
  run('cat log.txt | grep хорошо');
  expect(screen.getByText('всё хорошо')).toBeTruthy();
  run('grep x nope.txt');
  expect(screen.getByText('grep: nope.txt: No such file or directory')).toBeTruthy();
});

test('find -name: шаблон со звёздочкой, поиск от текущей папки', () => {
  render(<TerminalSim initialFs={{ docs: { 'a.txt': '1', 'b.md': '2' }, 'c.txt': '3' }} />);
  run('find . -name "*.txt"');
  expect(screen.getByText('./docs/a.txt')).toBeTruthy();
  expect(screen.getByText('./c.txt')).toBeTruthy();
  expect(screen.queryByText('./docs/b.md')).toBeNull();
  run('find nope');
  expect(screen.getByText("find: 'nope': No such file or directory")).toBeTruthy();
});

test('head/tail -n и wc -l, в том числе в конвейере', () => {
  const content = ['строка 1', 'строка 2', 'строка 3', 'строка 4', 'строка 5'].join('\n');
  render(<TerminalSim initialFs={{ 'f.txt': content }} />);
  run('head -n 2 f.txt');
  expect(screen.getByText('строка 1')).toBeTruthy();
  expect(screen.getByText('строка 2')).toBeTruthy();
  expect(screen.queryByText('строка 3')).toBeNull();
  run('tail -n 1 f.txt');
  expect(screen.getByText('строка 5')).toBeTruthy();
  run('wc -l f.txt');
  expect(screen.getByText('5 f.txt')).toBeTruthy();
  run('cat f.txt | wc -l');
  expect(screen.getByText('5')).toBeTruthy();
  run('grep строка f.txt | head -n 1 | wc -l');
  expect(screen.getByText('1')).toBeTruthy();
});

test('man выдаёт справку из словаря, для неизвестной команды — как настоящий man', () => {
  render(<TerminalSim />);
  run('man grep');
  expect(screen.getByText('grep — найти строки, содержащие текст')).toBeTruthy();
  run('man kotlin');
  expect(screen.getByText('No manual entry for kotlin')).toBeTruthy();
});

test('пустое звено конвейера — синтаксическая ошибка bash', () => {
  render(<TerminalSim />);
  run('ls |');
  expect(screen.getByText("bash: syntax error near unexpected token `|'")).toBeTruthy();
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
