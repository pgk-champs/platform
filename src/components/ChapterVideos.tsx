import React from 'react';
import chapterVideos from '../data/chapter-videos.json';
import YoutubeFacade from './YoutubeFacade';
import './trainers.css';

// Подборка видео по теме главы — куратор (не студенты, в отличие от
// ChapterSources): статичный локальный JSON вместо fetch на чужой репозиторий,
// работает и при недоступном community.json. videoId уже вырезаны из ссылок
// и проверены через YouTube oEmbed на существование при добавлении записи.
export type ChapterVideoEntry = { videoId: string; title: string; channel: string };

const DATA = chapterVideos as Record<string, ChapterVideoEntry[]>;

export default function ChapterVideos({ chapterId }: { chapterId: string }) {
  const items = DATA[chapterId];
  if (!items || items.length === 0) return null;
  return (
    <section className="chsrc">
      <h2 className="chsrc-title">Видео по теме</h2>
      <div className="chsrc-grid">
        {items.map((item) => (
          <div key={item.videoId} className="chsrc-card chsrc-card-video">
            <span className="chsrc-badge chsrc-badge-video">
              <span aria-hidden="true">▶ </span>
              Видео
            </span>
            <YoutubeFacade videoId={item.videoId} title={item.title} />
            <span className="chsrc-name">{item.title}</span>
            <span className="chsrc-meta">{item.channel}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
