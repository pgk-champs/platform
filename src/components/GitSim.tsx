import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import UnderHood from './UnderHood';
import './trainers.css';

// Визуальный симулятор git: виртуальный репозиторий в памяти, терминал с
// командами (формулировки вывода сняты с настоящего git 2.x) и живой
// SVG-граф коммитов. В режиме remote-demo рядом второй репозиторий origin
// с упрощёнными push/pull и кнопкой «коммит коллеги» для рассинхрона.

const QUEST_XP = 15;
// Бонус только за 3★ (Zachtronics-style: сравнение необязательное и не
// блокирует прохождение — база QUEST_XP даётся в любом случае).
const STAR_BONUS_XP = 10;
const SEED_TS = 1756723200000; // фиксированная дата стартовых коммитов — SSR-рендер совпадает с клиентским

export type GitSimScenario = 'free' | 'first-commit' | 'branches' | 'remote-demo';
export type GitSimQuest = {
  title: string;
  goal: 'commits>=3' | 'merged' | 'conflict-resolved' | 'ff-and-merge';
  /** Эталонное число команд для 3★ (необязательно — без него звёзды не считаются). */
  optimalCommands?: number;
};

/** 3★ — уложился в эталон, 2★ — не более чем в полтора раза больше, иначе 1★. */
function starsFor(commands: number, optimal: number): 1 | 2 | 3 {
  if (commands <= optimal) return 3;
  if (commands <= Math.ceil(optimal * 1.5)) return 2;
  return 1;
}
export type GitSimProps = {
  scenario?: GitSimScenario;
  quest?: GitSimQuest;
  chapterId?: string;
  trainerId?: string;
};

type Commit = {
  hash: string;
  message: string;
  parents: string[];
  branchName: string; // ветка, на которой создан — задаёт дорожку в графе
  snap: Record<string, string>; // полный снимок файлов на момент коммита
  ts: number;
};

type Conflict = { theirsHash: string; label: string; files: string[] };

type Repo = {
  initialized: boolean;
  files: Record<string, string>; // рабочая директория
  index: Record<string, string>; // staging
  branches: Record<string, string>; // имя -> hash
  head: string; // имя текущей ветки
  conflict: Conflict | null;
};

type Line = { t: 'cmd' | 'out' | 'hint'; s: string };

// Подпись автора коммитов: то, что настоящий git спрашивает через
// git config --global user.name / user.email до первого коммита.
type GitUser = { name: string; email: string };
const DEFAULT_USER: GitUser = { name: 'student', email: 'student@pgk.local' };

type Sim = {
  commits: Record<string, Commit>;
  order: string[]; // hash-и в порядке создания — раскладка графа и сортировка log
  user: GitUser;
  local: Repo;
  origin: Repo | null; // только в remote-demo
  lines: Line[];
  counters: {
    commits: number;
    merged: boolean;
    conflictResolved: boolean;
    ff: boolean;
    mergeCommit: boolean;
    totalCommands: number;
  };
};

const GOAL_LABELS: Record<GitSimQuest['goal'], string> = {
  'commits>=3': 'сделай минимум три коммита',
  merged: 'слей ветку командой git merge',
  'conflict-resolved': 'получи merge-конфликт и разреши его',
  'ff-and-merge': 'получи оба вида слияния — перемотку и merge-коммит',
};

// --- чистые помощники над Sim ---

function clone(sim: Sim): Sim {
  return JSON.parse(JSON.stringify(sim)) as Sim;
}

function emptyRepo(): Repo {
  return { initialized: false, files: {}, index: {}, branches: {}, head: 'main', conflict: null };
}

function newHash(sim: Sim): string {
  let h = '';
  do {
    h = '';
    while (h.length < 7) h += Math.floor(Math.random() * 16).toString(16);
  } while (sim.commits[h]);
  return h;
}

function headCommit(sim: Sim, repo: Repo): Commit | undefined {
  const h = repo.branches[repo.head];
  return h ? sim.commits[h] : undefined;
}

function headSnap(sim: Sim, repo: Repo): Record<string, string> {
  return headCommit(sim, repo)?.snap ?? {};
}

function ancestors(sim: Sim, hash: string): Set<string> {
  const seen = new Set<string>();
  const stack = [hash];
  while (stack.length) {
    const h = stack.pop()!;
    if (seen.has(h)) continue;
    seen.add(h);
    (sim.commits[h]?.parents ?? []).forEach((p) => stack.push(p));
  }
  return seen;
}

function isAncestor(sim: Sim, a: string, b: string): boolean {
  return ancestors(sim, b).has(a);
}

function mergeBase(sim: Sim, a: string, b: string): string | undefined {
  const A = ancestors(sim, a);
  const B = ancestors(sim, b);
  let best: string | undefined;
  sim.order.forEach((h) => {
    if (A.has(h) && B.has(h)) best = h; // последний по порядку создания общий предок
  });
  return best;
}

function createCommit(sim: Sim, repo: Repo, message: string, parents: string[], snap: Record<string, string>): string {
  const hash = newHash(sim);
  sim.commits[hash] = { hash, message, parents, branchName: repo.head, snap, ts: Date.now() };
  sim.order.push(hash);
  repo.branches[repo.head] = hash;
  return hash;
}

// staged-изменения относительно HEAD, модифицированные и неотслеживаемые файлы
function diffs(sim: Sim, repo: Repo) {
  const snap = headSnap(sim, repo);
  const conflictFiles = repo.conflict?.files ?? [];
  const staged = Object.keys(repo.index).filter((f) => repo.index[f] !== snap[f]);
  const modified = Object.keys(repo.files).filter(
    (f) => !conflictFiles.includes(f) && (f in snap || f in repo.index) && repo.files[f] !== (repo.index[f] ?? snap[f]),
  );
  const untracked = Object.keys(repo.files).filter(
    (f) => !(f in snap) && !(f in repo.index) && !conflictFiles.includes(f),
  );
  return { snap, staged, modified, untracked, conflictFiles };
}

function statusText(sim: Sim, repo: Repo): string {
  const head = headCommit(sim, repo);
  const { snap, staged, modified, untracked, conflictFiles } = diffs(sim, repo);
  const L: string[] = [`On branch ${repo.head}`];
  if (!head) L.push('', 'No commits yet');
  if (repo.conflict) {
    if (conflictFiles.length) {
      L.push(
        'You have unmerged paths.',
        '  (fix conflicts and run "git commit")',
        '  (use "git merge --abort" to abort the merge)',
        '',
        'Unmerged paths:',
        '  (use "git add <file>..." to mark resolution)',
      );
      conflictFiles.forEach((f) => L.push(`\tboth modified:   ${f}`));
    } else {
      L.push('All conflicts fixed but you are still merging.', '  (use "git commit" to conclude merge)');
    }
  }
  if (staged.length) {
    L.push('', 'Changes to be committed:', '  (use "git rm --cached <file>..." to unstage)');
    staged.forEach((f) => L.push(`\t${f in snap ? 'modified:   ' : 'new file:   '}${f}`));
  }
  if (modified.length) {
    L.push('', 'Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)');
    modified.forEach((f) => L.push(`\tmodified:   ${f}`));
  }
  if (untracked.length) {
    L.push('', 'Untracked files:', '  (use "git add <file>..." to include in what will be committed)');
    untracked.forEach((f) => L.push(`\t${f}`));
  }
  if (!staged.length && !modified.length && !repo.conflict) {
    if (untracked.length) L.push('', 'nothing added to commit but untracked files present (use "git add" to track)');
    else if (head) L.push('nothing to commit, working tree clean');
    else L.push('', 'nothing to commit (create/copy files and use "git add" to track)');
  }
  return L.join('\n');
}

function decorations(repo: Repo, hash: string): string {
  const names = Object.keys(repo.branches)
    .filter((b) => repo.branches[b] === hash)
    .sort((a, b) => (a === repo.head ? -1 : b === repo.head ? 1 : a.localeCompare(b)))
    .map((b) => (b === repo.head ? `HEAD -> ${b}` : b));
  return names.length ? ` (${names.join(', ')})` : '';
}

function logText(sim: Sim, repo: Repo, oneline: boolean): string {
  const headHash = repo.branches[repo.head];
  if (!headHash) return `fatal: your current branch '${repo.head}' does not have any commits yet`;
  const anc = ancestors(sim, headHash);
  const list = sim.order.filter((h) => anc.has(h)).reverse();
  const entries = list.map((h) => {
    const c = sim.commits[h];
    const deco = decorations(repo, h);
    if (oneline) return `${h}${deco} ${c.message}`;
    const d = new Date(c.ts);
    return `commit ${h}${deco}\nAuthor: ${sim.user.name} <${sim.user.email}>\nDate:   ${d.toLocaleString('ru-RU')}\n\n    ${c.message}`;
  });
  return entries.join(oneline ? '\n' : '\n\n');
}

// Псевдо-хеш содержимого для строки index в diff (у настоящего git это хеш blob-объекта).
function blobHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(7, '0').slice(0, 7);
}

// Diff одного файла: общий префикс/суффикс — контекст (до 3 строк, как у git),
// середина — минус-строки старого и плюс-строки нового. Формат сверен с git 2.x.
function fileDiff(f: string, oldS: string, newS: string): string {
  const a = oldS.split('\n');
  const b = newS.split('\n');
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let post = 0;
  while (post < a.length - pre && post < b.length - pre && a[a.length - 1 - post] === b[b.length - 1 - post]) post++;
  const del = a.slice(pre, a.length - post);
  const add = b.slice(pre, b.length - post);
  const ctxPre = Math.min(pre, 3);
  const ctxPost = Math.min(post, 3);
  const start = pre - ctxPre + 1;
  const range = (n: number) => (n === 1 ? `${start}` : `${start},${n}`);
  return [
    `diff --git a/${f} b/${f}`,
    `index ${blobHash(oldS)}..${blobHash(newS)} 100644`,
    `--- a/${f}`,
    `+++ b/${f}`,
    `@@ -${range(ctxPre + del.length + ctxPost)} +${range(ctxPre + add.length + ctxPost)} @@`,
    ...a.slice(pre - ctxPre, pre).map((l) => ` ${l}`),
    ...del.map((l) => `-${l}`),
    ...add.map((l) => `+${l}`),
    ...a.slice(a.length - post, a.length - post + ctxPost).map((l) => ` ${l}`),
  ].join('\n');
}

// git diff без аргументов: рабочая директория против индекса (или HEAD, если файла нет в индексе).
function diffText(sim: Sim, repo: Repo): string {
  const snap = headSnap(sim, repo);
  const chunks: string[] = [];
  for (const f of Object.keys(repo.files).sort()) {
    const base = repo.index[f] ?? snap[f];
    if (base === undefined || repo.files[f] === base) continue; // untracked или без правок — git diff молчит
    chunks.push(fileDiff(f, base, repo.files[f]));
  }
  return chunks.join('\n');
}

// git log --graph --oneline: ASCII-граф. Колонки — «ожидаемые» коммиты; идём от новых
// к старым, звезда — коммит, |\ — расхождение на два родителя, |/ — схождение веток.
function graphLogText(sim: Sim, repo: Repo): string {
  const headHash = repo.branches[repo.head];
  if (!headHash) return `fatal: your current branch '${repo.head}' does not have any commits yet`;
  const anc = ancestors(sim, headHash);
  const list = sim.order.filter((h) => anc.has(h)).reverse();
  const cols: (string | undefined)[] = [headHash];
  const rows: string[] = [];
  const bar = (n: number) => Array(n).fill('|').join(' ');
  for (const h of list) {
    let ci = cols.indexOf(h);
    if (ci === -1) {
      cols.push(h);
      ci = cols.length - 1;
    }
    for (let j = cols.length - 1; j > ci; j--) {
      if (cols[j] === h) {
        cols.splice(j, 1);
        rows.push(bar(j) + '/'); // ветка влилась — колонка схлопывается
      }
    }
    const c = sim.commits[h];
    const marks = cols.map((_, i) => (i === ci ? '*' : '|')).join(' ');
    rows.push(`${marks}${c.parents.length > 1 ? '  ' : ''} ${h}${decorations(repo, h)} ${c.message}`);
    cols[ci] = c.parents[0];
    if (c.parents.length > 1) {
      cols.splice(ci + 1, 0, c.parents[1]);
      rows.push(bar(ci + 1) + '\\'); // ponytail: третью параллельную ветку рисуем упрощённо — глубже сим не заходит
    }
  }
  return rows.join('\n');
}

function tokenize(line: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function helpText(hasRemote: boolean): string {
  const L = [
    'Поддерживаемые команды:',
    '  git config --global user.name "Имя"  — подпись автора коммитов (и user.email)',
    '  git init                      — создать репозиторий',
    '  git status                    — состояние файлов',
    '  git add <файл|.>              — добавить изменения в индекс',
    '  git commit -m "сообщение"     — создать коммит',
    '  git diff                      — незастейджённые изменения (- было, + стало)',
    '  git restore <файл|.>          — отменить незастейджённые правки',
    '  git log [--oneline] [--graph] — история коммитов (--graph — ASCII-граф веток)',
    '  git branch [имя]              — список веток / новая ветка',
    '  git switch <имя>  (checkout)  — перейти на ветку, -c/-b — создать и перейти',
    '  git merge <ветка>             — слить ветку, --abort — отменить слияние',
  ];
  if (hasRemote) {
    L.push('  git push                      — отправить текущую ветку в origin');
    L.push('  git pull                      — забрать изменения из origin');
  }
  L.push('  edit <файл> <текст>           — псевдоредактор: записать текст в файл');
  L.push('  clear                         — очистить терминал');
  return L.join('\n');
}

// --- исполнение команды ---

function exec(prev: Sim, raw: string): Sim {
  const sim = clone(prev);
  const line = raw.trim();
  sim.lines.push({ t: 'cmd', s: line });
  sim.counters.totalCommands += 1; // для сравнения «твои команды vs эталон» — считает всё введённое, включая ошибки
  const out = (s: string) => sim.lines.push({ t: 'out', s });
  const hint = (s: string) => sim.lines.push({ t: 'hint', s: `подсказка: ${s}` });
  const tok = tokenize(line);
  const repo = sim.local;

  if (tok[0] === 'clear') {
    sim.lines = [];
    return sim;
  }
  if (tok[0] === 'help') {
    out(helpText(!!sim.origin));
    return sim;
  }
  if (tok[0] === 'edit') {
    const m = line.match(/^edit\s+(\S+)\s+([\s\S]+)$/);
    if (!m) {
      out('использование: edit <файл> <новое содержимое>');
      return sim;
    }
    repo.files[m[1]] = m[2];
    sim.lines.push({ t: 'hint', s: `(файл ${m[1]} сохранён)` });
    return sim;
  }
  if (tok[0] !== 'git') {
    out(`bash: ${tok[0]}: command not found`);
    hint('это виртуальный терминал — список команд покажет help');
    return sim;
  }

  const sub = tok[1];
  if (!sub) {
    out("usage: git <команда> — например, git status");
    return sim;
  }

  // config — до проверки на репозиторий: настоящий git config --global
  // работает в любой папке, и глава просит представиться ДО git init.
  if (sub === 'config') {
    const args = tok.slice(2).filter((a) => a !== '--global' && a !== '--local');
    const key = args[0];
    const value = args.slice(1).join(' ');
    const field = key === 'user.name' ? 'name' : key === 'user.email' ? 'email' : null;
    if (!field) {
      out(`error: тренажёр знает только git config user.name и git config user.email`);
      hint('например: git config --global user.name "Ivan Petrov"');
      return sim;
    }
    if (!value) {
      out(sim.user[field]); // чтение настройки — как у настоящего git
      return sim;
    }
    sim.user[field] = value;
    // Настройка автора — разовая подготовка, а не часть цикла init → add →
    // commit: в счёт команд для звёзд не идёт, иначе студент, честно
    // повторивший главу, терял бы звезду на ровном месте.
    sim.counters.totalCommands -= 1;
    // настоящий git при записи молчит — поясняем происходящее подсказкой
    hint(`${key} теперь ${value} — эта подпись встанет под коммитами (её видно в git log)`);
    return sim;
  }

  if (sub === 'init') {
    if (repo.initialized) out('Reinitialized existing Git repository in /home/student/project/.git/');
    else {
      repo.initialized = true;
      out('Initialized empty Git repository in /home/student/project/.git/');
    }
    return sim;
  }
  if (!repo.initialized) {
    out('fatal: not a git repository (or any of the parent directories): .git');
    hint('начни с git init');
    return sim;
  }

  const snap = headSnap(sim, repo);

  switch (sub) {
    case 'status': {
      out(statusText(sim, repo));
      return sim;
    }

    case 'add': {
      const args = tok.slice(2);
      if (!args.length) {
        out("Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?");
        return sim;
      }
      const targets = args.includes('.') ? Object.keys(repo.files) : args;
      for (const f of targets) {
        if (!(f in repo.files)) {
          out(`fatal: pathspec '${f}' did not match any files`);
          return sim;
        }
      }
      for (const f of targets) {
        repo.index[f] = repo.files[f];
        if (repo.conflict) repo.conflict.files = repo.conflict.files.filter((x) => x !== f);
      }
      return sim;
    }

    case 'commit': {
      const mi = tok.indexOf('-m');
      const message = mi >= 0 ? tok[mi + 1] : undefined;
      if (!message) {
        out('error: не указано сообщение коммита');
        hint('в тренажёре сообщение обязательно: git commit -m "что сделано"');
        return sim;
      }
      if (repo.conflict) {
        if (repo.conflict.files.length) {
          out('error: Committing is not possible because you have unmerged files.');
          hint('исправь конфликт через edit, затем git add <файл>');
          return sim;
        }
        const ourHash = repo.branches[repo.head];
        const newSnap = { ...snap, ...repo.index };
        const h = createCommit(sim, repo, message, [ourHash, repo.conflict.theirsHash], newSnap);
        repo.index = {};
        repo.conflict = null;
        repo.files = { ...repo.files, ...newSnap };
        sim.counters.commits += 1;
        sim.counters.merged = true;
        sim.counters.conflictResolved = true;
        sim.counters.mergeCommit = true; // завершённый конфликт — тоже настоящий merge-коммит с двумя родителями
        out(`[${repo.head} ${h}] ${message}`);
        return sim;
      }
      const staged = Object.keys(repo.index).filter((f) => repo.index[f] !== snap[f]);
      if (!staged.length) {
        out(statusText(sim, repo));
        // Тупик «коммитить нечего»: без этой подсказки следующий коммит
        // собрать не из чего — про псевдоредактор edit студент ещё не знает.
        hint('коммитить нечего: сначала измени файл — edit <файл> <новый текст>, потом git add <файл>');
        return sim;
      }
      const parent = repo.branches[repo.head];
      const newSnap = { ...snap, ...repo.index };
      const h = createCommit(sim, repo, message, parent ? [parent] : [], newSnap);
      repo.index = {};
      sim.counters.commits += 1;
      out(
        `[${repo.head}${parent ? '' : ' (root-commit)'} ${h}] ${message}\n ${staged.length} file${staged.length === 1 ? '' : 's'} changed`,
      );
      return sim;
    }

    case 'log': {
      if (tok.includes('--graph')) out(graphLogText(sim, repo));
      else out(logText(sim, repo, tok.includes('--oneline')));
      return sim;
    }

    case 'diff': {
      const d = diffText(sim, repo);
      if (d) out(d);
      else sim.lines.push({ t: 'hint', s: '(незастейджённых изменений нет — git diff молчит)' });
      return sim;
    }

    case 'restore': {
      const target = tok[2];
      if (!target) {
        out('fatal: you must specify path(s) to restore');
        return sim;
      }
      const known = (f: string) => f in snap || f in repo.index;
      const files = target === '.' ? Object.keys(repo.files).filter(known) : [target];
      if (target !== '.' && !known(target)) {
        out(`error: pathspec '${target}' did not match any file(s) known to git`);
        return sim;
      }
      for (const f of files) repo.files[f] = repo.index[f] ?? snap[f];
      sim.lines.push({
        t: 'hint',
        s: `(незастейджённые правки ${target === '.' ? 'всех файлов' : `в ${target}`} отменены — вернулось состояние из индекса/HEAD)`,
      });
      return sim;
    }

    case 'branch': {
      const name = tok[2];
      if (!name) {
        out(
          Object.keys(repo.branches)
            .sort()
            .map((b) => (b === repo.head ? `* ${b}` : `  ${b}`))
            .join('\n') || 'fatal: not a valid object name: \'' + repo.head + '\'',
        );
        return sim;
      }
      if (repo.branches[name]) {
        out(`fatal: a branch named '${name}' already exists`);
        return sim;
      }
      if (!repo.branches[repo.head]) {
        out(`fatal: not a valid object name: '${repo.head}'`);
        hint('ветку можно создать только когда есть хотя бы один коммит');
        return sim;
      }
      repo.branches[name] = repo.branches[repo.head];
      return sim;
    }

    case 'switch':
    case 'checkout': {
      const create = tok[2] === '-c' || tok[2] === '-b';
      const name = create ? tok[3] : tok[2];
      if (!name) {
        out(`использование: git ${sub} <ветка>`);
        return sim;
      }
      if (repo.conflict) {
        out('fatal: You have not concluded your merge (MERGE_HEAD exists).');
        hint('сначала заверши слияние: edit + git add + git commit');
        return sim;
      }
      if (create) {
        if (repo.branches[name]) {
          out(`fatal: a branch named '${name}' already exists`);
          return sim;
        }
        if (!repo.branches[repo.head]) {
          out(`fatal: not a valid object name: '${repo.head}'`);
          return sim;
        }
        repo.branches[name] = repo.branches[repo.head];
        repo.head = name;
        out(`Switched to a new branch '${name}'`);
        return sim;
      }
      if (name === repo.head) {
        out(`Already on '${name}'`);
        return sim;
      }
      if (!repo.branches[name]) {
        out(`fatal: invalid reference: ${name}`);
        hint('список веток покажет git branch');
        return sim;
      }
      const { staged, modified, untracked } = diffs(sim, repo);
      const dirty = [...new Set([...staged, ...modified])];
      if (dirty.length) {
        out(
          `error: Your local changes to the following files would be overwritten by checkout:\n${dirty
            .map((f) => `\t${f}`)
            .join('\n')}\nPlease commit your changes or stash them before you switch branches.`,
        );
        hint('сделай коммит текущих изменений, потом переключайся');
        return sim;
      }
      repo.head = name;
      const target = headSnap(sim, repo);
      const keep: Record<string, string> = {};
      untracked.forEach((f) => {
        keep[f] = repo.files[f];
      });
      repo.files = { ...keep, ...target };
      repo.index = {};
      out(`Switched to branch '${name}'`);
      return sim;
    }

    case 'merge': {
      if (tok[2] === '--abort') {
        if (!repo.conflict) {
          out('fatal: There is no merge to abort (MERGE_HEAD missing).');
          return sim;
        }
        const { untracked } = diffs(sim, repo);
        const keep: Record<string, string> = {};
        untracked.forEach((f) => {
          keep[f] = repo.files[f];
        });
        repo.files = { ...keep, ...snap };
        repo.index = {};
        repo.conflict = null;
        sim.lines.push({ t: 'hint', s: '(слияние отменено, рабочая директория восстановлена)' });
        return sim;
      }
      const name = tok[2];
      if (!name) {
        out('использование: git merge <ветка>');
        return sim;
      }
      if (repo.conflict) {
        out('fatal: You have not concluded your merge (MERGE_HEAD exists).');
        return sim;
      }
      if (!repo.branches[name]) {
        out(`merge: ${name} - not something we can merge`);
        hint('список веток покажет git branch');
        return sim;
      }
      doMerge(sim, name, repo.branches[name]);
      return sim;
    }

    case 'push': {
      if (!sim.origin) {
        out('fatal: no configured push destination.');
        hint('удалённый репозиторий есть в сценарии remote-demo');
        return sim;
      }
      const b = repo.head;
      const lh = repo.branches[b];
      if (!lh) {
        out(`error: src refspec ${b} does not match any`);
        return sim;
      }
      const oh = sim.origin.branches[b];
      if (oh === lh) {
        out('Everything up-to-date');
        return sim;
      }
      if (!oh) {
        sim.origin.branches[b] = lh;
        out(`To origin\n * [new branch]      ${b} -> ${b}`);
        return sim;
      }
      if (isAncestor(sim, oh, lh)) {
        sim.origin.branches[b] = lh;
        sim.origin.files = { ...sim.commits[lh].snap };
        out(`To origin\n   ${oh}..${lh}  ${b} -> ${b}`);
        return sim;
      }
      out(
        `To origin\n ! [rejected]        ${b} -> ${b} (fetch first)\nerror: failed to push some refs to 'origin'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. Use 'git pull' before pushing again.`,
      );
      hint('на origin есть чужие коммиты — сначала git pull, затем git push');
      return sim;
    }

    case 'pull': {
      if (!sim.origin) {
        out('fatal: no configured pull source.');
        hint('удалённый репозиторий есть в сценарии remote-demo');
        return sim;
      }
      const b = repo.head;
      const oh = sim.origin.branches[b];
      const lh = repo.branches[b];
      if (!oh) {
        out(`fatal: couldn't find remote ref ${b}`);
        return sim;
      }
      if (oh === lh || (lh && isAncestor(sim, oh, lh))) {
        out('Already up to date.');
        return sim;
      }
      out('From origin');
      doMerge(sim, `origin/${b}`, oh);
      return sim;
    }

    default:
      out(`git: '${sub}' is not a git command. See 'git --help'.`);
      hint('список поддерживаемых команд покажет help');
      return sim;
  }
}

// Слияние theirsHash в текущую ветку local: fast-forward, merge-коммит или конфликт.
function doMerge(sim: Sim, label: string, theirsHash: string): void {
  const repo = sim.local;
  const out = (s: string) => sim.lines.push({ t: 'out', s });
  const hint = (s: string) => sim.lines.push({ t: 'hint', s: `подсказка: ${s}` });
  const ourHash = repo.branches[repo.head];
  const { staged, modified, untracked } = diffs(sim, repo);
  const dirty = [...new Set([...staged, ...modified])];
  if (dirty.length) {
    out(
      `error: Your local changes to the following files would be overwritten by merge:\n${dirty
        .map((f) => `\t${f}`)
        .join('\n')}\nPlease commit your changes or stash them before you merge.`,
    );
    return;
  }
  const keep: Record<string, string> = {};
  untracked.forEach((f) => {
    keep[f] = repo.files[f];
  });

  if (ourHash && (theirsHash === ourHash || isAncestor(sim, theirsHash, ourHash))) {
    out('Already up to date.');
    return;
  }
  if (!ourHash || isAncestor(sim, ourHash, theirsHash)) {
    // fast-forward: просто передвигаем указатель ветки
    repo.branches[repo.head] = theirsHash;
    repo.files = { ...keep, ...sim.commits[theirsHash].snap };
    repo.index = {};
    sim.counters.merged = true;
    sim.counters.ff = true;
    out(`Updating ${ourHash ?? '0000000'}..${theirsHash}\nFast-forward`);
    return;
  }

  // ветки разошлись: трёхстороннее слияние от общего предка
  const baseHash = mergeBase(sim, ourHash, theirsHash);
  const base = baseHash ? sim.commits[baseHash].snap : {};
  const ours = sim.commits[ourHash].snap;
  const theirs = sim.commits[theirsHash].snap;
  const names = [...new Set([...Object.keys(ours), ...Object.keys(theirs)])];
  const merged: Record<string, string> = {};
  const conflicts: string[] = [];
  for (const f of names) {
    const o = ours[f];
    const t = theirs[f];
    const bs = base[f];
    if (o === t) {
      if (o !== undefined) merged[f] = o;
    } else if (t === bs) {
      if (o !== undefined) merged[f] = o;
    } else if (o === bs) {
      if (t !== undefined) merged[f] = t;
    } else {
      conflicts.push(f);
      merged[f] = `<<<<<<< HEAD\n${o ?? ''}\n=======\n${t ?? ''}\n>>>>>>> ${label}`;
    }
  }

  if (conflicts.length) {
    repo.index = {};
    for (const f of Object.keys(merged)) {
      if (!conflicts.includes(f) && merged[f] !== ours[f]) repo.index[f] = merged[f];
    }
    repo.files = { ...keep, ...merged };
    repo.conflict = { theirsHash, label, files: conflicts };
    out(
      [
        ...conflicts.map((f) => `Auto-merging ${f}`),
        ...conflicts.map((f) => `CONFLICT (content): Merge conflict in ${f}`),
        'Automatic merge failed; fix conflicts and then commit the result.',
      ].join('\n'),
    );
    hint('открой файл: edit <файл> <итоговый текст> (убери маркеры <<< === >>>), затем git add и git commit -m "..."');
    return;
  }

  createCommit(sim, repo, `Merge branch '${label}'`, [ourHash, theirsHash], merged);
  repo.files = { ...keep, ...merged };
  repo.index = {};
  sim.counters.merged = true;
  sim.counters.mergeCommit = true;
  out("Merge made by the 'ort' strategy.");
}

// --- стартовые состояния сценариев ---

function makeInitial(scenario: GitSimScenario): Sim {
  const sim: Sim = {
    commits: {},
    order: [],
    user: { ...DEFAULT_USER },
    local: emptyRepo(),
    origin: null,
    lines: [],
    counters: { commits: 0, merged: false, conflictResolved: false, ff: false, mergeCommit: false, totalCommands: 0 },
  };
  const greet = (s: string) => sim.lines.push({ t: 'hint', s });

  const seed = (hash: string, message: string, snap: Record<string, string>) => {
    sim.commits[hash] = { hash, message, parents: [], branchName: 'main', snap, ts: SEED_TS };
    sim.order.push(hash);
  };

  if (scenario === 'free') {
    greet('Пустая папка проекта. Начни с git init. Полный список команд — help.');
  } else if (scenario === 'first-commit') {
    sim.local.files['README.md'] = 'Мой первый проект';
    greet(
      'В папке уже лежит README.md. Доведи его до первого коммита: git init → git add → git commit. Чтобы сделать следующий коммит, файл надо сначала изменить — здесь это команда edit: например edit README.md Мой проект на Kotlin. Полный список команд — help.',
    );
  } else if (scenario === 'branches') {
    seed('e7c9a4b', 'начало проекта', { 'README.md': 'Проект PGK' });
    sim.local = {
      initialized: true,
      files: { 'README.md': 'Проект PGK' },
      index: {},
      branches: { main: 'e7c9a4b' },
      head: 'main',
      conflict: null,
    };
    greet('Репозиторий уже создан, есть первый коммит. Попробуй ветки: git branch, git switch, git merge. Список команд — help.');
  } else {
    seed('b41c6e2', 'первый коммит', { 'README.md': 'Проект PGK' });
    sim.local = {
      initialized: true,
      files: { 'README.md': 'Проект PGK' },
      index: {},
      branches: { main: 'b41c6e2' },
      head: 'main',
      conflict: null,
    };
    sim.origin = {
      initialized: true,
      files: { 'README.md': 'Проект PGK' },
      index: {},
      branches: { main: 'b41c6e2' },
      head: 'main',
      conflict: null,
    };
    greet(
      'Слева — твой локальный репозиторий, справа — origin. Доступны git push и git pull. Кнопка «Коммит коллеги» двигает origin вперёд — так возникает рассинхрон. Список команд — help.',
    );
  }
  return sim;
}

function goalMet(sim: Sim, goal: GitSimQuest['goal']): boolean {
  if (goal === 'commits>=3') return sim.counters.commits >= 3;
  if (goal === 'merged') return sim.counters.merged;
  if (goal === 'ff-and-merge') return sim.counters.ff && sim.counters.mergeCommit;
  return sim.counters.conflictResolved;
}

// --- отрисовка ---

function Graph({ sim, repo, title }: { sim: Sim; repo: Repo; title: string }) {
  const reach = new Set<string>();
  const stack = Object.values(repo.branches);
  while (stack.length) {
    const h = stack.pop()!;
    if (!h || reach.has(h)) continue;
    reach.add(h);
    (sim.commits[h]?.parents ?? []).forEach((p) => stack.push(p));
  }
  const shown = sim.order.filter((h) => reach.has(h));
  if (!shown.length) {
    return (
      <div className="gs-graph">
        <div className="gs-graph-title">{title}</div>
        <div className="gs-graph-empty">история пуста — сделай первый коммит</div>
      </div>
    );
  }
  const xi = new Map(shown.map((h, i) => [h, i] as const));
  const lanes = new Map<string, number>();
  shown.forEach((h) => {
    const b = sim.commits[h].branchName;
    if (!lanes.has(b)) lanes.set(b, lanes.size);
  });
  const X = (h: string) => 30 + (xi.get(h) ?? 0) * 52;
  const Y = (h: string) => 46 + (lanes.get(sim.commits[h].branchName) ?? 0) * 46;
  const width = 60 + shown.length * 52;
  const height = 46 + lanes.size * 46 + 28;

  return (
    <div className="gs-graph">
      <div className="gs-graph-title">{title}</div>
      <div className="gs-graph-scroll">
        <svg width={width} height={height} role="img" aria-label={`Граф коммитов: ${title}`}>
          {shown.map((h) =>
            sim.commits[h].parents.map((p) => {
              if (!reach.has(p)) return null;
              const x1 = X(p);
              const y1 = Y(p);
              const x2 = X(h);
              const y2 = Y(h);
              const skips = Math.abs((xi.get(h) ?? 0) - (xi.get(p) ?? 0)) > 1 && y1 === y2;
              return skips ? (
                <path key={`${h}-${p}`} className="gs-edge" d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 + 22} ${x2} ${y2}`} />
              ) : (
                <line key={`${h}-${p}`} className="gs-edge" x1={x1} y1={y1} x2={x2} y2={y2} />
              );
            }),
          )}
          {shown.map((h) => {
            const c = sim.commits[h];
            const cx = X(h);
            const cy = Y(h);
            const labels = Object.keys(repo.branches)
              .filter((b) => repo.branches[b] === h)
              .sort((a, b) => (a === repo.head ? -1 : b === repo.head ? 1 : a.localeCompare(b)));
            return (
              <g key={h}>
                <circle className={c.parents.length > 1 ? 'gs-node gs-node-merge' : 'gs-node'} cx={cx} cy={cy} r={8}>
                  <title>{c.message}</title>
                </circle>
                <text className="gs-hash" x={cx} y={cy + 22} textAnchor="middle">
                  {h}
                </text>
                {labels.map((b, k) => (
                  <text
                    key={b}
                    className={b === repo.head ? 'gs-label gs-label-head' : 'gs-label'}
                    x={cx}
                    y={cy - 16 - k * 12}
                    textAnchor="middle"
                  >
                    {b === repo.head ? `HEAD → ${b}` : b}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function FilesPanel({ sim, repo }: { sim: Sim; repo: Repo }) {
  const snap = headSnap(sim, repo);
  const names = Object.keys(repo.files).sort();
  const badge = (f: string): [string, string] => {
    if (repo.conflict?.files.includes(f)) return ['конфликт', 'conflict'];
    if (!(f in snap) && !(f in repo.index)) return ['не добавлен', 'untracked'];
    if (repo.files[f] !== (repo.index[f] ?? snap[f])) return ['изменён', 'modified'];
    if (f in repo.index && repo.index[f] !== snap[f]) return ['в индексе', 'staged'];
    return ['закоммичен', 'committed'];
  };
  return (
    <div className="gs-files">
      <div className="gs-files-title">Файлы проекта</div>
      {names.length === 0 ? (
        <div className="gs-files-empty">пока пусто — создай файл: edit README.md Привет</div>
      ) : (
        names.map((f) => {
          const [label, cls] = badge(f);
          return (
            <div key={f} className="gs-file">
              <div className="gs-file-head">
                <span className="gs-file-name">{f}</span>
                <span className={`gs-badge gs-badge-${cls}`}>{label}</span>
              </div>
              <pre className="gs-file-content">{repo.files[f]}</pre>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function GitSim({ scenario = 'free', quest, chapterId, trainerId }: GitSimProps) {
  const [sim, setSim] = useState<Sim>(() => makeInitial(scenario));
  const [input, setInput] = useState('');
  const [questDone, setQuestDone] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [stars, setStars] = useState<1 | 2 | 3 | null>(null);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = termRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sim.lines]);

  const afterChange = (next: Sim) => {
    setSim(next);
    if (!quest || questDone || !goalMet(next, quest.goal)) return;
    setQuestDone(true);
    const earnedStars = quest.optimalCommands ? starsFor(next.counters.totalCommands, quest.optimalCommands) : null;
    setStars(earnedStars);
    if (chapterId && trainerId) {
      const prev = store.getProgress().trainers[chapterId]?.[trainerId];
      store.markTrainerDone(chapterId, trainerId, {
        goal: quest.goal,
        scenario,
        commands: next.counters.totalCommands,
        stars: earnedStars,
      });
      if (!prev) {
        const xp = QUEST_XP + (earnedStars === 3 ? STAR_BONUS_XP : 0);
        store.addXp(xp, `trainer:${chapterId}:${trainerId}`);
        setXpAwarded(xp);
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const line = input.trim();
    if (!line) return;
    afterChange(exec(sim, line));
    setInput('');
  };

  const teammate = () => {
    const next = clone(sim);
    const o = next.origin;
    if (!o) return;
    const oh = o.branches[o.head];
    const snap = { ...(next.commits[oh]?.snap ?? {}) };
    snap['notes.txt'] = `заметка коллеги №${next.order.length}`;
    const h = createCommit(next, o, 'правка коллеги', oh ? [oh] : [], snap);
    o.files = { ...snap };
    next.lines.push({ t: 'hint', s: `(коллега запушил коммит ${h} в origin/main — графы разошлись)` });
    afterChange(next);
  };

  const prompt = sim.local.initialized
    ? `project (${sim.local.head}${sim.local.conflict ? '|MERGING' : ''}) $`
    : 'project $';

  return (
    <div className="gs">
      {quest ? (
        <div className={questDone ? 'gs-quest gs-quest-done' : 'gs-quest'}>
          {questDone ? (
            <>
              ✓ Квест выполнен: {quest.title}
              {stars !== null ? (
                <span
                  className="gs-stars"
                  title={`Команд использовано: ${sim.counters.totalCommands}, эталон: ${quest.optimalCommands}`}
                >
                  {' '}
                  {'★'.repeat(stars)}
                  {'☆'.repeat(3 - stars)}
                </span>
              ) : null}
              {xpAwarded ? <span className="gs-xp"> +{xpAwarded} XP</span> : null}
            </>
          ) : (
            <>
              Квест «{quest.title}»: {GOAL_LABELS[quest.goal]}
              {quest.goal === 'ff-and-merge' ? (
                <div className="gs-quest-steps">
                  <span className={sim.counters.ff ? 'gs-step gs-step-done' : 'gs-step'}>
                    {sim.counters.ff ? '✓' : '○'} шаг 1 — fast-forward: слей ветку, пока main не двигался (без расхождения)
                  </span>
                  <span className={sim.counters.mergeCommit ? 'gs-step gs-step-done' : 'gs-step'}>
                    {sim.counters.mergeCommit ? '✓' : '○'} шаг 2 — merge-коммит: вернись, создай расхождение (свой коммит и в
                    main, и в ветке) и слей снова
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
      <div className="gs-cols">
        <div className="gs-left">
          <div className="gs-term" ref={termRef} aria-label="Вывод терминала">
            {sim.lines.map((l, i) => (
              <div key={i} className={`gs-line gs-line-${l.t}`}>
                {l.t === 'cmd' ? `$ ${l.s}` : l.s}
              </div>
            ))}
          </div>
          <form className="gs-form" onSubmit={onSubmit}>
            <span className="gs-prompt">{prompt}</span>
            <input
              className="gs-input"
              aria-label="Командная строка git"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="например: git status"
              spellCheck={false}
              autoComplete="off"
            />
            <button type="submit" className="gs-run">
              Выполнить
            </button>
          </form>
          <div className="gs-help-line">
            Команды: git config · init · status · add · commit -m · diff · log · branch · switch · merge ·
            restore
            {sim.origin ? ' · push · pull' : ''} · edit &lt;файл&gt; &lt;текст&gt; — изменить файл · help ·
            clear
          </div>
          <FilesPanel sim={sim} repo={sim.local} />
        </div>
        <div className="gs-right">
          <Graph sim={sim} repo={sim.local} title={sim.origin ? 'local' : 'История коммитов'} />
          {sim.origin ? (
            <>
              <Graph sim={sim} repo={sim.origin} title="origin" />
              <button type="button" className="gs-mate" onClick={teammate}>
                Коммит коллеги на origin
              </button>
            </>
          ) : null}
        </div>
      </div>

      <UnderHood>
        Внутри — не настоящий git, а его модель в памяти: коммит — объект с хешем, сообщением, списком родителей и
        полным снимком файлов, а ветка — просто указатель на хеш коммита. Команды меняют этот граф объектов, при этом
        формулировки вывода сняты с настоящего git 2.x, чтобы глаз привыкал к реальному терминалу. Граф справа рисуется
        по тем же объектам: SVG-кружки — коммиты, линии — связи «родитель — потомок», а merge с расхождением создаёт
        коммит с двумя родителями, ровно как в настоящем git. Push и pull в режиме с origin — упрощённая пересылка
        недостающих коммитов между двумя такими репозиториями.
      </UnderHood>
    </div>
  );
}
