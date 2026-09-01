import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import UnderHood from './UnderHood';
import './trainers.css';

const FIRST_XP = 10;

// Файл — строка (содержимое), папка — объект с детьми. Дерево целиком JSON,
// поэтому копирование (cp -r) — обычный JSON round-trip.
export type JsonTree = { [name: string]: JsonTree | string };

export type TerminalQuest = {
  title: string;
  /** Пути, которые должны существовать (относительно ~, либо абсолютные, либо с ~). */
  requiredPaths: string[];
  /** Пути, которых существовать не должно. */
  forbiddenPaths?: string[];
};

export type TerminalSimProps = {
  /** Стартовое содержимое домашней папки ~ (/home/student). */
  initialFs?: JsonTree;
  quest?: TerminalQuest;
  chapterId?: string;
  trainerId?: string;
};

type Dir = JsonTree;
type Line = { text: string; kind: 'cmd' | 'out' | 'err' | 'art'; prompt?: string };

const HOME_SEGS = ['home', 'student'];
const COMMANDS = [
  'pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'cat', 'echo',
  'grep', 'find', 'head', 'tail', 'wc', 'man', 'clear', 'help',
  'tree', 'whoami', 'date', 'history',
];

// Момент загрузки модуля ≈ момент открытия страницы — для neofetch Uptime.
const PAGE_START = Date.now();

// Базовые переменные окружения для echo. PWD подставляется на лету.
const ENV_VARS: Record<string, string> = {
  HOME: '/home/student',
  USER: 'student',
  SHELL: '/bin/bash',
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
};

// Краткие man-страницы. Ключи совпадают со списком COMMANDS.
const MAN: Record<string, string[]> = {
  pwd: ['pwd — print working directory', 'Печатает абсолютный путь текущей папки.', 'пример: pwd'],
  ls: ['ls — list, список файлов и папок', 'использование: ls [-l] [-a] [путь]', '-l — подробный формат (права, размер), -a — показать скрытые.', 'пример: ls -la ~/docs'],
  cd: ['cd — change directory, сменить папку', 'использование: cd [путь]', 'cd .. — на уровень вверх, cd без аргумента — домой (~).', 'пример: cd projects/site'],
  mkdir: ['mkdir — make directory, создать папку', 'использование: mkdir [-p] <имя>', '-p — создать сразу всю цепочку родителей.', 'пример: mkdir -p a/b/c'],
  touch: ['touch — создать пустой файл (или обновить дату)', 'использование: touch <файл>', 'пример: touch notes.txt'],
  cat: ['cat — concatenate, показать содержимое файла', 'использование: cat <файл>', 'В конвейере без аргумента передаёт вход дальше.', 'пример: cat notes.txt'],
  echo: ['echo — вывести текст', 'использование: echo <текст> [> файл | >> файл]', '> — записать в файл (перезаписав), >> — дописать в конец.', 'Понимает базовые переменные окружения: $HOME, $USER, $PATH, $PWD.', 'пример: echo "привет" > hi.txt  |  echo $HOME'],
  cp: ['cp — copy, копировать', 'использование: cp [-r] <откуда> <куда>', '-r — рекурсивно, обязателен для папок.', 'пример: cp -r src backup'],
  mv: ['mv — move, переместить или переименовать', 'использование: mv <откуда> <куда>', 'пример: mv draft.txt final.txt'],
  rm: ['rm — remove, удалить', 'использование: rm [-r] [-f] <что>', '-r — рекурсивно для папок, -f — без ошибок о несуществующих.', 'пример: rm -r old_dir'],
  grep: ['grep — найти строки, содержащие текст', 'использование: grep <что искать> [файл]', 'Без файла фильтрует то, что пришло по конвейеру |.', 'пример: cat log.txt | grep ошибка'],
  find: ['find — искать файлы и папки по имени', 'использование: find [путь] -name <шаблон>', 'В шаблоне * — любые символы, ? — один символ. Шаблон бери в кавычки.', 'пример: find . -name "*.txt"'],
  head: ['head — первые строки файла', 'использование: head [-n N] [файл]', 'По умолчанию 10 строк. Без файла читает из конвейера.', 'пример: head -n 3 log.txt'],
  tail: ['tail — последние строки файла', 'использование: tail [-n N] [файл]', 'По умолчанию 10 строк. Без файла читает из конвейера.', 'пример: tail -n 3 log.txt'],
  wc: ['wc — word count, посчитать строки, слова и символы', 'использование: wc [-l] [файл]', '-l — только количество строк. Без файла считает вход из конвейера.', 'пример: ls | wc -l'],
  man: ['man — manual, справка по команде', 'использование: man <команда>', 'пример: man grep'],
  clear: ['clear — очистить экран терминала', 'использование: clear'],
  help: ['help — список всех команд тренажёра', 'использование: help'],
  tree: ['tree — дерево папок и файлов', 'использование: tree [путь]', 'Рисует структуру каталога ASCII-ветками ├── и └── и считает итог.', 'пример: tree ~'],
  whoami: ['whoami — who am i, имя текущего пользователя', 'использование: whoami'],
  date: ['date — текущие дата и время', 'использование: date', 'Формат как в bash: день недели, месяц, число, время, часовой пояс, год.'],
  history: ['history — нумерованная история введённых команд', 'использование: history', 'Стрелки вверх/вниз в строке ввода листают эту же историю.'],
};

// ---------- терминал-фан: арты и тексты пасхалок ----------

// Паровозик из программы sl (лицензия sl разрешает копирование): D51 + вагон с углём.
const SL_ENGINE = [
  '      ====        ________                ___________ ',
  '  _D _|  |_______/        \\__I_I_____===__|_________| ',
  '   |(_)---  |   H\\________/ |   |        =|___ ___|   ',
  '   /     |  |   H  |  |     |   |         ||_| |_||   ',
  '  |      |  |   H  |__--------------------| [___] |   ',
  '  | ________|___H__/__|_____/[][]~\\_______|       |   ',
  '  |/ |   |-----------I_____I [][] []  D   |=======|__ ',
  '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ',
  ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ',
  '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
];
const SL_COAL = [
  '                              ',
  '                              ',
  '    _________________         ',
  '   _|                \\_____A  ',
  ' =|                        |  ',
  ' -|                        |  ',
  '__|________________________|_ ',
  '|__________________________|_ ',
  '   |_D__D__D_|  |_D__D__D_|   ',
  '    \\_/   \\_/    \\_/   \\_/    ',
];
export const SL_TRAIN = SL_ENGINE.map((ln, i) => ln + SL_COAL[i]);
export const SL_SCREEN_W = 80;
const SL_TRAIN_W = Math.max(...SL_TRAIN.map((l) => l.length));

// Корова из cowsay — облачко и разметка как в оригинале.
const COW = [
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
];

// Облачко cowsay: перенос по словам на 40 символов, рамка как в оригинале.
function cowBubble(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const rows: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > 40) {
      rows.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + ' ' + w : w;
    }
  }
  if (cur) rows.push(cur);
  const w = Math.max(...rows.map((r) => r.length));
  const out = [' ' + '_'.repeat(w + 2)];
  if (rows.length === 1) {
    out.push(`< ${rows[0]} >`);
  } else {
    rows.forEach((r, i) => {
      const [l, rt] = i === 0 ? ['/', '\\'] : i === rows.length - 1 ? ['\\', '/'] : ['|', '|'];
      out.push(`${l} ${r.padEnd(w)} ${rt}`);
    });
  }
  out.push(' ' + '-'.repeat(w + 2));
  return out;
}

// 10 цитат про программирование (переводы известных высказываний, авторы указаны).
const FORTUNES: [string, string][] = [
  ['Говорить легко. Покажи мне код.', 'Линус Торвальдс'],
  ['Любой дурак может написать код, понятный компьютеру. Хорошие программисты пишут код, понятный людям.', 'Мартин Фаулер'],
  ['Сначала реши задачу. Потом пиши код.', 'Джон Джонсон'],
  ['Преждевременная оптимизация — корень всех зол.', 'Дональд Кнут'],
  ['Простота — обязательное условие надёжности.', 'Эдсгер Дейкстра'],
  ['В информатике есть только две по-настоящему сложные вещи: инвалидация кеша и придумывание имён.', 'Фил Карлтон'],
  ['Программы нужно писать для того, чтобы их читали люди, и лишь заодно — чтобы их исполняли машины.', 'Гарольд Абельсон'],
  ['Измерять прогресс в программировании строками кода — как измерять постройку самолёта по его весу.', 'Билл Гейтс'],
  ['Отладка вдвое сложнее написания кода. Поэтому, если пишешь код на пределе своей сообразительности, отладить его тебе уже не хватит ума.', 'Брайан Керниган'],
  ['Лучший способ предсказать будущее — изобрести его.', 'Алан Кэй'],
];

// Мини-шрифт для figlet: латиница + цифры, 5 строк, '#' — закрашено.
const FIG: Record<string, string[]> = {
  A: ['.##.', '#..#', '####', '#..#', '#..#'],
  B: ['###.', '#..#', '###.', '#..#', '###.'],
  C: ['.###', '#...', '#...', '#...', '.###'],
  D: ['###.', '#..#', '#..#', '#..#', '###.'],
  E: ['####', '#...', '###.', '#...', '####'],
  F: ['####', '#...', '###.', '#...', '#...'],
  G: ['.###', '#...', '#.##', '#..#', '.###'],
  H: ['#..#', '#..#', '####', '#..#', '#..#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..##', '...#', '...#', '#..#', '.##.'],
  K: ['#..#', '#.#.', '##..', '#.#.', '#..#'],
  L: ['#...', '#...', '#...', '#...', '####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '###.', '#...', '#...'],
  Q: ['.##.', '#..#', '#..#', '#.#.', '.#.#'],
  R: ['###.', '#..#', '###.', '#.#.', '#..#'],
  S: ['.###', '#...', '.##.', '...#', '###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#..#', '#..#', '#..#', '#..#', '.##.'],
  V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'],
  Z: ['####', '...#', '..#.', '.#..', '####'],
  '0': ['.##.', '#..#', '#..#', '#..#', '.##.'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['.##.', '#..#', '..#.', '.#..', '####'],
  '3': ['###.', '...#', '.##.', '...#', '###.'],
  '4': ['#..#', '#..#', '####', '...#', '...#'],
  '5': ['####', '#...', '###.', '...#', '###.'],
  '6': ['.##.', '#...', '###.', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '.##.'],
  '9': ['.##.', '#..#', '.###', '...#', '.##.'],
};

// Рисует текст мини-шрифтом. null — если ни одного известного символа.
function figletRender(text: string): string[] | null {
  const rows = ['', '', '', '', ''];
  let drew = false;
  for (const ch of text.toUpperCase()) {
    const g = ch === ' ' ? ['..', '..', '..', '..', '..'] : FIG[ch];
    if (!g) continue;
    if (ch !== ' ') drew = true;
    for (let i = 0; i < 5; i++) rows[i] += (rows[i] ? ' ' : '') + g[i];
  }
  if (!drew) return null;
  return rows.map((r) => r.replace(/#/g, '█').replace(/\./g, ' '));
}

function isDir(n: Dir | string | undefined): n is Dir {
  return typeof n === 'object' && n !== null;
}

// Путь → сегменты. Понимает ~, абсолютные, относительные, '.', '..'.
function resolvePath(cwd: string[], p: string): string[] {
  let segs: string[];
  let rest = p;
  if (p === '~' || p.startsWith('~/')) {
    segs = [...HOME_SEGS];
    rest = p.slice(1);
  } else if (p.startsWith('/')) {
    segs = [];
  } else {
    segs = [...cwd];
  }
  for (const part of rest.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') segs.pop();
    else segs.push(part);
  }
  return segs;
}

function getNode(root: Dir, segs: string[]): Dir | string | undefined {
  let cur: Dir | string = root;
  for (const s of segs) {
    if (!isDir(cur)) return undefined;
    cur = cur[s];
    if (cur === undefined) return undefined;
  }
  return cur;
}

function parentOf(root: Dir, segs: string[]): { dir: Dir; name: string } | null {
  if (!segs.length) return null;
  const p = getNode(root, segs.slice(0, -1));
  return isDir(p) ? { dir: p, name: segs[segs.length - 1] } : null;
}

function absPath(segs: string[]): string {
  return '/' + segs.join('/');
}

function promptPath(segs: string[]): string {
  const abs = absPath(segs);
  const home = absPath(HOME_SEGS);
  if (abs === home) return '~';
  if (abs.startsWith(home + '/')) return '~' + abs.slice(home.length);
  return abs;
}

// Разбивка строки на токены с поддержкой кавычек: echo "два слова" > f.txt
function tokenize(s: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: string | null = null;
  let started = false;
  for (const ch of s) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      started = true;
    } else if (ch === ' ' || ch === '\t') {
      if (cur || started) out.push(cur);
      cur = '';
      started = false;
    } else {
      cur += ch;
    }
  }
  if (cur || started) out.push(cur);
  return out;
}

// kind 'art' — ASCII-арт: рендерится с white-space: pre и не участвует в конвейере.
type ExecResult = {
  lines: { text: string; kind: 'out' | 'err' | 'art' }[];
  cwd: string[];
  clear?: boolean;
  effect?: 'sl' | 'matrix';
};

// Контекст, который живёт в компоненте, но нужен командам (history).
type Ctx = { history: string[] };

// Режет строку по | вне кавычек — звенья конвейера.
function splitPipes(s: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let quote: string | null = null;
  for (const ch of s) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === '|') {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}

// Точка входа: одиночная команда или конвейер cmd1 | cmd2 (| cmd3 ...).
// Вывод (out) каждого звена становится входом (stdin) следующего; ошибки идут сразу на экран.
function exec(root: Dir, cwd: string[], input: string, ctx: Ctx): ExecResult {
  const parts = splitPipes(input);
  if (parts.length === 1) return execOne(root, cwd, input, null, ctx);
  if (parts.some((p) => !p.trim())) {
    return { lines: [{ text: "bash: syntax error near unexpected token `|'", kind: 'err' }], cwd };
  }
  const lines: ExecResult['lines'] = [];
  let stdin: string[] | null = null;
  for (let i = 0; i < parts.length; i++) {
    const r = execOne(root, cwd, parts[i], stdin, ctx);
    if (i < parts.length - 1) {
      lines.push(...r.lines.filter((l) => l.kind === 'err'));
      stdin = r.lines.filter((l) => l.kind === 'out').map((l) => l.text);
    } else {
      lines.push(...r.lines);
    }
  }
  return { lines, cwd }; // звенья конвейера живут в «подоболочке»: cd внутри | не меняет текущую папку
}

// Выполняет одну команду. Мутирует root (он живёт в ref компонента).
// stdin — строки, пришедшие по конвейеру (null вне конвейера).
function execOne(root: Dir, cwd: string[], input: string, stdin: string[] | null, ctx: Ctx): ExecResult {
  const lines: ExecResult['lines'] = [];
  const o = (t: string) => lines.push({ text: t, kind: 'out' });
  const e = (t: string) => lines.push({ text: t, kind: 'err' });
  const art = (t: string) => lines.push({ text: t, kind: 'art' });
  const res: ExecResult = { lines, cwd };

  const tokens = tokenize(input);
  if (!tokens.length) return res;
  const [cmd, ...rawArgs] = tokens;
  const flags = new Set<string>();
  const args: string[] = [];
  for (const a of rawArgs) {
    if (/^-[a-zA-Z]+$/.test(a)) for (const ch of a.slice(1)) flags.add(ch);
    else args.push(a);
  }
  const recursive = flags.has('r') || flags.has('R');

  switch (cmd) {
    case 'pwd':
      o(absPath(cwd));
      break;

    case 'ls': {
      for (const t of args.length ? args : ['.']) {
        const node = getNode(root, resolvePath(cwd, t));
        if (node === undefined) {
          e(`ls: cannot access '${t}': No such file or directory`);
          continue;
        }
        const pairs: [string, Dir | string][] = isDir(node)
          ? Object.keys(node)
              .sort()
              .map((k) => [k, node[k]])
          : [[t, node]];
        if (flags.has('a') && isDir(node)) pairs.unshift(['.', node], ['..', node]);
        if (flags.has('l')) {
          for (const [name, child] of pairs) {
            const d = isDir(child);
            const size = d ? 4096 : String(child).length;
            o(`${d ? 'drwxr-xr-x' : '-rw-r--r--'} 1 student student ${String(size).padStart(5)} ${name}`);
          }
        } else if (pairs.length) {
          o(pairs.map((p) => p[0]).join('  '));
        }
      }
      break;
    }

    case 'cd': {
      const t = args[0] ?? '~';
      const segs = resolvePath(cwd, t);
      const node = getNode(root, segs);
      if (node === undefined) e(`bash: cd: ${t}: No such file or directory`);
      else if (!isDir(node)) e(`bash: cd: ${t}: Not a directory`);
      else res.cwd = segs;
      break;
    }

    case 'mkdir': {
      if (!args.length) {
        e('mkdir: missing operand');
        break;
      }
      for (const t of args) {
        const segs = resolvePath(cwd, t);
        if (flags.has('p')) {
          let cur: Dir = root;
          for (let i = 0; i < segs.length; i++) {
            const next: Dir | string | undefined = cur[segs[i]];
            if (next === undefined) cur[segs[i]] = {};
            else if (!isDir(next)) {
              e(`mkdir: cannot create directory '${t}': ${i === segs.length - 1 ? 'File exists' : 'Not a directory'}`);
              break;
            }
            cur = cur[segs[i]] as Dir;
          }
        } else {
          const p = parentOf(root, segs);
          if (!p) e(`mkdir: cannot create directory '${t}': No such file or directory`);
          else if (p.dir[p.name] !== undefined) e(`mkdir: cannot create directory '${t}': File exists`);
          else p.dir[p.name] = {};
        }
      }
      break;
    }

    case 'touch': {
      if (!args.length) {
        e('touch: missing file operand');
        break;
      }
      for (const t of args) {
        const p = parentOf(root, resolvePath(cwd, t));
        if (!p) e(`touch: cannot touch '${t}': No such file or directory`);
        else if (p.dir[p.name] === undefined) p.dir[p.name] = '';
      }
      break;
    }

    case 'cat': {
      if (!args.length && stdin) {
        stdin.forEach(o);
        break;
      }
      for (const t of args) {
        const node = getNode(root, resolvePath(cwd, t));
        if (node === undefined) e(`cat: ${t}: No such file or directory`);
        else if (isDir(node)) e(`cat: ${t}: Is a directory`);
        else if (node !== '') node.split('\n').forEach(o);
      }
      break;
    }

    case 'echo': {
      let redir: '>' | '>>' | null = null;
      let target: string | undefined;
      const parts: string[] = [];
      for (let i = 0; i < rawArgs.length; i++) {
        if (rawArgs[i] === '>' || rawArgs[i] === '>>') {
          redir = rawArgs[i] as '>' | '>>';
          target = rawArgs[i + 1];
          i++;
        } else if (!redir) {
          parts.push(rawArgs[i]);
        }
      }
      // ponytail: подстановка $VAR идёт и в одинарных кавычках (токенизатор их не различает);
      // для учебных echo $HOME/$USER этого достаточно.
      const text = parts
        .join(' ')
        .replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name: string) =>
          name === 'PWD' ? absPath(cwd) : ENV_VARS[name] ?? '',
        );
      if (!redir) {
        o(text);
        break;
      }
      if (!target) {
        e("bash: syntax error near unexpected token `newline'");
        break;
      }
      const p = parentOf(root, resolvePath(cwd, target));
      if (!p) {
        e(`bash: ${target}: No such file or directory`);
        break;
      }
      const existing = p.dir[p.name];
      if (isDir(existing)) {
        e(`bash: ${target}: Is a directory`);
        break;
      }
      p.dir[p.name] = redir === '>' || !existing ? text : existing + '\n' + text;
      break;
    }

    case 'cp':
    case 'mv': {
      if (args.length < 2) {
        e(`${cmd}: missing file operand`);
        break;
      }
      const dstTok = args[args.length - 1];
      const srcs = args.slice(0, -1);
      const dstSegs = resolvePath(cwd, dstTok);
      const dstIsDir = isDir(getNode(root, dstSegs));
      if (srcs.length > 1 && !dstIsDir) {
        e(`${cmd}: target '${dstTok}' is not a directory`);
        break;
      }
      for (const s of srcs) {
        const sSegs = resolvePath(cwd, s);
        if (!sSegs.length) {
          e(`${cmd}: cannot ${cmd === 'cp' ? 'copy' : 'move'} '/'`);
          continue;
        }
        const sNode = getNode(root, sSegs);
        if (sNode === undefined) {
          e(`${cmd}: cannot stat '${s}': No such file or directory`);
          continue;
        }
        if (cmd === 'cp' && isDir(sNode) && !recursive) {
          e(`cp: -r not specified; omitting directory '${s}'`);
          continue;
        }
        const finalSegs = dstIsDir ? [...dstSegs, sSegs[sSegs.length - 1]] : dstSegs;
        const p = parentOf(root, finalSegs);
        if (!p) {
          e(`${cmd}: cannot create regular file '${dstTok}': No such file or directory`);
          continue;
        }
        p.dir[p.name] = isDir(sNode) ? (JSON.parse(JSON.stringify(sNode)) as Dir) : sNode;
        if (cmd === 'mv') {
          const sp = parentOf(root, sSegs);
          if (sp) delete sp.dir[sp.name];
        }
      }
      break;
    }

    case 'rm': {
      if (!args.length) {
        e('rm: missing operand');
        break;
      }
      for (const t of args) {
        const segs = resolvePath(cwd, t);
        if (!segs.length) {
          if (recursive) {
            e("rm: it is dangerous to operate recursively on '/'");
            e('rm: use --no-preserve-root to override this failsafe');
          } else {
            e("rm: cannot remove '/': Is a directory");
          }
          continue;
        }
        const p = parentOf(root, segs);
        const node = p ? p.dir[p.name] : undefined;
        if (node === undefined) {
          if (!flags.has('f')) e(`rm: cannot remove '${t}': No such file or directory`);
          continue;
        }
        if (isDir(node) && !recursive) {
          e(`rm: cannot remove '${t}': Is a directory`);
          continue;
        }
        delete p!.dir[p!.name];
      }
      break;
    }

    case 'grep': {
      const pattern = args[0];
      if (pattern === undefined) {
        e('использование: grep <что искать> [файл]');
        break;
      }
      let src: string[] | null = null;
      if (args[1] !== undefined) {
        const node = getNode(root, resolvePath(cwd, args[1]));
        if (node === undefined) {
          e(`grep: ${args[1]}: No such file or directory`);
          break;
        }
        if (isDir(node)) {
          e(`grep: ${args[1]}: Is a directory`);
          break;
        }
        src = node.split('\n');
      } else if (stdin) {
        src = stdin;
      }
      if (!src) {
        e('grep: укажи файл — или подай вход по конвейеру: команда | grep <что искать>');
        break;
      }
      src.filter((l) => l.includes(pattern)).forEach(o);
      break;
    }

    case 'find': {
      // find [путь] -name <шаблон>. Разбираем rawArgs: -name съедается общим парсером флагов.
      const ni = rawArgs.indexOf('-name');
      const pattern = ni >= 0 ? rawArgs[ni + 1] : undefined;
      if (ni >= 0 && pattern === undefined) {
        e('find: -name: требуется аргумент (шаблон имени)');
        break;
      }
      const rest = ni < 0 ? rawArgs : rawArgs.filter((_, i) => i !== ni && i !== ni + 1);
      const startTok = rest[0] ?? '.';
      const startSegs = resolvePath(cwd, startTok);
      const startNode = getNode(root, startSegs);
      if (startNode === undefined) {
        e(`find: '${startTok}': No such file or directory`);
        break;
      }
      const re = pattern
        ? new RegExp(
            '^' +
              pattern
                .split('')
                .map((ch) => (ch === '*' ? '.*' : ch === '?' ? '.' : ch.replace(/[.+^${}()|[\]\\]/, '\\$&')))
                .join('') +
              '$',
          )
        : null;
      const walk = (node: Dir | string, path: string, name: string) => {
        if (!re || re.test(name)) o(path);
        if (isDir(node)) for (const k of Object.keys(node)) walk(node[k], `${path}/${k}`, k);
      };
      const shownStart = startTok.replace(/\/+$/, '') || '/';
      walk(startNode, shownStart, shownStart.split('/').pop() || '/');
      break;
    }

    case 'head':
    case 'tail': {
      let n = 10;
      let file: string | undefined;
      let badN: string | undefined;
      for (let i = 0; i < rawArgs.length; i++) {
        const a = rawArgs[i];
        if (a === '-n') {
          const v = rawArgs[++i];
          if (!v || !/^\d+$/.test(v)) badN = v ?? '';
          else n = parseInt(v, 10);
        } else if (/^-\d+$/.test(a)) {
          n = parseInt(a.slice(1), 10);
        } else if (!a.startsWith('-')) {
          file = a;
        }
      }
      if (badN !== undefined) {
        e(`${cmd}: invalid number of lines: '${badN}'`);
        break;
      }
      let src: string[] | null = null;
      if (file !== undefined) {
        const node = getNode(root, resolvePath(cwd, file));
        if (node === undefined) {
          e(`${cmd}: cannot open '${file}' for reading: No such file or directory`);
          break;
        }
        if (isDir(node)) {
          e(`${cmd}: error reading '${file}': Is a directory`);
          break;
        }
        src = node.split('\n');
      } else if (stdin) {
        src = stdin;
      }
      if (!src) {
        e(`использование: ${cmd} [-n N] <файл> — или через конвейер: команда | ${cmd} -n N`);
        break;
      }
      (cmd === 'head' ? src.slice(0, n) : n === 0 ? [] : src.slice(-n)).forEach(o);
      break;
    }

    case 'wc': {
      let text: string | null = null;
      let name = '';
      const file = args[0];
      if (file !== undefined) {
        const node = getNode(root, resolvePath(cwd, file));
        if (node === undefined) {
          e(`wc: ${file}: No such file or directory`);
          break;
        }
        if (isDir(node)) {
          e(`wc: ${file}: Is a directory`);
          break;
        }
        text = node;
        name = ` ${file}`;
      } else if (stdin) {
        text = stdin.join('\n');
      }
      if (text === null) {
        e('использование: wc [-l] <файл> — или через конвейер: команда | wc -l');
        break;
      }
      const lns = text === '' ? 0 : text.split('\n').length;
      if (flags.has('l')) {
        o(`${lns}${name}`);
      } else {
        const words = text.split(/\s+/).filter(Boolean).length;
        o(`${lns} ${words} ${text.length}${name}`);
      }
      break;
    }

    case 'man': {
      const t = args[0];
      if (!t) {
        e('Какая страница руководства нужна? Например: man ls');
        break;
      }
      const page = MAN[t];
      if (!page) {
        e(`No manual entry for ${t}`);
        break;
      }
      page.forEach(o);
      break;
    }

    case 'clear':
      res.clear = true;
      break;

    case 'whoami':
      o('student');
      break;

    case 'date': {
      const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const d = new Date();
      const p2 = (n: number) => String(n).padStart(2, '0');
      const off = -d.getTimezoneOffset();
      const tz = `GMT${off >= 0 ? '+' : '-'}${p2(Math.floor(Math.abs(off) / 60))}${Math.abs(off) % 60 ? ':' + p2(Math.abs(off) % 60) : ''}`;
      o(
        `${DAYS[d.getDay()]} ${MONS[d.getMonth()]} ${String(d.getDate()).padStart(2)} ` +
          `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())} ${tz} ${d.getFullYear()}`,
      );
      break;
    }

    case 'history':
      ctx.history.forEach((c, i) => o(`${String(i + 1).padStart(5)}  ${c}`));
      break;

    case 'tree': {
      const startTok = args[0] ?? '.';
      const node = getNode(root, resolvePath(cwd, startTok));
      if (node === undefined) {
        o(`${startTok}  [error opening dir]`);
        o('');
        o('0 directories, 0 files');
        break;
      }
      let dirs = 0;
      let files = 0;
      art(startTok);
      if (isDir(node)) {
        const walk = (dir: Dir, prefix: string) => {
          const keys = Object.keys(dir).sort();
          keys.forEach((k, i) => {
            const last = i === keys.length - 1;
            const child = dir[k];
            art(prefix + (last ? '└── ' : '├── ') + k);
            if (isDir(child)) {
              dirs++;
              walk(child, prefix + (last ? '    ' : '│   '));
            } else {
              files++;
            }
          });
        };
        walk(node, '');
      } else {
        files = 1;
      }
      o('');
      o(`${dirs} ${dirs === 1 ? 'directory' : 'directories'}, ${files} ${files === 1 ? 'file' : 'files'}`);
      break;
    }

    // ---------- пасхалки: в help их нет, пусть находят сами ----------

    case 'sl':
      res.effect = 'sl';
      break;

    case 'matrix':
      res.effect = 'matrix';
      break;

    case 'sudo': {
      // xkcd 149: sudo make me a sandwich
      if (rawArgs.join(' ') === 'make me a sandwich') {
        o('Okay.');
        break;
      }
      // Двойной пробел после точки — как в настоящем sudo.
      e('student is not in the sudoers file.  This incident will be reported.');
      break;
    }

    case 'cowsay': {
      const text = rawArgs.length ? rawArgs.join(' ') : stdin ? stdin.join(' ') : '';
      if (!text.trim()) {
        e('использование: cowsay <текст> — или по конвейеру: fortune | cowsay');
        break;
      }
      cowBubble(text).forEach(art);
      COW.forEach(art);
      break;
    }

    case 'fortune': {
      const [q, a] = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      o(q);
      o(`        — ${a}`);
      break;
    }

    case 'yes': {
      const t = rawArgs.join(' ') || 'y';
      for (let i = 0; i < 50; i++) o(t);
      o('(остановлено: в настоящем yes — бесконечно, Ctrl+C)');
      break;
    }

    case 'figlet': {
      const text = rawArgs.join(' ');
      if (!text) {
        e('использование: figlet <текст>');
        break;
      }
      const rows = figletRender(text);
      if (!rows) {
        e('figlet тренажёра знает только латиницу, цифры и пробел');
        break;
      }
      rows.forEach(art);
      break;
    }

    case 'neofetch': {
      const pgk = figletRender('PGK')!;
      const secs = Math.floor((Date.now() - PAGE_START) / 1000);
      const up = secs < 60 ? `${secs} сек` : `${Math.floor(secs / 60)} мин`;
      const info = [
        'student@pgk',
        '-----------',
        'OS: PGK Champs Learning Env',
        'Shell: учебный bash',
        `Uptime: ${up}`,
      ];
      const w = Math.max(...pgk.map((l) => l.length));
      for (let i = 0; i < info.length; i++) art(`${(pgk[i] ?? '').padEnd(w + 3)}${info[i]}`);
      break;
    }

    case 'help':
      [
        'Доступные команды:',
        '  pwd                      — путь к текущей папке',
        '  ls [-l] [-a] [путь]      — список файлов (-l подробно, -a со скрытыми)',
        '  cd [путь]                — перейти в папку (cd .. — вверх, cd — домой)',
        '  mkdir [-p] <имя>         — создать папку (-p — вместе с родителями)',
        '  touch <файл>             — создать пустой файл',
        '  cat <файл>               — показать содержимое файла',
        '  echo <текст>             — вывести текст (> файл — записать, >> — дописать)',
        '  cp [-r] <откуда> <куда>  — копировать (-r для папок)',
        '  mv <откуда> <куда>       — переместить или переименовать',
        '  rm [-r] <что>            — удалить (-r для папок)',
        '  grep <текст> [файл]      — найти строки с текстом (работает и после |)',
        '  find [путь] -name <шаблон> — искать файлы по имени (* — любые символы)',
        '  head/tail [-n N] [файл]  — первые/последние N строк (по умолчанию 10)',
        '  wc [-l] [файл]           — посчитать строки, слова, символы (-l — строки)',
        '  tree [путь]              — дерево папок и файлов ASCII-ветками',
        '  whoami                   — имя текущего пользователя',
        '  date                     — текущие дата и время',
        '  history                  — нумерованная история введённых команд',
        '  man <команда>            — краткая справка по команде',
        '  clear                    — очистить экран',
        'Конвейер: cmd1 | cmd2 — вывод первой команды идёт на вход второй (cat log.txt | grep ошибка).',
        'Подсказки: стрелки вверх/вниз — история, Tab — автодополнение.',
      ].forEach(o);
      break;

    default:
      e(`bash: ${cmd}: command not found`);
  }
  return res;
}

export default function TerminalSim({ initialFs, quest, chapterId, trainerId }: TerminalSimProps) {
  const rootRef = useRef<Dir | null>(null);
  if (rootRef.current === null) {
    rootRef.current = { home: { student: JSON.parse(JSON.stringify(initialFs ?? {})) as Dir } };
  }
  const root = rootRef.current;

  const [cwd, setCwd] = useState<string[]>(HOME_SEGS);
  const [lines, setLines] = useState<Line[]>([
    { text: 'Учебный терминал. Введите help, чтобы увидеть список команд.', kind: 'out' },
  ]);
  const [value, setValue] = useState('');
  const [questDone, setQuestDone] = useState(false);
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Пасхалка sl: позиция левого края поезда (null — поезд не едет).
  const [slOffset, setSlOffset] = useState<number | null>(null);
  const slTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Пасхалка matrix: колонки падающих символов (null — выключено).
  const [matrixCols, setMatrixCols] = useState<
    { left: number; delay: number; dur: number; chars: string }[] | null
  >(null);
  const matrixTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, slOffset !== null]);

  useEffect(
    () => () => {
      if (slTimer.current) clearInterval(slTimer.current);
      if (matrixTimer.current) clearTimeout(matrixTimer.current);
    },
    [],
  );

  const startSl = () => {
    if (slTimer.current) clearInterval(slTimer.current);
    setSlOffset(SL_SCREEN_W);
    slTimer.current = setInterval(() => {
      setSlOffset((p) => {
        if (p === null || p <= -SL_TRAIN_W) {
          if (slTimer.current) {
            clearInterval(slTimer.current);
            slTimer.current = null;
          }
          return null;
        }
        return p - 2;
      });
    }, 60);
  };

  const startMatrix = () => {
    const glyphs = 'アイウエオカキクケコサシスセソタチツテト0123456789';
    setMatrixCols(
      Array.from({ length: 24 }, (_, i) => ({
        left: (i / 24) * 100,
        delay: Math.random() * 1.5,
        dur: 1.2 + Math.random() * 1.8,
        chars: Array.from({ length: 18 }, () => glyphs[Math.floor(Math.random() * glyphs.length)]).join('\n'),
      })),
    );
    if (matrixTimer.current) clearTimeout(matrixTimer.current);
    matrixTimer.current = setTimeout(() => setMatrixCols(null), 5000);
  };

  // Пути квеста считаем от домашней папки (или абсолютно / через ~).
  const pathExists = (p: string) => getNode(root, resolvePath(HOME_SEGS, p)) !== undefined;

  const checkQuest = () => {
    if (!quest || questDone) return;
    const ok =
      quest.requiredPaths.every(pathExists) && !(quest.forbiddenPaths ?? []).some(pathExists);
    if (!ok) return;
    setQuestDone(true);
    if (chapterId && trainerId) {
      const already = store.getProgress().trainers[chapterId]?.[trainerId];
      store.markTrainerDone(chapterId, trainerId, { quest: quest.title });
      if (!already) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    }
  };

  const promptStr = `student@pgk:${promptPath(cwd)}$`;

  const runLine = (input: string) => {
    const echoLine: Line = { prompt: promptStr, text: input, kind: 'cmd' };
    // В историю — до выполнения: настоящий history показывает и саму команду history.
    if (input.trim()) historyRef.current.push(input);
    const r = exec(root, cwd, input, { history: historyRef.current });
    setCwd(r.cwd);
    setLines((prev) => (r.clear ? [] : [...prev, echoLine, ...r.lines]));
    if (r.effect === 'sl') startSl();
    if (r.effect === 'matrix') startMatrix();
    histIdxRef.current = -1;
    setValue('');
    checkQuest();
  };

  const completeTab = () => {
    const spaceIdx = value.lastIndexOf(' ');
    const head = value.slice(0, spaceIdx + 1);
    const token = value.slice(spaceIdx + 1);
    let dirPart = '';
    let prefix = token;
    let candidates: string[];
    if (spaceIdx === -1) {
      candidates = COMMANDS.filter((c) => c.startsWith(token));
    } else {
      const slashIdx = token.lastIndexOf('/');
      dirPart = slashIdx === -1 ? '' : token.slice(0, slashIdx + 1);
      prefix = token.slice(slashIdx + 1);
      const dirNode = getNode(root, resolvePath(cwd, dirPart || '.'));
      if (!isDir(dirNode)) return;
      candidates = Object.keys(dirNode).filter((k) => k.startsWith(prefix));
    }
    if (!candidates.length) return;
    let common = candidates[0];
    for (const c of candidates) while (!c.startsWith(common)) common = common.slice(0, -1);
    let suffix = '';
    if (candidates.length === 1) {
      if (spaceIdx === -1) suffix = ' ';
      else suffix = isDir(getNode(root, resolvePath(cwd, dirPart + common))) ? '/' : ' ';
    }
    if (common.length > prefix.length || suffix) setValue(head + dirPart + common + suffix);
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const h = historyRef.current;
    if (ev.key === 'Enter') {
      runLine(value);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (!h.length) return;
      const idx = histIdxRef.current === -1 ? h.length - 1 : Math.max(0, histIdxRef.current - 1);
      histIdxRef.current = idx;
      setValue(h[idx]);
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (histIdxRef.current === -1) return;
      const idx = histIdxRef.current + 1;
      if (idx >= h.length) {
        histIdxRef.current = -1;
        setValue('');
      } else {
        histIdxRef.current = idx;
        setValue(h[idx]);
      }
    } else if (ev.key === 'Tab') {
      ev.preventDefault();
      completeTab();
    }
  };

  const focusInput = () => {
    if (typeof window !== 'undefined' && window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  };

  return (
    <div className="ts-wrap">
      {quest && (
        <div className="ts-quest">
          <div className="ts-quest-title">Задание: {quest.title}</div>
          <ul>
            {quest.requiredPaths.map((p) => {
              const ok = pathExists(p);
              return (
                <li key={p} className={ok ? 'ts-req-ok' : undefined}>
                  {ok ? '✓' : '○'} {p}
                </li>
              );
            })}
            {(quest.forbiddenPaths ?? []).map((p) => {
              const ok = !pathExists(p);
              return (
                <li key={p} className={ok ? 'ts-req-ok' : undefined}>
                  {ok ? '✓' : '○'} {p} — не должно существовать
                </li>
              );
            })}
          </ul>
          {questDone && <div className="ts-done">Выполнено!</div>}
        </div>
      )}
      <div className="ts-titlebar" aria-hidden="true">
        <span className="ts-dot" />
        <span className="ts-dot" />
        <span className="ts-dot" />
        <span className="ts-titlebar-label">bash — student@pgk</span>
      </div>
      <div className="ts-screenbox">
        <div className="ts-screen" ref={screenRef} onClick={focusInput} aria-live="polite">
          {lines.map((l, i) => (
            <div
              key={i}
              className={`ts-line${l.kind === 'err' ? ' ts-line-err' : ''}${l.kind === 'art' ? ' ts-line-art' : ''}`}
            >
              {l.prompt !== undefined && <span className="ts-prompt">{l.prompt} </span>}
              {l.text}
            </div>
          ))}
          {slOffset !== null && (
            <pre className="ts-sl" aria-hidden="true">
              {SL_TRAIN.map((ln) => {
                const pad = Math.max(0, slOffset);
                const cut = Math.max(0, -slOffset);
                return ' '.repeat(pad) + ln.slice(cut, cut + SL_SCREEN_W - pad);
              }).join('\n')}
            </pre>
          )}
          <div className="ts-inputrow">
            <span className="ts-prompt">{promptStr}</span>
            <input
              ref={inputRef}
              className="ts-input"
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Командная строка"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>
        {matrixCols && (
          <div className="ts-matrix" aria-hidden="true">
            {matrixCols.map((c, i) => (
              <div
                key={i}
                className="ts-matrix-col"
                style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }}
              >
                {c.chars}
              </div>
            ))}
          </div>
        )}
      </div>

      <UnderHood>
        Никакого настоящего Linux здесь нет: файловая система — обычный JS-объект в памяти браузера, где папка — это
        вложенный объект, а файл — строка с содержимым. Команды ls, cd, mkdir, rm и остальные — функции, которые читают
        и меняют этот объект, а cp -r — просто глубокое копирование куска JSON. После каждой команды проверка квеста
        проходит по требуемым путям и смотрит, существуют ли они в этом дереве. Перезагрузишь страницу — «диск»
        создастся заново с нуля, так что ломать тут можно безнаказанно.
      </UnderHood>
    </div>
  );
}
