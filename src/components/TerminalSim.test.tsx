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

// Точное совпадение текста строки (getByText нормализует пробелы, а нам важны отступы).
function byExact(t: string): HTMLElement {
  return screen.getByText((_, el) => (el?.className ?? '').includes('ts-line') && el?.textContent === t);
}

test('tree: ASCII-ветки, вложенность и итоговая строка счётчиков', () => {
  render(<TerminalSim initialFs={{ docs: { 'a.txt': '1' }, 'z.txt': '2' }} />);
  run('tree');
  expect(byExact('├── docs')).toBeTruthy();
  expect(byExact('│   └── a.txt')).toBeTruthy();
  expect(byExact('└── z.txt')).toBeTruthy();
  expect(screen.getByText('1 directory, 2 files')).toBeTruthy();
});

test('history: нумерованный список, включая саму команду history', () => {
  render(<TerminalSim />);
  run('pwd');
  run('whoami');
  run('history');
  expect(byExact('    1  pwd')).toBeTruthy();
  expect(byExact('    2  whoami')).toBeTruthy();
  expect(byExact('    3  history')).toBeTruthy();
});

test('sudo: точное сообщение sudoers с двойным пробелом, сэндвич по xkcd — Okay.', () => {
  render(<TerminalSim />);
  run('sudo apt install fun');
  expect(byExact('student is not in the sudoers file.  This incident will be reported.')).toBeTruthy();
  run('sudo make me a sandwich');
  expect(screen.getByText('Okay.')).toBeTruthy();
});

test('cowsay: облачко и корова оригинальной разметки', () => {
  render(<TerminalSim />);
  run('cowsay Привет');
  expect(byExact(' ________')).toBeTruthy();
  expect(byExact('< Привет >')).toBeTruthy();
  expect(byExact(' --------')).toBeTruthy();
  expect(byExact('        \\   ^__^')).toBeTruthy();
  expect(byExact('         \\  (oo)\\_______')).toBeTruthy();
  expect(byExact('                ||----w |')).toBeTruthy();
});

test('whoami, date и echo с переменными $HOME/$USER', () => {
  render(<TerminalSim />);
  run('whoami');
  expect(screen.getByText('student')).toBeTruthy();
  run('date');
  expect(screen.getByText(/^\w{3} \w{3} \d{1,2} \d{2}:\d{2}:\d{2} GMT[+-]\d{2}(:\d{2})? \d{4}$/)).toBeTruthy();
  run('echo $HOME');
  expect(screen.getByText('/home/student')).toBeTruthy();
  run('echo я $USER и это дом');
  expect(screen.getByText('я student и это дом')).toBeTruthy();
});

test('yes печатает 50 строк с пометкой об остановке, figlet рисует большие буквы', () => {
  render(<TerminalSim />);
  run('yes ok');
  expect(screen.getAllByText('ok').length).toBe(50);
  expect(screen.getByText('(остановлено: в настоящем yes — бесконечно, Ctrl+C)')).toBeTruthy();
  run('figlet Hi');
  expect(screen.getAllByText(/█/).length).toBeGreaterThan(0);
  run('neofetch');
  expect(screen.getByText(/OS: PGK Champs Learning Env/)).toBeTruthy();
  expect(screen.getByText(/Shell: учебный bash/)).toBeTruthy();
});

test('пасхалок нет в help, но man знает про tree и history', () => {
  render(<TerminalSim />);
  run('help');
  expect(screen.queryByText(/cowsay|figlet|neofetch|fortune/)).toBeNull();
  expect(screen.getByText(/tree \[путь\]/)).toBeTruthy();
  run('man tree');
  expect(byExact('tree — дерево папок и файлов')).toBeTruthy();
  run('man history');
  expect(byExact('history — нумерованная история введённых команд')).toBeTruthy();
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
