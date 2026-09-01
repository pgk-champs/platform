import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
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
type Line = { text: string; kind: 'cmd' | 'out' | 'err'; prompt?: string };

const HOME_SEGS = ['home', 'student'];
const COMMANDS = ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'cat', 'echo', 'clear', 'help'];

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

type ExecResult = { lines: { text: string; kind: 'out' | 'err' }[]; cwd: string[]; clear?: boolean };

// Выполняет одну команду. Мутирует root (он живёт в ref компонента).
function exec(root: Dir, cwd: string[], input: string): ExecResult {
  const lines: ExecResult['lines'] = [];
  const o = (t: string) => lines.push({ text: t, kind: 'out' });
  const e = (t: string) => lines.push({ text: t, kind: 'err' });
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
      const text = parts.join(' ');
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

    case 'clear':
      res.clear = true;
      break;

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
        '  clear                    — очистить экран',
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

  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

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
    const r = exec(root, cwd, input);
    setCwd(r.cwd);
    setLines((prev) => (r.clear ? [] : [...prev, echoLine, ...r.lines]));
    if (input.trim()) historyRef.current.push(input);
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
      <div className="ts-screen" ref={screenRef} onClick={focusInput} aria-live="polite">
        {lines.map((l, i) => (
          <div key={i} className={`ts-line${l.kind === 'err' ? ' ts-line-err' : ''}`}>
            {l.prompt !== undefined && <span className="ts-prompt">{l.prompt} </span>}
            {l.text}
          </div>
        ))}
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
    </div>
  );
}
