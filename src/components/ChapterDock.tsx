import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import { isLoggedIn, listNotes, login, subscribe, type StudentNote } from '../lib/account';
import { NoteList, NotesPrivacy } from './Notes';
import './notes.css';

// Кнопки у правого края главы: режим чтения и заметки. Стоят в футере главы
// (src/theme/DocItem/Footer), поэтому есть в каждой главе без правки mdx —
// так же, как видео и материалы сообщества.

function ChapterNotesDrawer({ chapterId, onClose }: { chapterId: string; onClose: () => void }) {
  const logged = useSyncExternalStore(subscribe, isLoggedIn, () => false);
  const [notes, setNotes] = useState<StudentNote[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!logged) return;
    let alive = true;
    void listNotes(chapterId).then((n) => {
      if (!alive) return;
      if (n) setNotes(n);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [chapterId, logged]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <aside className="snote-drawer" role="dialog" aria-label="Заметки к главе">
      <header className="snote-drawer-head">
        <strong>Мои заметки к главе</strong>
        <button type="button" className="snote-close" aria-label="Закрыть" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="snote-drawer-body">
        {!logged ? (
          <div className="snote-empty">
            <p>Заметки хранятся в аккаунте — так они не пропадут и откроются с любого компьютера.</p>
            <button type="button" className="button button--primary button--sm" onClick={() => login()}>
              Войти через GitHub
            </button>
          </div>
        ) : failed ? (
          <p className="snote-error">Не удалось загрузить заметки. Обновите страницу.</p>
        ) : notes === null ? (
          <p className="snote-hint">Загружаю…</p>
        ) : (
          <>
            <NoteList notes={notes} onChange={setNotes} chapterId={chapterId} />
            <NotesPrivacy />
          </>
        )}
      </div>
    </aside>
  );
}

export default function ChapterDock({ chapterId }: { chapterId: string }) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  // Состояние режима чтения живёт в localStorage — до монтирования его не
  // знаем, и кнопка рисуется в нейтральном виде, как на сервере.
  const focus = mounted && store.prefs.getFocus();

  return (
    <>
      <div className="snote-dock">
        <button
          type="button"
          className={`snote-dock-btn${focus ? ' snote-dock-btn--on' : ''}`}
          aria-pressed={focus}
          title={focus ? 'Вернуть боковое меню и оглавление' : 'Режим чтения: спрятать боковое меню и оглавление'}
          onClick={() => store.prefs.setFocus(!focus)}
        >
          <span aria-hidden="true">{focus ? '⇥' : '⇤'}</span>
          <span className="snote-dock-label">{focus ? 'Обычный вид' : 'Режим чтения'}</span>
        </button>
        <button
          type="button"
          className={`snote-dock-btn${open ? ' snote-dock-btn--on' : ''}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true">✎</span>
          <span className="snote-dock-label">Заметки</span>
        </button>
      </div>
      {open ? <ChapterNotesDrawer chapterId={chapterId} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
