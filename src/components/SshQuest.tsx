import React, { useRef, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Тренажёр в духе OverTheWire Bandit: подключиться к серверу по SSH-ключу.
// Учит двум вещам, на которых спотыкаются все новички:
//   1) приватный ключ обязан быть с правами 600 — иначе ssh его игнорирует;
//   2) публичный ключ должен лежать на сервере в authorized_keys.
// Ключ у ученика УЖЕ есть (как будто скопировал с флешки) — но с правами 644 и
// ещё не на сервере. Задача — догадаться, почему ssh отказывает, и починить.

const XP = 15;
const USER = 'student';
const SERVER = 'island@server';
const PRIV = `/home/${USER}/.ssh/id_ed25519`;
const PUB_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... student@laptop';

type Line = { text: string; kind: 'cmd' | 'out' | 'err' | 'ok' };

const HELP = [
  'Доступные команды:',
  '  ls -l ~/.ssh            — файлы ключей и их права',
  '  cat ~/.ssh/id_ed25519.pub — показать публичный ключ',
  '  chmod 600 ~/.ssh/id_ed25519 — закрыть права приватного ключа',
  `  ssh-copy-id ${SERVER}   — положить публичный ключ на сервер`,
  `  ssh ${SERVER}           — подключиться`,
  '  help · clear',
];

export type SshQuestProps = { chapterId?: string; trainerId?: string };

export default function SshQuest({ chapterId, trainerId }: SshQuestProps) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const [lines, setLines] = useState<Line[]>([
    { text: 'Ключ id_ed25519 ты скопировал с флешки в ~/.ssh. Подключись к island@server.', kind: 'out' },
    { text: 'Не выходит? Смотри, ЧТО именно отвечает ssh, и почини причину. Команда help — список команд.', kind: 'out' },
  ]);
  const [input, setInput] = useState('');
  const [priv600, setPriv600] = useState(false); // приватный ключ с правами 600?
  const [onServer, setOnServer] = useState(false); // публичный ключ на сервере?
  const [done, setDone] = useState(false);
  const rewardedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const push = (add: Line[]) => {
    setLines((prev) => {
      const next = [...prev, ...add];
      // прокрутка вниз после рендера
      queueMicrotask(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
      return next;
    });
  };

  const finish = () => {
    setDone(true);
    if (!rewardedRef.current && chapterId && trainerId) {
      rewardedRef.current = true;
      store.markTrainerDone(chapterId, trainerId, { connected: true });
      store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
    }
  };

  const run = (raw: string) => {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (!cmd) return;
    const out: Line[] = [{ text: cmd, kind: 'cmd' }];
    const say = (text: string, kind: Line['kind'] = 'out') => out.push({ text, kind });

    if (cmd === 'help') {
      HELP.forEach((l) => say(l));
    } else if (cmd === 'clear') {
      setLines([]);
      setInput('');
      return;
    } else if (cmd === 'ls -l ~/.ssh' || cmd === 'ls -l ~/.ssh/' || cmd === 'ls ~/.ssh') {
      say(`-rw${priv600 ? '-------' : '-r--r--'} 1 ${USER} ${USER} 411 id_ed25519`);
      say(`-rw-r--r-- 1 ${USER} ${USER}  99 id_ed25519.pub`);
      if (!priv600) say('↑ у приватного ключа права 644 (видят все). ssh такой ключ не примет.', 'out');
    } else if (cmd === 'cat ~/.ssh/id_ed25519.pub') {
      say(PUB_KEY);
    } else if (/^chmod 600 ~\/\.ssh\/id_ed25519$/.test(cmd)) {
      setPriv600(true);
      say('Права приватного ключа теперь 600 — читать может только владелец.', 'ok');
    } else if (/^chmod 6?44 ~\/\.ssh\/id_ed25519$/.test(cmd)) {
      setPriv600(false);
      say('Права ослаблены до 644. Теперь ssh откажется использовать ключ.', 'out');
    } else if (cmd === `ssh-copy-id ${SERVER}` || cmd === 'ssh-copy-id island@server') {
      if (onServer) {
        say('Публичный ключ уже есть на сервере — добавлять второй раз не нужно.');
      } else {
        setOnServer(true);
        say(`Number of key(s) added: 1`);
        say(`Теперь можно: ssh ${SERVER}`, 'ok');
      }
    } else if (cmd === `cat ~/.ssh/authorized_keys` || cmd === `ssh ${SERVER} cat ~/.ssh/authorized_keys`) {
      say(onServer ? PUB_KEY : 'cat: ~/.ssh/authorized_keys: No such file or directory', onServer ? 'out' : 'err');
    } else if (cmd === `ssh ${SERVER}` || cmd === 'ssh island@server') {
      if (!priv600) {
        say('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', 'err');
        say(`Permissions 0644 for '${PRIV}' are too open.`, 'err');
        say('This private key will be ignored.', 'err');
        say(`${SERVER}: Permission denied (publickey).`, 'err');
        say('Подсказка: закрой права ключа — chmod 600.', 'out');
      } else if (!onServer) {
        say(`${SERVER}: Permission denied (publickey).`, 'err');
        say('Подсказка: сервер не знает твой публичный ключ. Положи его: ssh-copy-id.', 'out');
      } else {
        say('Welcome to island server! Вход по ключу выполнен.', 'ok');
        say('island@server:~$ ', 'ok');
        push(out);
        finish();
        setInput('');
        return;
      }
    } else if (cmd.startsWith('ssh-keygen')) {
      say('Ключ у тебя уже есть (id_ed25519). Генерировать новый не нужно — используй этот.');
    } else {
      say(`${cmd.split(' ')[0]}: команда не из этого тренажёра. Список — help.`, 'err');
    }
    push(out);
    setInput('');
  };

  return (
    <div className="sshq">
      <div className="sshq-status" aria-hidden="true">
        <span className={priv600 ? 'sshq-ok' : 'sshq-todo'}>{priv600 ? '✓' : '○'} ключ 600</span>
        <span className={onServer ? 'sshq-ok' : 'sshq-todo'}>{onServer ? '✓' : '○'} ключ на сервере</span>
        <span className={done ? 'sshq-ok' : 'sshq-todo'}>{done ? '✓' : '○'} подключение</span>
      </div>
      <div className="sshq-screen" ref={scrollRef}>
        {lines.map((l, i) => (
          <div key={i} className={`sshq-line sshq-${l.kind}`}>
            {l.kind === 'cmd' ? <span className="sshq-prompt">{USER}@laptop:~$ </span> : null}
            {l.text}
          </div>
        ))}
        {done && <div className="sshq-done">Готово! Ты подключился по ключу. +{XP} XP</div>}
      </div>
      {!done && (
        <form
          className="sshq-inputrow"
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
        >
          <span className="sshq-prompt">{USER}@laptop:~$</span>
          <input
            className="sshq-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="введи команду и нажми Enter (help — список)"
            aria-label="Командная строка тренажёра SSH"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </form>
      )}
    </div>
  );
}
