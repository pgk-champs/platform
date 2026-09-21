import React, { useEffect, useMemo, useState } from 'react';
import { fetchApprovedCommunity } from '../lib/account';
import Link from '@docusaurus/Link';
import { decodePreset, encodePreset, ENGINE_LABELS, type SharedPreset } from './GymBuilder';
import PresetStar from './PresetStar';
import { chapterHref, chapterTitle } from './chapterLabels';
import './trainers.css';

// Каталог контента от студентов (/community, пакет community): читает
// /api/community нашего сервера (модерация наставником), карточки с
// фильтрами по типу/главе/автору. Пресеты запускаются в конструкторе /gym
// через тот же URL-hash, что и «Поделиться» наставника; ссылки и репозитории
// открываются наружу. Никакого исполнения чужого кода — только данные для
// наших движков и https-ссылки (это же проверяет бот при приёме).

export type CommunityItem = {
  id: string;
  type: 'preset' | 'repo' | 'link' | 'video' | 'source';
  title: string;
  author: string;
  chapterId?: string;
  data: unknown;
  addedAt: string;
};

export const TYPE_LABELS: Record<CommunityItem['type'], string> = {
  preset: 'Пресет тренажёра',
  repo: 'Репозиторий',
  link: 'Инструмент',
  video: 'Видео',
  source: 'Статья',
};

// Порядок групп постоянный: человек привыкает, где что лежит. Пустая группа не
// исчезает, а объясняет, что в ней появится, — иначе пустой раздел выглядит
// поломкой, а не приглашением.
const GROUPS = [
  { key: 'video', label: 'Видео', types: ['video'] },
  { key: 'read', label: 'Статьи и инструменты', types: ['source', 'link'] },
  { key: 'repo', label: 'Репозитории', types: ['repo'] },
  { key: 'preset', label: 'Пресеты тренажёров', types: ['preset'] },
] as const;

export const EMPTY_HINT: Record<string, string> = {
  video: 'Здесь появятся разборы по темам глав.',
  read: 'Здесь появятся статьи, шпаргалки и полезные инструменты.',
  repo: 'Здесь появятся проекты студентов — например, приложение за конкурсный день.',
  preset: 'Здесь появятся наборы заданий, собранные в конструкторе зала.',
};

export function groupItems(items: CommunityItem[]) {
  return GROUPS.map((g) => ({
    key: g.key as string,
    label: g.label as string,
    items: items.filter((i) => (g.types as readonly string[]).includes(i.type)),
  }));
}

const YT_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#]|$)/;

/** Кадр ролика для карточки. Не YouTube — обложки нет, и карточка её не рисует. */
export function thumbUrl(item: CommunityItem): string | null {
  const url = typeof item.data === 'string' ? item.data : '';
  const m = YT_RE.exec(url);
  return m ? `https://i.ytimg.com/vi/${m[1]}/mqdefault.jpg` : null;
}

// Защитный разбор: бот пишет каталог сам, но битые записи не должны
// ронять страницу — просто выпадают из списка.
export function parseItems(raw: unknown): CommunityItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is CommunityItem =>
      !!x &&
      typeof x === 'object' &&
      typeof (x as CommunityItem).id === 'string' &&
      (x as CommunityItem).type in TYPE_LABELS &&
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

// Глифы типов рисуются, а не берутся эмодзи: эмодзи выглядят по-разному на
// каждой платформе и в списке начинают шуметь.
const GLYPH: Record<string, React.ReactElement> = {
  source: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M15 3v5h5" />
      <path d="M9 12h7M9 16h7" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 13a4 4 0 0 0 5.7.4l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.3 1.3" />
      <path d="M14 11a4 4 0 0 0-5.7-.4l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.3-1.3" />
    </svg>
  ),
  repo: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v4H6.5A2.5 2.5 0 0 1 4 19.5z" />
    </svg>
  ),
};

const hostOf = (u: string) => (u.split('//', 2)[1] || '').split('/', 1)[0].replace('www.', '');

type State = { phase: 'loading' } | { phase: 'error' } | { phase: 'ready'; items: CommunityItem[] };

export default function CommunityCatalog() {
  const [state, setState] = useState<State>({ phase: 'loading' });
  const [type, setType] = useState(ALL);
  const [chapter, setChapter] = useState(ALL);
  const [author, setAuthor] = useState(ALL);

  // Fetch только на клиенте: useEffect не выполняется при SSR-сборке.
  // Единственный источник — сервер. Статический community.json из отдельного
  // репозитория выведен из обращения 16.09.2026: данные переехали в базу, и
  // два источника одного и того же были причиной, по которой в каталоге было
  // непонятно, что за материалы.
  useEffect(() => {
    let alive = true;
    fetchApprovedCommunity()
      .then((server) => {
        if (!alive) return;
        // null — сервер не ответил. Пустой каталог и недоступный каталог это
        // разные вещи, и человеку надо сказать разное.
        setState(server === null ? { phase: 'error' } : { phase: 'ready', items: parseItems(server) });
      })
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
  // Чип хранит ключ ГРУППЫ, а не тип записи: «Статьи и инструменты» — это два типа.
  const byChip = (i: CommunityItem) =>
    type === ALL || (groupItems([i]).find((g) => g.items.length > 0)?.key ?? '') === type;
  const filtered = items.filter(
    (i) => byChip(i) && (chapter === ALL || i.chapterId === chapter) && (author === ALL || i.author === author),
  );

  return (
    <section className="cmc">
      <div className="cc-head">
        <p>
          Материалы, которые собрали кураторы и принесли студенты. Пресеты запускаются прямо в
          зале, остальное открывается в новой вкладке.
        </p>
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
          <div className="cc-chips" role="group" aria-label="Тип материала">
            {[{ key: ALL, label: 'Всё', n: items.length }, ...groupItems(items).map((g) => ({ key: g.key, label: g.label, n: g.items.length }))].map((c) => (
              <button
                key={c.key}
                type="button"
                className={type === c.key ? 'cc-chip on' : 'cc-chip'}
                aria-pressed={type === c.key}
                onClick={() => setType(c.key)}
              >
                {c.label}
                <span className="cc-n">{c.n}</span>
              </button>
            ))}
          </div>
          <div className="cc-filters">
            <label>
              Глава:
              <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
                <option value={ALL}>все</option>
                {chapters.map((c) => (
                  <option key={c} value={c}>
                    {chapterTitle(c)}
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
              Каталог пока пуст. Принеси первый материал — кнопка «Поделиться» выше.
            </p>
          ) : filtered.length === 0 ? (
            <p className="cc-empty">
              По таким фильтрам ничего нет. Сбрось главу и автора на «все» — или выбери другой тип.
            </p>
          ) : (
            groupItems(filtered)
              .filter((g) => type === ALL || g.key === type)
              .map((g) => (
                <section className="cmc-group" key={g.key}>
                  <div className="cc-ghead">
                    <h3>{g.label}</h3>
                    <span className="cc-n">{g.items.length}</span>
                  </div>

                  {g.items.length === 0 ? (
                    <p className="cc-empty">{EMPTY_HINT[g.key]}</p>
                  ) : g.key === 'video' ? (
                    <div className="cc-vgrid">
                      {g.items.map((item) => {
                        const thumb = thumbUrl(item);
                        const url = externalUrl(item);
                        return (
                          <a
                            className="cc-vcard"
                            key={item.id}
                            href={url ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="cc-shot">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={`Кадр из видео «${item.title}»`}
                                  loading="lazy"
                                  width={320}
                                  height={180}
                                />
                              ) : null}
                            </span>
                            <span className="cc-vtitle">{item.title}</span>
                            <span className="cc-vmeta">
                              <span>{item.author}</span>
                              {item.chapterId ? (
                                <span className="cc-tag">{chapterTitle(item.chapterId)}</span>
                              ) : null}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  ) : g.key === 'preset' ? (
                    <div className="cc-grid">
                      {g.items.map((item) => {
                        const hash = presetHash(item);
                        const engine = (item.data as SharedPreset | null)?.engine;
                        return (
                          <article key={item.id} className="cc-card">
                            <span className="cc-badge cc-badge-preset">
                              {TYPE_LABELS.preset}
                              {engine && ENGINE_LABELS[engine] ? ` · ${ENGINE_LABELS[engine]}` : ''}
                            </span>
                            <div className="cc-titlerow">
                              <h4 className="cc-title">{item.title}</h4>
                              {/* Звезда кладёт САМ набор, а не ссылку на карточку:
                                  материал могут снять с публикации, а у студента
                                  он останется и запустится с /favorites. */}
                              {item.data ? (
                                <PresetStar
                                  id={`community:${item.id}`}
                                  preset={item.data as SharedPreset}
                                />
                              ) : null}
                            </div>
                            <p className="cc-meta">
                              автор: {item.author}
                              {item.chapterId ? <span className="cc-tag">{chapterTitle(item.chapterId)}</span> : null}
                            </p>
                            {hash ? (
                              <Link className="button button--sm button--primary" to={`/gym${hash}`}>
                                Запустить
                              </Link>
                            ) : (
                              <p className="cc-meta">Данные этой записи не читаются — сообщи наставнику.</p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="cc-rows">
                      {g.items.map((item) => {
                        const url = externalUrl(item);
                        const chapterTo = item.chapterId ? chapterHref(item.chapterId) : null;
                        return (
                          <a
                            className="cc-row"
                            key={item.id}
                            href={url ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="cc-glyph">{GLYPH[item.type] ?? GLYPH.link}</span>
                            <span className="cc-rmain">
                              <span className="cc-rtitle">{item.title}</span>
                              <span className="cc-rsub">
                                {TYPE_LABELS[item.type]} · {hostOf(url ?? '')} · {item.author}
                              </span>
                            </span>
                            {item.chapterId && chapterTo ? (
                              <span className="cc-tag">{chapterTitle(item.chapterId)}</span>
                            ) : null}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))
          )}
        </>
      ) : null}
    </section>
  );
}
