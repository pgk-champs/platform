import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Игрушечный файловый менеджер: нативный HTML5 drag-and-drop, мультивыбор
// Ctrl/Shift+клик, ПКМ-меню. Готовых библиотек под учебную задачу нет (только
// production-браузеры или детские игры) — свой минимум специально под три
// GUI-действия из таблицы-мостика: переименование, перемещение, копирование.
// Каждое действие пишет в журнал эквивалентную команду терминала — это и есть
// смысл тренажёра: показать, что под капотом GUI и есть mv/cp.
// ponytail: HTML5 drag-and-drop — только мышь, у клавиатуры и тача нет пути
// к перемещению/копированию (сам жест недоступен, это ограничение самого
// API, не только этого компонента). Переименование и мультивыбор клавиатурой
// работают (F2, Ctrl/Shift+клик). Если для тача/скринридера понадобится
// перемещать файлы — добавить кнопки «Переместить сюда»/«Копировать сюда» в
// зонах как альтернативный путь к тому же onZoneDrop-обработчику.

type Loc = 'source' | 'archive' | 'diskD';
type FileItem = { id: string; name: string; loc: Loc };

const INITIAL: FileItem[] = [
  { id: 'f1', name: 'report.txt', loc: 'source' },
  { id: 'f2', name: 'photo.jpg', loc: 'source' },
  { id: 'f3', name: 'notes.txt', loc: 'source' },
  { id: 'f4', name: 'archive_old.zip', loc: 'source' },
  { id: 'f5', name: 'todo.txt', loc: 'source' },
];

const XP = 20;

function fileIcon(name: string): string {
  if (name.endsWith('.zip')) return '🗜️';
  if (name.endsWith('.jpg') || name.endsWith('.png')) return '🖼️';
  return '📄';
}

export default function MiniFileManager({ chapterId, trainerId }: { chapterId?: string; trainerId?: string }) {
  const [files, setFiles] = useState<FileItem[]>(INITIAL);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [anchorIdx, setAnchorIdx] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [dragOverZone, setDragOverZone] = useState<Loc | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [didRename, setDidRename] = useState(false);
  const [didMove, setDidMove] = useState(false);
  const [didCopy, setDidCopy] = useState(false);
  const rewardedRef = useRef(false);
  const copyCounter = useRef(1);

  const source = files.filter((f) => f.loc === 'source');
  const archive = files.filter((f) => f.loc === 'archive');
  const diskD = files.filter((f) => f.loc === 'diskD');

  const isDone = didRename && didMove && didCopy;

  useEffect(() => {
    if (!isDone || !chapterId || !trainerId || rewardedRef.current) return;
    rewardedRef.current = true;
    store.markTrainerDone(chapterId, trainerId, { rename: true, move: true, copy: true });
    store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
  }, [isDone, chapterId, trainerId]);

  // Закрыть контекстное меню по клику вне его — только на клиенте.
  useEffect(() => {
    if (!menu) return undefined;
    const close = () => setMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menu]);

  const appendLog = (line: string) => setLog((l) => [...l, line]);

  const selectOne = (id: string, idx: number) => {
    setSelected(new Set([id]));
    setAnchorIdx(idx);
  };

  const onFileClick = (e: React.MouseEvent, id: string, idx: number) => {
    if (e.shiftKey && anchorIdx !== null) {
      const [from, to] = anchorIdx < idx ? [anchorIdx, idx] : [idx, anchorIdx];
      setSelected(new Set(source.slice(from, to + 1).map((f) => f.id)));
    } else if (e.ctrlKey || e.metaKey) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setAnchorIdx(idx);
    } else {
      selectOne(id, idx);
    }
  };

  const onFileContextMenu = (e: React.MouseEvent, id: string, idx: number) => {
    e.preventDefault();
    if (!selected.has(id)) selectOne(id, idx);
    setMenu({ id, x: e.clientX, y: e.clientY });
  };

  const startRename = (id: string) => {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    setRenamingId(id);
    setRenameValue(f.name);
    setMenu(null);
  };

  const confirmRename = () => {
    if (!renamingId) return;
    const f = files.find((x) => x.id === renamingId);
    const newName = renameValue.trim();
    if (f && newName && newName !== f.name) {
      appendLog(`mv ${f.name} ${newName}`);
      setFiles((fs) => fs.map((x) => (x.id === renamingId ? { ...x, name: newName } : x)));
      setDidRename(true);
    }
    setRenamingId(null);
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F2' && selected.size === 1) {
      startRename([...selected][0]);
    }
  };

  const dragIds = useRef<string[]>([]);

  const onDragStart = (e: React.DragEvent, id: string, idx: number) => {
    const ids = selected.has(id) ? [...selected] : [id];
    if (!selected.has(id)) selectOne(id, idx);
    dragIds.current = ids;
    e.dataTransfer.setData('text/plain', ids.join(','));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const onZoneDrop = (e: React.DragEvent, zone: Extract<Loc, 'archive' | 'diskD'>) => {
    e.preventDefault();
    setDragOverZone(null);
    const raw = e.dataTransfer.getData('text/plain');
    const ids = raw ? raw.split(',') : dragIds.current;
    if (ids.length === 0) return;
    // Тот же диск (Архив) по умолчанию — перемещение (mv), чужой (Диск D:) —
    // копирование (cp). Модификатор переворачивает поведение — как в GNOME
    // Files/Проводнике.
    const defaultCopy = zone === 'diskD';
    const forceCopy = e.ctrlKey && !defaultCopy;
    const forceMove = e.shiftKey && defaultCopy;
    const op: 'move' | 'copy' = forceCopy ? 'copy' : forceMove ? 'move' : defaultCopy ? 'copy' : 'move';

    const moved = files.filter((f) => ids.includes(f.id) && f.loc === 'source');
    if (moved.length === 0) return;

    if (op === 'move') {
      setFiles((fs) => fs.map((f) => (ids.includes(f.id) ? { ...f, loc: zone } : f)));
      appendLog(`mv ${moved.map((f) => f.name).join(' ')} ${zone === 'archive' ? 'Архив/' : 'D:/'}`);
      setDidMove(true);
    } else {
      const copies: FileItem[] = moved.map((f) => ({ id: `copy-${copyCounter.current++}`, name: f.name, loc: zone }));
      setFiles((fs) => [...fs, ...copies]);
      appendLog(`cp ${moved.map((f) => f.name).join(' ')} ${zone === 'archive' ? 'Архив/' : 'D:/'}`);
      setDidCopy(true);
    }
    setSelected(new Set());
  };

  const renderFile = (f: FileItem, idx: number) => {
    if (renamingId === f.id) {
      return (
        <li key={f.id}>
          <input
            className="mfm-rename-input"
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmRename();
              if (e.key === 'Escape') setRenamingId(null);
            }}
            onBlur={confirmRename}
          />
        </li>
      );
    }
    return (
      <li
        key={f.id}
        draggable
        className={selected.has(f.id) ? 'mfm-file-selected' : ''}
        onDragStart={(e) => onDragStart(e, f.id, idx)}
        onClick={(e) => onFileClick(e, f.id, idx)}
        onContextMenu={(e) => onFileContextMenu(e, f.id, idx)}
      >
        {fileIcon(f.name)} {f.name}
      </li>
    );
  };

  return (
    <div className="mfm">
      <p className="mfm-hint">
        Клик — выбрать один файл. <kbd className="keys-kbd">Ctrl</kbd>+клик — добавить к выбору.{' '}
        <kbd className="keys-kbd">Shift</kbd>+клик — выбрать диапазон. ПКМ или <kbd className="keys-kbd">F2</kbd> на
        выбранном — переименовать. Перетащи файл(ы) в один из дисков справа.
      </p>

      <div className="mfm-panes">
        <div className="mfm-pane">
          <div className="mfm-pane-title">Файлы (этот диск)</div>
          <ul className="mfm-list" tabIndex={0} onKeyDown={onListKeyDown}>
            {source.map((f, idx) => renderFile(f, idx))}
            {source.length === 0 ? <li>Пусто</li> : null}
          </ul>
        </div>

        <div
          className={`mfm-zone ${dragOverZone === 'archive' ? 'mfm-zone-over' : ''}`.trim()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverZone('archive');
          }}
          onDragLeave={() => setDragOverZone((z) => (z === 'archive' ? null : z))}
          onDrop={(e) => onZoneDrop(e, 'archive')}
        >
          <div className="mfm-zone-title">📁 Архив (тот же диск)</div>
          <ul>
            {archive.map((f) => (
              <li key={f.id}>{fileIcon(f.name)} {f.name}</li>
            ))}
          </ul>
          <p className="mfm-zone-hint">Просто перетащи — переместит (mv). С Ctrl — скопирует (cp).</p>
        </div>

        <div
          className={`mfm-zone ${dragOverZone === 'diskD' ? 'mfm-zone-over' : ''}`.trim()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverZone('diskD');
          }}
          onDragLeave={() => setDragOverZone((z) => (z === 'diskD' ? null : z))}
          onDrop={(e) => onZoneDrop(e, 'diskD')}
        >
          <div className="mfm-zone-title">💽 Диск D: (другой диск)</div>
          <ul>
            {diskD.map((f) => (
              <li key={f.id}>{fileIcon(f.name)} {f.name}</li>
            ))}
          </ul>
          <p className="mfm-zone-hint">Просто перетащи — скопирует (cp). С Shift — переместит (mv).</p>
        </div>
      </div>

      {menu ? (
        <div className="mfm-menu" style={{ left: menu.x, top: menu.y }} onClick={(e) => e.stopPropagation()}>
          <button type="button" disabled={selected.size !== 1} onClick={() => startRename(menu.id)}>
            Переименовать (F2)
          </button>
        </div>
      ) : null}

      <div className="mfm-log">
        <div className="mfm-log-title">Журнал команд (что происходит «под капотом»)</div>
        {log.length === 0 ? (
          <div className="mfm-log-empty">Пока пусто — начни действовать: переименуй, перетащи, скопируй.</div>
        ) : (
          <ul>
            {log.map((line, i) => (
              <li key={i}>
                <code>$ {line}</code>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isDone ? (
        <div className="mfm-done">
          Готово! Переименование, перемещение и копирование опробованы — теперь видно, что за каждым из них стоит
          {' '}<code>mv</code> или <code>cp</code>.{chapterId && trainerId ? ` +${XP} XP` : ''}
        </div>
      ) : null}
    </div>
  );
}
