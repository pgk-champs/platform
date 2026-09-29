import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import {
  createNote,
  deleteNote,
  noteShareUrl,
  shareNote,
  updateNote,
  type StudentNote,
} from '../lib/account';
import knowledgeMap from '../data/knowledge-map.json';
import './notes.css';

// Заметки ученика: один список на двоих — панель в главе и страница /notes.
// Текст хранится и показывается как есть (white-space: pre-wrap), без
// markdown: заметку читают по ссылке чужие люди, и разметка из чужих рук —
// лишний путь для вредного HTML.

export const CHAPTER_TITLES: Record<string, string> = Object.fromEntries(
  (knowledgeMap as { id: string; title: string }[]).map((e) => [e.id, e.title]),
);
const CHAPTER_OPTIONS = (knowledgeMap as { id: string; title: string }[])
  .map((e) => ({ id: e.id, title: e.title }))
  .sort((a, b) => a.title.localeCompare(b.title, 'ru'));

export function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

type EditorProps = {
  note: StudentNote | null;
  defaultChapter?: string;
  chapterPicker: boolean;
  onSaved: (n: StudentNote) => void;
  onCancel: () => void;
  onDeleted?: (id: number) => void;
};

function NoteEditor({ note, defaultChapter, chapterPicker, onSaved, onCancel, onDeleted }: EditorProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [chapter, setChapter] = useState(note?.chapterId ?? defaultChapter ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => area.current?.focus(), []);

  const save = async () => {
    if (!title.trim() && !body.trim()) {
      setError('Пустую заметку не сохранить');
      return;
    }
    setBusy(true);
    setError('');
    const draft = { title, body, chapterId: chapter || null };
    const saved = note ? await updateNote(note.id, draft) : await createNote(draft);
    setBusy(false);
    if (saved) onSaved(saved);
    else setError('Не сохранилось — проверьте сеть и попробуйте ещё раз');
  };

  const remove = async () => {
    if (!note || !window.confirm(`Удалить заметку «${note.title}»?`)) return;
    setBusy(true);
    if (await deleteNote(note.id)) onDeleted?.(note.id);
    else setError('Не удалилось — попробуйте ещё раз');
    setBusy(false);
  };

  return (
    <form
      className="snote-editor"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void save();
        if (e.key === 'Escape') {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <input
        className="snote-title-input"
        placeholder="Заголовок"
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        ref={area}
        className="snote-body-input"
        placeholder="Что хочется запомнить своими словами…"
        value={body}
        maxLength={20000}
        rows={8}
        onChange={(e) => setBody(e.target.value)}
      />
      {chapterPicker ? (
        <label className="snote-chapter">
          <span>Глава</span>
          <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
            <option value="">— без главы —</option>
            {CHAPTER_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className="snote-error">{error}</p> : null}
      <div className="snote-actions">
        <button type="submit" className="button button--primary button--sm" disabled={busy}>
          Сохранить
        </button>
        <button type="button" className="button button--secondary button--sm" onClick={onCancel} disabled={busy}>
          Отмена
        </button>
        {note && onDeleted ? (
          <button type="button" className="snote-delete" onClick={() => void remove()} disabled={busy}>
            Удалить
          </button>
        ) : null}
      </div>
      <p className="snote-hint">Ctrl/⌘ + Enter — сохранить</p>
    </form>
  );
}

function ShareRow({ note, onChange }: { note: StudentNote; onChange: (n: StudentNote) => void }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const toggle = async (on: boolean) => {
    setBusy(true);
    const n = await shareNote(note.id, on);
    setBusy(false);
    if (n) onChange(n);
    if (n?.shareToken) void copy(n.shareToken);
  };
  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(noteShareUrl(token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // буфер обмена недоступен — ссылка видна в поле, её можно выделить руками
    }
  };

  if (!note.shareToken) {
    return (
      <button type="button" className="snote-link-btn" disabled={busy} onClick={() => void toggle(true)}>
        Поделиться ссылкой
      </button>
    );
  }
  return (
    <div className="snote-share">
      <input readOnly value={noteShareUrl(note.shareToken)} onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="snote-link-btn" onClick={() => void copy(note.shareToken!)}>
        {copied ? 'Скопировано' : 'Копировать'}
      </button>
      <button type="button" className="snote-link-btn snote-link-btn--off" disabled={busy} onClick={() => void toggle(false)}>
        Закрыть доступ
      </button>
    </div>
  );
}

export function NoteBody({ text }: { text: string }) {
  return <div className="snote-body">{text}</div>;
}

type ListProps = {
  notes: StudentNote[];
  onChange: (notes: StudentNote[]) => void;
  /** В главе новая заметка сразу к ней привязана, выбора главы нет. */
  chapterId?: string;
  /** На /notes у каждой заметки видна её глава. */
  showChapter?: boolean;
};

export function NoteList({ notes, onChange, chapterId, showChapter }: ListProps) {
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const replace = (n: StudentNote) => onChange([n, ...notes.filter((x) => x.id !== n.id)]);

  return (
    <div className="snote-list">
      {editing === 'new' ? (
        <NoteEditor
          note={null}
          defaultChapter={chapterId}
          chapterPicker={!chapterId}
          onSaved={(n) => {
            replace(n);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button type="button" className="snote-new" onClick={() => setEditing('new')}>
          + Новая заметка
        </button>
      )}
      {notes.map((n) =>
        editing === n.id ? (
          <NoteEditor
            key={n.id}
            note={n}
            chapterPicker={!chapterId}
            onSaved={(saved) => {
              // Заметку увели в другую главу — из панели этой главы она уходит.
              if (chapterId && saved.chapterId !== chapterId) onChange(notes.filter((x) => x.id !== saved.id));
              else replace(saved);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
            onDeleted={(id) => {
              onChange(notes.filter((x) => x.id !== id));
              setEditing(null);
            }}
          />
        ) : (
          <article key={n.id} className="snote-card">
            <button type="button" className="snote-open" onClick={() => setEditing(n.id)} title="Редактировать">
              <span className="snote-card-title">{n.title}</span>
              <span className="snote-meta">
                {showChapter && n.chapterId ? `${CHAPTER_TITLES[n.chapterId] ?? n.chapterId} · ` : ''}
                {formatWhen(n.updatedAt)}
                {n.shareToken ? ' · по ссылке' : ''}
              </span>
            </button>
            {n.body.trim() ? <NoteBody text={n.body} /> : null}
            <ShareRow note={n} onChange={replace} />
          </article>
        ),
      )}
    </div>
  );
}

export function NotesPrivacy() {
  return (
    <p className="snote-privacy">
      Заметки видите вы и ваш наставник. Остальным — только по ссылке, которую вы сами дадите.{' '}
      <Link to="/notes">Все заметки →</Link>
    </p>
  );
}
