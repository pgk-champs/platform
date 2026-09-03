import React, { useState } from 'react';
import './trainers.css';

// SSR-safe facade по образцу lite-youtube-embed (web.dev/articles/embed-best-practices):
// сервер отдаёт статичную превью-картинку (oEmbed thumbnail, i.ytimg.com) и
// настоящую <button> — никакого iframe в первом рендере ни на сервере, ни на
// клиенте. Iframe (youtube-nocookie.com — Privacy-Enhanced Mode) монтируется
// только после клика, состояние по умолчанию одинаково на сервере и клиенте,
// так что гидратация не расходится.

// 11-символьный videoId из watch?v=/youtu.be//embed//shorts/; плейлисты
// (youtube.com/playlist?list=…) сюда не попадают — для них id нет, и вызывающий
// код должен отрисовать обычную ссылку-карточку вместо facade.
export function extractYoutubeVideoId(url: string): string | null {
  const m =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(url);
  return m ? m[1] : null;
}

export default function YoutubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="chsrc-yt-frame"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="chsrc-yt-facade"
      aria-label={`Смотреть видео: ${title}`}
      onClick={() => setPlaying(true)}
    >
      <img
        className="chsrc-yt-thumb"
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
      />
      <span className="chsrc-yt-play" aria-hidden="true">
        <span className="chsrc-yt-disc">▶</span>
      </span>
    </button>
  );
}
