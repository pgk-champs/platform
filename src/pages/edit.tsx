import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import tracks from '../data/tracks.json';
import { checkPage, nextNumber, slugify, template } from '../lib/pageDraft';
import {
  fetchContentFile,
  fetchContentMeta,
  isLoggedIn,
  login,
  saveContentFile,
  type ContentMeta,
} from '../lib/account';
import '../components/trainers.css';
import './edit.css';

type TrackDef = { dir: string; label: string; audience: string; blurb?: string };
const TRACKS = tracks as TrackDef[];

function Editor() {
  const [meta, setMeta] = useState<ContentMeta | null>(null);
  const [path, setPath] = useState('');
  const [text, setText] = useState('');
  const [sha, setSha] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [filter, setFilter] = useState('');

  // форма создания
  const [creating, setCreating] = useState(false);
  const [nTrack, setNTrack] = useState(TRACKS[0]?.dir ?? 'mobile');
  const [nTitle, setNTitle] = useState('');

  useEffect(() => {
    void fetchContentMeta().then(setMeta);
  }, []);

  const files = meta?.files ?? [];
  const shown = useMemo(
    () => files.filter((f) => f.toLowerCase().includes(filter.toLowerCase())).slice(0, 400),
    [files, filter],
  );
  const kind: 'chapter' | 'page' = /kind:\s*'page'/.test(text) ? 'page' : 'chapter';
  const problems = text ? checkPage(text, kind) : [];

  async function open(p: string) {
    setBusy(true);
    setNote(null);
    const f = await fetchContentFile(p);
    setBusy(false);
    if (!f) return setNote({ kind: 'err', text: 'не удалось открыть страницу' });
    setPath(f.path);
    setText(f.text);
    setSha(f.sha);
  }

  function startNew() {
    const slug = slugify(nTitle);
    if (!slug) return setNote({ kind: 'err', text: 'сначала впишите заголовок' });
    const track = TRACKS.find((t) => t.dir === nTrack)!;
    const num = nextNumber(files, nTrack);
    const p = `docs/${nTrack}/${num}-${slug}.mdx`;
    if (files.includes(p)) return setNote({ kind: 'err', text: 'страница с таким адресом уже есть' });
    setPath(p);
    setSha('');
    setText(template({ kind: 'page', title: nTitle, slug, track: nTrack, num, audience: track.audience }));
    setCreating(false);
    setNote({ kind: 'ok', text: `заготовка готова: ${p}` });
  }

  async function save() {
    if (!path || !text.trim()) return;
    setBusy(true);
    setNote(null);
    const r = await saveContentFile({ path, text, sha: sha || undefined });
    setBusy(false);
    if (!r.ok) return setNote({ kind: 'err', text: r.error });
    if (r.sha) setSha(r.sha);
    setNote({ kind: 'ok', text: 'сохранено — страница появится на сайте через несколько минут' });
    void fetchContentMeta().then(setMeta);
  }

  function insert(snippet: string) {
    setText((t) => (t.endsWith('\n') ? t : t + '\n') + snippet + '\n');
  }

  if (!isLoggedIn())
    return (
      <div className="ed-center">
        <p>Чтобы править страницы, войдите через GitHub.</p>
        <button className="button button--primary" onClick={() => login()}>Войти</button>
      </div>
    );

  if (!meta) return <p className="ac-muted">Загружаю…</p>;

  if (!meta.canEdit)
    return (
      <div className="ed-center">
        <h2>Нет доступа</h2>
        <p className="ac-muted">
          Править страницы может только автор. Попросите наставника выдать вам эту роль —
          он делает это в своём разделе, по вашему логину на GitHub.
        </p>
        <p className="ac-muted">
          Как всё устроено и что можно добавить — в гайде{' '}
          <a href="/docs/advanced/kak-dobavit-stranicu">«Как добавить материал»</a>.
        </p>
        {!meta.configured && (
          <p className="ac-muted">
            Кроме того, на сервере ещё не настроен ключ доступа — без него сохранение не работает.
          </p>
        )}
      </div>
    );

  return (
    <div className="ed-wrap">
      <aside className="ed-side">
        <button className="button button--primary button--block" onClick={() => setCreating((v) => !v)}>
          {creating ? 'Отмена' : '+ Новая страница'}
        </button>

        {creating && (
          <div className="ed-new">
            <label className="ed-label">
              Раздел
              <select value={nTrack} onChange={(e) => setNTrack(e.target.value)}>
                {TRACKS.map((t) => (
                  <option key={t.dir} value={t.dir}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="ed-label">
              Заголовок
              <input
                value={nTitle}
                onChange={(e) => setNTitle(e.target.value)}
                placeholder="Например: Корзина и заказ"
              />
            </label>

            {nTitle && (
              <p className="ed-hint">
                Адрес: <code>docs/{nTrack}/{nextNumber(files, nTrack)}-{slugify(nTitle)}.mdx</code>
              </p>
            )}
            <button className="button button--secondary button--block" onClick={startNew}>Создать заготовку</button>
            <p className="ed-hint">
              Получится страница: текст, подсказки и код. Глава — с обложкой, схемами, экзаменом
              и видео — заводится в репозитории, попросите наставника.
            </p>
          </div>
        )}

        <input
          className="ed-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Поиск среди ${files.length} страниц`}
        />

        <ul className="ed-list">
          {shown.map((f) => (
            <li key={f}>
              <button className={f === path ? 'ed-item ed-item--on' : 'ed-item'} onClick={() => void open(f)}>
                {f.replace('docs/', '')}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="ed-main">
        {!path ? (
          <div className="ed-empty">
            <h2>Выберите страницу слева или создайте новую</h2>
            <p className="ac-muted">
              Страница — это текст с подсказками: памятка, объявление, разбор задания.
              Она появляется в меню раздела и в маршруте сразу после сборки.
            </p>
            <p className="ac-muted">
              Порядок целиком — в главе{' '}
              <a href="/docs/advanced/kak-dobavit-stranicu">«Как добавить материал»</a>.
            </p>
          </div>
        ) : (
          <>
            <div className="ed-bar">
              <code className="ed-path">{path}</code>
              <span className="ed-kind">{kind === 'page' ? 'простая страница' : 'глава'}</span>
              <span className="ed-spacer" />
              <button className="button button--primary" disabled={busy || !!problems.length} onClick={() => void save()}>
                {busy ? 'Сохраняю…' : sha ? 'Сохранить' : 'Создать'}
              </button>
            </div>

            <div className="ed-tools">
              <button onClick={() => insert('<Hint type="tip">\nПодсказка.\n</Hint>')}>+ подсказка</button>
              <button onClick={() => insert('## Заголовок раздела\n\nТекст.')}>+ раздел</button>
              <button
                onClick={() =>
                  insert(
                    '<Block kind="quiz">\n<SelfCheck chapterId="ID" questions={[\n  { q: \'Вопрос?\', options: [\'А\', \'Б\', \'В\', \'Г\'], correct: 1, why: \'Почему.\' },\n]} />\n</Block>',
                  )
                }
              >
                + проверь себя
              </button>
              <button onClick={() => insert('```kotlin\nval x = 1\n```')}>+ код</button>
            </div>

            {!!problems.length && (
              <ul className="ed-problems">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}

            {note && <p className={note.kind === 'ok' ? 'ed-ok' : 'ed-err'}>{note.text}</p>}

            <textarea
              className="ed-text"
              value={text}
              spellCheck={false}
              onChange={(e) => setText(e.target.value)}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default function EditPage(): React.ReactElement {
  return (
    <Layout title="Правка страниц" description="Добавление и правка страниц платформы">
      <main className="container margin-vert--lg">
        <h1>Правка страниц</h1>
        <BrowserOnly fallback={<p className="ac-muted">Загружаю…</p>}>{() => <Editor />}</BrowserOnly>
      </main>
    </Layout>
  );
}
