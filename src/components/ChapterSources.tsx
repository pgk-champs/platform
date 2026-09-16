import React, { useEffect, useState } from 'react';
import {
  parseItems,
  TYPE_LABELS,
  type CommunityItem,
} from './CommunityCatalog';
import YoutubeFacade, { extractYoutubeVideoId } from './YoutubeFacade';
import './trainers.css';
import { fetchApprovedCommunity } from '../lib/account';

// Блок «Принесли студенты» в конце каждой главы и каждой страницы: материалы,
// одобренные модератором, с сервера — фильтр
// по chapterId и типам video/source/link. Пусто или сеть недоступна — блок не
// рендерится вовсе, глава остаётся как была. Вставляется общим футером глав
// (src/theme/DocItem/Footer), chapterId берётся из id документа.
//
// Видео (цикл 5): карточка с video/id-совпадением рендерит SSR-safe
// YoutubeFacade вместо прямой ссылки — превью и клик остаются на странице,
// iframe не в SSR. Плейлисты (youtube.com/playlist?list=…) id не дают —
// падают в обычную ссылку-карточку, как источники и ссылки.

const SOURCE_TYPES: CommunityItem['type'][] = ['video', 'source', 'link'];
const TYPE_ICONS: Partial<Record<CommunityItem['type'], string>> = {
  video: '▶',
  source: '📖',
  link: '🔗',
};

// Экспорт ради тестов и переиспользования: тот же защитный parseItems, что и
// на /community, плюс фильтр «только источники этой главы с https-ссылкой».
export function pickSources(raw: unknown, chapterId: string): CommunityItem[] {
  return parseItems(raw).filter(
    (i) =>
      i.chapterId === chapterId &&
      SOURCE_TYPES.includes(i.type) &&
      typeof i.data === 'string' &&
      i.data.startsWith('https://'),
  );
}

export default function ChapterSources({ chapterId }: { chapterId: string }) {
  const [items, setItems] = useState<CommunityItem[]>([]);

  // Fetch только на клиенте: useEffect не выполняется при SSR-сборке.
  useEffect(() => {
    let alive = true;
    // Материалы берутся с сервера, а не из статического файла в отдельном
    // репозитории. Раньше одобренный материал попадал в каталог, но у главы не
    // появлялся никогда — это и был молчаливый разрыв.
    fetchApprovedCommunity()
      .then((raw) => alive && raw !== null && setItems(pickSources(raw, chapterId)))
      .catch(() => {
        /* нет сети — блока просто нет */
      });
    return () => {
      alive = false;
    };
  }, [chapterId]);

  if (items.length === 0) return null;
  // Якорь #community-sources для «видео и материалы сообщества — ниже» из
  // «Куда дальше» — постоянный <span id> в Footer/index.tsx перед этим
  // компонентом (эта секция клиентская и пуста при SSR, id тут не годится).
  return (
    <section className="chsrc">
      <h2 className="chsrc-title">Принесли студенты</h2>
      <div className="chsrc-grid">
        {items.map((item) => {
          const videoId = item.type === 'video' ? extractYoutubeVideoId(item.data as string) : null;
          const badge = (
            <span className={`chsrc-badge${item.type === 'video' ? ' chsrc-badge-video' : ''}`}>
              <span aria-hidden="true">{TYPE_ICONS[item.type]} </span>
              {TYPE_LABELS[item.type]}
            </span>
          );
          if (videoId) {
            return (
              <div key={item.id} className="chsrc-card chsrc-card-video">
                {badge}
                <YoutubeFacade videoId={videoId} title={item.title} />
                <span className="chsrc-name">{item.title}</span>
                <span className="chsrc-meta">добавил: {item.author}</span>
              </div>
            );
          }
          return (
            <a
              key={item.id}
              className={`chsrc-card${item.type === 'video' ? ' chsrc-card-video' : ''}`}
              href={item.data as string}
              target="_blank"
              rel="noreferrer"
            >
              {badge}
              <span className="chsrc-name">{item.title}</span>
              <span className="chsrc-meta">добавил: {item.author}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
