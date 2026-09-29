import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  fetchProfile,
  fetchSharedNote,
  fetchStudentNotes,
  isLoggedIn,
  listNotes,
  login,
  type MentorNote,
  type Profile,
  type SharedNote,
  type StudentNote,
} from '../lib/account';
import { CHAPTER_TITLES, NoteBody, NoteList, formatWhen } from '../components/Notes';
import '../components/notes.css';

// /notes — три вида на одном адресе:
//   ?s=<токен>  чужая заметка по ссылке, читается без входа;
//   «Мои»       свой блокнот целиком, с поиском и фильтром по главе;
//   «Учеников»  для наставника: заметки его групп (корневому — всех).

function chapterLink(id: string | null) {
  if (!id) return null;
  return <span>{CHAPTER_TITLES[id] ?? id}</span>;
}

function matches(q: string, ...fields: (string | null | undefined)[]) {
  const needle = q.trim().toLowerCase();
  return !needle || fields.some((f) => f?.toLowerCase().includes(needle));
}

function SharedView({ token }: { token: string }) {
  const [data, setData] = useState<SharedNote | null | 'missing'>(null);
  useEffect(() => {
    void fetchSharedNote(token).then((d) => setData(d ?? 'missing'));
  }, [token]);
  if (data === null) return <p className="snote-hint">Загружаю…</p>;
  if (data === 'missing') {
    return <p>Заметки по этой ссылке нет: автор закрыл к ней доступ или удалил её.</p>;
  }
  const { note, author } = data;
  return (
    <article className="snote-card">
      <div className="snote-author">
        {author.avatar ? <img src={author.avatar} alt="" /> : null}
        <span>{author.name || author.login}</span>
      </div>
      <h2>{note.title}</h2>
      <p className="snote-meta">
        {note.chapterId ? <>{chapterLink(note.chapterId)} · </> : null}
        обновлено {formatWhen(note.updatedAt)}
      </p>
      <NoteBody text={note.body} />
    </article>
  );
}

function MyNotes() {
  const [notes, setNotes] = useState<StudentNote[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');
  const [chapter, setChapter] = useState('');
  useEffect(() => {
    void listNotes().then((n) => (n ? setNotes(n) : setFailed(true)));
  }, []);
  if (failed) return <p className="snote-error">Не удалось загрузить заметки. Обновите страницу.</p>;
  if (!notes) return <p className="snote-hint">Загружаю…</p>;

  const chapters = [...new Set(notes.map((n) => n.chapterId).filter(Boolean))] as string[];
  const shown = notes.filter((n) => (!chapter || n.chapterId === chapter) && matches(q, n.title, n.body));
  // Правка идёт по отфильтрованному списку: вернувшееся наружу — это он же с
  // изменениями, а скрытые фильтром заметки берём из полного списка как есть.
  const onChange = (next: StudentNote[]) => {
    const hidden = notes.filter((n) => !shown.some((s) => s.id === n.id));
    setNotes([...next, ...hidden].sort((a, b) => b.updatedAt - a.updatedAt));
  };

  return (
    <>
      {notes.length > 3 ? (
        <div className="snote-toolbar">
          <input placeholder="Поиск по заметкам" value={q} onChange={(e) => setQ(e.target.value)} />
          {chapters.length ? (
            <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
              <option value="">Все главы</option>
              {chapters.map((c) => (
                <option key={c} value={c}>
                  {CHAPTER_TITLES[c] ?? c}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}
      <NoteList notes={shown} onChange={onChange} showChapter />
      {notes.length === 0 ? (
        <p className="snote-hint" style={{ marginTop: '1rem' }}>
          Заметку можно завести и прямо в главе — кнопка «Заметки» у правого края.
        </p>
      ) : null}
    </>
  );
}

function StudentNotes() {
  const [notes, setNotes] = useState<MentorNote[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');
  const [who, setWho] = useState('');
  useEffect(() => {
    void fetchStudentNotes().then((n) => (n ? setNotes(n) : setFailed(true)));
  }, []);
  const people = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of notes ?? []) m.set(n.author.login, n.author.name || n.author.login);
    return [...m].sort((a, b) => a[1].localeCompare(b[1], 'ru'));
  }, [notes]);

  if (failed) return <p className="snote-error">Не удалось загрузить заметки учеников.</p>;
  if (!notes) return <p className="snote-hint">Загружаю…</p>;
  if (!notes.length) return <p>У ваших учеников пока нет заметок.</p>;

  const shown = notes.filter(
    (n) =>
      (!who || n.author.login === who) &&
      matches(q, n.title, n.body, n.author.login, n.author.name, n.chapterId && CHAPTER_TITLES[n.chapterId]),
  );
  return (
    <>
      <div className="snote-toolbar">
        <input placeholder="Поиск: текст, ученик, глава" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={who} onChange={(e) => setWho(e.target.value)}>
          <option value="">Все ученики ({people.length})</option>
          {people.map(([login, name]) => (
            <option key={login} value={login}>
              {name === login ? login : `${name} (@${login})`}
            </option>
          ))}
        </select>
      </div>
      <div className="snote-list">
        {shown.map((n) => (
          <article key={n.id} className="snote-card">
            <div className="snote-author">
              {n.author.avatar ? <img src={n.author.avatar} alt="" /> : null}
              <span>{n.author.name || n.author.login}</span>
            </div>
            <span className="snote-card-title">{n.title}</span>
            <span className="snote-meta">
              {n.chapterId ? <>{chapterLink(n.chapterId)} · </> : null}
              {formatWhen(n.updatedAt)}
              {n.shared ? ' · открыта по ссылке' : ''}
            </span>
            {n.body.trim() ? <NoteBody text={n.body} /> : null}
          </article>
        ))}
      </div>
    </>
  );
}

function NotesApp() {
  const token = new URLSearchParams(window.location.search).get('s');
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [tab, setTab] = useState<'mine' | 'students'>('mine');
  useEffect(() => {
    if (!token) void fetchProfile().then(setProfile);
  }, [token]);

  if (token) return <SharedView token={token} />;
  if (!isLoggedIn()) {
    return (
      <div className="snote-empty">
        <p>Заметки хранятся в аккаунте. Войдите, чтобы вести их и делиться ими.</p>
        <button type="button" className="button button--primary" onClick={() => login()}>
          Войти через GitHub
        </button>
      </div>
    );
  }
  if (profile === undefined) return <p className="snote-hint">Загружаю…</p>;

  return (
    <>
      {profile?.mentor ? (
        <div className="snote-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'mine'}
            className={`button button--sm ${tab === 'mine' ? 'button--primary' : 'button--secondary'}`}
            onClick={() => setTab('mine')}
          >
            Мои
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'students'}
            className={`button button--sm ${tab === 'students' ? 'button--primary' : 'button--secondary'}`}
            onClick={() => setTab('students')}
          >
            Заметки учеников
          </button>
        </div>
      ) : null}
      {tab === 'students' && profile?.mentor ? <StudentNotes /> : <MyNotes />}
      <p className="snote-privacy">
        Ваши заметки видите вы и ваш наставник. Остальным — только по ссылке, которую вы сами дадите; доступ
        можно закрыть в любой момент. <Link to="/favorites">Избранное</Link> — для закладок на блоки глав.
      </p>
    </>
  );
}

export default function NotesPage() {
  return (
    <Layout title="Заметки" description="Личные заметки ученика: писать, хранить, делиться ссылкой">
      <main className="snote-page">
        <h1>Заметки</h1>
        <BrowserOnly fallback={<p className="snote-hint">Загружаю…</p>}>{() => <NotesApp />}</BrowserOnly>
      </main>
    </Layout>
  );
}
