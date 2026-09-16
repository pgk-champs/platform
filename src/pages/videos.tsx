import React, { useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import knowledgeMap from '../data/knowledge-map.json';
import allVideos from '../data/chapter-videos.json';
import { isLoggedIn, login, saveChapterVideos, type ChapterVideo } from '../lib/account';
import '../components/trainers.css';
import './edit.css';

// Правка кураторских видео главы. Отдельная страница, а не вкладка редактора:
// редактор пишет тексты, эта — один-единственный файл данных, и права у ручек
// разные намеренно.

type Doc = { id: string; title: string };
const CHAPTERS = knowledgeMap as Doc[];
const BOOK = allVideos as Record<string, ChapterVideo[]>;
const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#]|$)/;

function Editor() {
  const first = CHAPTERS[0]?.id ?? '';
  const [chapterId, setChapterId] = useState(first);
  const [list, setList] = useState<ChapterVideo[]>(() => (BOOK[first] ?? []).slice());
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const pick = (id: string) => {
    setChapterId(id);
    setList((BOOK[id] ?? []).slice());
    setNote(null);
  };

  const add = () => {
    const m = YT.exec(url.trim());
    if (!m) return setNote({ kind: 'err', text: 'это не ссылка на ролик YouTube' });
    if (list.some((v) => v.videoId === m[1])) return setNote({ kind: 'err', text: 'этот ролик уже есть' });
    setList([...list, { videoId: m[1], title: '', channel: '' }]);
    setUrl('');
    setNote(null);
  };

  // Ровно то же, что требует гейт сборки: меньше четырёх или больше пяти он не пропустит.
  const countOk = list.length >= 4 && list.length <= 5;

  const save = async () => {
    setBusy(true);
    setNote(null);
    const r = await saveChapterVideos(chapterId, list);
    setBusy(false);
    setNote(
      r.ok
        ? { kind: 'ok', text: 'сохранено — сайт пересоберётся через несколько минут' }
        : { kind: 'err', text: r.error },
    );
  };

  if (!isLoggedIn())
    return (
      <div className="ed-center">
        <p>Чтобы править видео глав, войдите через GitHub.</p>
        <button className="button button--primary" onClick={() => login()}>Войти</button>
      </div>
    );

  return (
    <div className="ed-main">
      <label className="ed-label">
        Глава
        <select value={chapterId} onChange={(e) => pick(e.target.value)}>
          {CHAPTERS.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </label>

      <div className="cc-rows">
        {list.map((v) => (
          <div className="cc-row" key={v.videoId}>
            <span className="cc-rmain">
              <span className="cc-rtitle">{v.title || v.videoId}</span>
              <span className="cc-rsub">{v.channel || 'канал подставит сервер'}</span>
            </span>
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => setList(list.filter((x) => x.videoId !== v.videoId))}
            >
              Убрать
            </button>
          </div>
        ))}
      </div>

      <div className="ed-tools">
        <input
          className="ed-filter"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Ссылка на ролик YouTube"
          aria-label="Ссылка на ролик"
        />
        <button type="button" className="button button--secondary" onClick={add}>Добавить</button>
      </div>

      {!countOk && (
        <p className="ed-problems">Роликов должно быть от четырёх до пяти, сейчас {list.length}</p>
      )}
      {note && <p className={note.kind === 'ok' ? 'ed-ok' : 'ed-err'}>{note.text}</p>}

      <button className="button button--primary" disabled={busy || !countOk} onClick={() => void save()}>
        {busy ? 'Сохраняю…' : 'Сохранить'}
      </button>
    </div>
  );
}

export default function VideosPage(): React.ReactElement {
  return (
    <Layout title="Видео глав" description="Кураторские видео к главам учебника">
      <main className="container margin-vert--lg">
        <h1>Видео глав</h1>
        <p className="ac-muted">
          Ролики, которые студент видит в подвале главы. Каждый проверяется перед записью:
          удалённый или приватный сохранить нельзя.
        </p>
        <BrowserOnly fallback={<p className="ac-muted">Загружаю…</p>}>{() => <Editor />}</BrowserOnly>
      </main>
    </Layout>
  );
}
