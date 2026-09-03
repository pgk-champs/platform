import React, { useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Интерактивное дерево файловой системы из практикума главы про терминал:
// клик по узлу показывает pwd-путь до него и команды cd (относительную и
// абсолютную) из текущего каталога; путь до выбранного узла подсвечивается.
// Мини-квест: добраться из src в docs одной командой (cd ../docs).

type FsNode = { name: string; children?: FsNode[] };

// Дерево практикума: /home/student/project/{README.md, docs/README.md, src/main.py}
const TREE: FsNode = {
  name: 'student',
  children: [
    {
      name: 'project',
      children: [
        { name: 'README.md' },
        { name: 'docs', children: [{ name: 'README.md' }] },
        { name: 'src', children: [{ name: 'main.py' }] },
      ],
    },
  ],
};

// Старт совпадает с условием мини-квеста («ты стоишь в src»): иначе дерево
// показывало бы «← ты здесь» у project, а квест требовал ответ из src.
const START: string[] = ['student', 'project', 'src'];
const QUEST_ANSWER = 'cd ../docs';
const XP = 20;

function abs(segs: string[]): string {
  return '/home/' + segs.join('/');
}

/** Относительный путь между каталогами: общий предок, потом .. вверх и имена вниз. */
export function relPath(from: string[], to: string[]): string {
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i += 1;
  const parts = [...Array<string>(from.length - i).fill('..'), ...to.slice(i)];
  return parts.length ? parts.join('/') : '.';
}

type Info =
  | { kind: 'dir'; from: string[]; to: string[] }
  | { kind: 'same'; to: string[] }
  | { kind: 'file'; to: string[] };

export default function FsTreeViz({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них тренажёр работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [cur, setCur] = useState<string[]>(START);
  const [info, setInfo] = useState<Info | null>(null);
  const [qVal, setQVal] = useState('');
  const [qFb, setQFb] = useState<string | null>(null);
  const [qDone, setQDone] = useState(false);

  const pick = (segs: string[], isDir: boolean) => {
    if (!isDir) {
      setInfo({ kind: 'file', to: segs });
    } else if (segs.join('/') === cur.join('/')) {
      setInfo({ kind: 'same', to: segs });
    } else {
      setInfo({ kind: 'dir', from: cur, to: segs });
      setCur(segs);
    }
  };

  const selKey = info ? info.to.join('/') : null;
  const curKey = cur.join('/');

  const renderNode = (node: FsNode, segs: string[]): React.ReactNode => {
    const key = segs.join('/');
    const isDir = !!node.children;
    const isRoot = segs.length === 1;
    const onPath = selKey !== null && (selKey === key || selKey.startsWith(key + '/'));
    const cls = [
      'ftv-node',
      isDir ? 'ftv-dir' : '',
      onPath ? 'ftv-onpath' : '',
      selKey === key ? 'ftv-sel' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <li key={key}>
        <button type="button" className={cls} onClick={() => pick(segs, isDir)}>
          {isRoot ? abs(segs) : isDir ? `${node.name}/` : node.name}
          {isDir && key === curKey ? <span className="ftv-here"> ← ты здесь</span> : null}
        </button>
        {isDir && node.children!.length > 0 ? (
          <ul>{node.children!.map((c) => renderNode(c, [...segs, c.name]))}</ul>
        ) : null}
      </li>
    );
  };

  const checkQuest = (e: React.FormEvent) => {
    e.preventDefault();
    const norm = qVal.trim().replace(/\s+/g, ' ').replace(/\/+$/, '');
    if (norm === QUEST_ANSWER) {
      setQFb(null);
      setQDone(true);
      if (chapterId && trainerId) {
        const already = store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { solved: true });
        if (!already) store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
      }
    } else if (norm === 'cd /home/student/project/docs') {
      setQFb('Сработает, но это длинный абсолютный путь. Есть короче: поднимись к родителю через .. и сразу спустись в docs.');
    } else if (norm === 'cd docs') {
      setQFb('Из src каталога docs не видно — он лежит рядом, в project. Сначала поднимись к родителю: ..');
    } else if (norm === 'cd ..') {
      setQFb('Это только поднимет тебя в project. Нужно одной командой и подняться, и спуститься в docs — продолжи путь через /.');
    } else {
      setQFb('Не то. Помни: .. поднимает к родителю, а / продолжает путь дальше вниз.');
    }
  };

  return (
    <div className="ftv">
      <ul className="ftv-tree">{renderNode(TREE, ['student'])}</ul>

      {info === null ? (
        <div className="ftv-panel ftv-hint">
          Кликни по любому узлу дерева — увидишь его путь и команду cd, которая туда ведёт.
        </div>
      ) : info.kind === 'file' ? (
        <div className="ftv-panel">
          <div>
            Это файл: <code>{abs(info.to)}</code>
          </div>
          <div className="ftv-hint">
            cd работает только с каталогами — зайти «внутрь файла» нельзя, можно только в его каталог{' '}
            <code>{abs(info.to.slice(0, -1))}</code>.
          </div>
        </div>
      ) : info.kind === 'same' ? (
        <div className="ftv-panel">
          <div>
            <code>pwd</code> → <code>{abs(info.to)}</code>
          </div>
          <div className="ftv-hint">Ты уже здесь — cd не нужен.</div>
        </div>
      ) : (
        <div className="ftv-panel">
          <div>
            <code>pwd</code> → <code>{abs(info.to)}</code>
          </div>
          <div>
            Из <code>{abs(info.from)}</code>:
          </div>
          <div>
            относительно: <code>cd {relPath(info.from, info.to)}</code>
          </div>
          <div>
            абсолютно: <code>cd {abs(info.to)}</code>
          </div>
        </div>
      )}

      <div className="ftv-quest">
        <div className="ftv-quest-title">
          Мини-квест: ты стоишь в <code>src</code>. Доберись в <code>docs</code> за одну команду.
        </div>
        {qDone ? (
          <div className="ftv-done">
            Выполнено! <code>cd ../docs</code> — вверх к project и сразу вниз в docs.
            {chapterId && trainerId ? ` +${XP} XP` : ''}
          </div>
        ) : (
          <form className="ftv-form" onSubmit={checkQuest}>
            <input
              className="ftv-input"
              type="text"
              value={qVal}
              onChange={(e) => setQVal(e.target.value)}
              placeholder="твоя команда"
              aria-label="Команда для квеста"
            />
            <button type="submit" className="ftv-check">
              Проверить
            </button>
          </form>
        )}
        {qFb && !qDone ? <div className="ftv-fb">{qFb}</div> : null}
      </div>
    </div>
  );
}
