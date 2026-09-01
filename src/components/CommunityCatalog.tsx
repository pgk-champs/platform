import React, { useEffect, useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import { decodePreset, encodePreset, ENGINE_LABELS, type SharedPreset } from './GymBuilder';
import './trainers.css';

// Каталог контента от студентов (/community, пакет community): клиентский
// fetch публичного community.json из pgk-champs/community, карточки с
// фильтрами по типу/главе/автору. Пресеты запускаются в конструкторе /gym
// через тот же URL-hash, что и «Поделиться» наставника; ссылки и репозитории
// открываются наружу. Никакого исполнения чужого кода — только данные для
// наших движков и https-ссылки (это же проверяет бот при приёме).

export const COMMUNITY_JSON_URL =
  'https://raw.githubusercontent.com/pgk-champs/community/main/community.json';
export const SUBMIT_URL =
  'https://github.com/pgk-champs/leaderboard/issues/new?template=submit-content.yml';

export type CommunityItem = {
  id: string;
  type: 'preset' | 'repo' | 'link';
  title: string;
  author: string;
  chapterId?: string;
  data: unknown;
  addedAt: string;
};

export const TYPE_LABELS: Record<CommunityItem['type'], string> = {
  preset: 'Пресет тренажёра',
  repo: 'Репозиторий',
  link: 'Ссылка',
};

// Защитный разбор: бот пишет каталог сам, но битые записи не должны
// ронять страницу — просто выпадают из списка.
export function parseItems(raw: unknown): CommunityItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is CommunityItem =>
      !!x &&
      typeof x === 'object' &&
      typeof (x as CommunityItem).id === 'string' &&
      ['preset', 'repo', 'link'].includes((x as CommunityItem).type) &&
      typeof (x as CommunityItem).title === 'string' &&
      typeof (x as CommunityItem).author === 'string',
  );
}

// Пресет валиден, если переживает round-trip через кодек конструктора —
// та же проверка, что у ссылок «Поделиться», без дублирования правил.
export function presetHash(item: CommunityItem): string | null {
  const d = item.data as Partial<SharedPreset> | null;
  if (!d || typeof d !== 'object') return null;
  const candidate = { ...d, name: typeof d.name === 'string' && d.name ? d.name : item.title };
  const encoded = encodePreset(candidate as SharedPreset);
  return decodePreset(encoded) ? `#preset=${encoded}` : null;
}

function externalUrl(item: CommunityItem): string | null {
  return typeof item.data === 'string' && item.data.startsWith('https://') ? item.data : null;
}

const ALL = 'all';

type State = { phase: 'loading' } | { phase: 'error' } | { phase: 'ready'; items: CommunityItem[] };

export default function CommunityCatalog() {
  const [state, setState] = useState<State>({ phase: 'loading' });
  const [type, setType] = useState(ALL);
  const [chapter, setChapter] = useState(ALL);
  const [author, setAuthor] = useState(ALL);

  // Fetch только на клиенте: useEffect не выполняется при SSR-сборке.
  useEffect(() => {
    let alive = true;
    fetch(COMMUNITY_JSON_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => alive && setState({ phase: 'ready', items: parseItems(json) }))
      .catch(() => alive && setState({ phase: 'error' }));
    return () => {
      alive = false;
    };
  }, []);

  const items = state.phase === 'ready' ? state.items : [];
  const chapters = useMemo(
    () => [...new Set(items.map((i) => i.chapterId).filter(Boolean))] as string[],
    [items],
  );
  const authors = useMemo(() => [...new Set(items.map((i) => i.author))], [items]);
  const filtered = items.filter(
    (i) =>
      (type === ALL || i.type === type) &&
      (chapter === ALL || i.chapterId === chapter) &&
      (author === ALL || i.author === author),
  );

  return (
    <section className="cc">
      <div className="cc-head">
        <p>
          Здесь собрано то, что сделали сами студенты: наборы для тренажёров, ссылки на свои
          репозитории и полезные инструменты. Пресеты запускаются прямо в зале, остальное открывается
          в новой вкладке.
        </p>
        <p>
          Хочешь добавить своё? Возьми у наставника секретный код и заполни форму — после проверки
          материал появится в каталоге.
        </p>
        <a className="button button--primary" href={SUBMIT_URL} target="_blank" rel="noreferrer">
          Добавить своё
        </a>
      </div>
      {state.phase === 'loading' ? (
        <p className="cc-status" role="status">
          Загружаем каталог…
        </p>
      ) : null}
      {state.phase === 'error' ? (
        <p className="cc-status" role="status">
          Каталог сейчас не открывается — проверь интернет и обнови страницу. Если не помогло, он
          вернётся чуть позже сам.
        </p>
      ) : null}
      {state.phase === 'ready' ? (
        <>
          <div className="cc-filters">
            <label>
              Тип:
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value={ALL}>все</option>
                {(Object.keys(TYPE_LABELS) as CommunityItem['type'][]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Глава:
              <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
                <option value={ALL}>все</option>
                {chapters.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Автор:
              <select value={author} onChange={(e) => setAuthor(e.target.value)}>
                <option value={ALL}>все</option>
                {authors.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {items.length === 0 ? (
            <p className="cc-status">
              Каталог пока пуст — стань первым: возьми код у наставника и добавь свой материал.
            </p>
          ) : filtered.length === 0 ? (
            <p className="cc-status">По таким фильтрам ничего нет — попробуй сбросить их на «все».</p>
          ) : (
            <div className="cc-grid">
              {filtered.map((item) => {
                const hash = item.type === 'preset' ? presetHash(item) : null;
                const url = item.type !== 'preset' ? externalUrl(item) : null;
                const engine =
                  item.type === 'preset' ? (item.data as SharedPreset | null)?.engine : undefined;
                return (
                  <article key={item.id} className="cc-card">
                    <span className={`cc-badge cc-badge-${item.type}`}>
                      {TYPE_LABELS[item.type]}
                      {engine && ENGINE_LABELS[engine] ? ` · ${ENGINE_LABELS[engine]}` : ''}
                    </span>
                    <h3 className="cc-title">{item.title}</h3>
                    <p className="cc-meta">
                      автор: {item.author}
                      {item.chapterId ? ` · глава: ${item.chapterId}` : ''}
                    </p>
                    {hash ? (
                      <Link className="button button--sm button--primary" to={`/gym${hash}`}>
                        Запустить
                      </Link>
                    ) : null}
                    {url ? (
                      <a
                        className="button button--sm button--secondary"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть
                      </a>
                    ) : null}
                    {!hash && !url ? (
                      <p className="cc-meta">Данные этой записи не читаются — сообщи наставнику.</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
