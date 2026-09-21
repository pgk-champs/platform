import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { TrackBanner } from '../components/ChapterCover';
import VesselStrip from '../components/VesselStrip';
import ContinueCard from '../components/ContinueCard';
import Certificate from '../components/Certificate';
import DailyChallenge from '../components/DailyChallenge';
import { store } from '../lib/store';
import { fullCount, nextChapter } from '../lib/chapterFill';
import map from '../data/knowledge-map.json';
import tracks from '../data/tracks.json';

// Строка карты знаний. Раньше тип жил в RouteList — компонент удалён вместе со
// списками глав: их место заняли сосуды, а углубления и страницы доступны в
// левом меню и на страницах своих разделов.
type Entry = {
  id: string;
  title: string;
  audience: 'все' | 'мобилка' | 'блокчейн';
  level: 'база' | 'углубление' | 'челлендж';
  order: number;
  path: string;
  /** Есть ли в главе экзамен по блоку — на ленте он узел другой формы. */
  blockExam?: boolean;
};

type TrackDef = { dir: string; label: string; position: number };

const TRACKS = ['мобилка', 'блокчейн'] as const;
type TrackId = (typeof TRACKS)[number];

export default function Route(): React.ReactElement {
  // Выбор трека запоминается: раньше это был обычный useState, и студент
  // блокчейна при КАЖДОМ заходе видел чужую мобилку и переключал заново.
  // Значение из хранилища — данные пользователя, поэтому проверяется списком.
  const [track, setTrackState] = useState<TrackId>('мобилка');
  useEffect(() => {
    const saved = store.prefs.getTrack();
    if (saved && (TRACKS as readonly string[]).includes(saved)) setTrackState(saved as TrackId);
  }, []);
  const setTrack = (t: TrackId) => {
    setTrackState(t);
    store.prefs.setTrack(t);
  };
  // Наполнение сосудов живёт в store: без подписки полоса не обновится, пока
  // страницу не перезагрузят.
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  // Основной маршрут — без углублений: они необязательны и в путь не входят.
  const main = (map as Entry[]).filter(
    (e) => (e.audience === 'все' || e.audience === track) && e.level !== 'углубление',
  );
  const nextId = nextChapter(main.map((e) => e.id));
  const current = main.find((e) => e.id === nextId) ?? null;

  const banners = [...(tracks as TrackDef[])].sort((a, b) => a.position - b.position);

  return (
    <Layout title="Маршрут" description="Где я и что читать дальше">
      <main className="container margin-vert--lg">
        <h1>Маршрут</h1>

        {/* Переключатель стоит НАД карточкой: он решает, о каком треке она
            говорит. Ниже он менял бы её содержимое без видимой причины. */}
        <div className="rl-track-switch">
          <button
            className={`button button--${track === 'мобилка' ? 'primary' : 'secondary'}`}
            onClick={() => setTrack('мобилка')}
          >
            Мобилка
          </button>
          <button
            className={`button button--${track === 'блокчейн' ? 'primary' : 'secondary'}`}
            onClick={() => setTrack('блокчейн')}
          >
            Блокчейн
          </button>
        </div>

        <ContinueCard chapter={current} />
        <VesselStrip chapters={main} currentId={nextId} />

        <div className="track-banners">
          {banners.map((t) => (
            <Link key={t.dir} to={`/docs/${t.dir}`}>
              <TrackBanner track={t.dir} mini />
            </Link>
          ))}
        </div>

        <Certificate track={track} total={main.length} passed={fullCount(main.map((e) => e.id))} />
        <DailyChallenge />
      </main>
    </Layout>
  );
}
