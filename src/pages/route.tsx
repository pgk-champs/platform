import React, { useState, useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { TrackBanner } from '../components/ChapterCover';
import RouteList, { type Entry } from '../components/RouteList';
import VesselStrip from '../components/VesselStrip';
import ContinueCard from '../components/ContinueCard';
import Certificate from '../components/Certificate';
import DailyChallenge from '../components/DailyChallenge';
import { store } from '../lib/store';
import { fullCount, nextChapter } from '../lib/chapterFill';
import map from '../data/knowledge-map.json';
import pages from '../data/pages.json';
import tracks from '../data/tracks.json';

type TrackDef = { dir: string; label: string; position: number };

export default function Route(): React.ReactElement {
  const [track, setTrack] = useState<'мобилка' | 'блокчейн'>('мобилка');
  // Наполнение сосудов живёт в store: без подписки полоса не обновится, пока
  // страницу не перезагрузят.
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const all = map as Entry[];
  // Основной маршрут — без углублений: они необязательны и идут своей секцией ниже.
  const main = all.filter(
    (e) => (e.audience === 'все' || e.audience === track) && e.level !== 'углубление',
  );
  const nextId = nextChapter(main.map((e) => e.id));
  const current = main.find((e) => e.id === nextId) ?? null;

  const banners = [...(tracks as TrackDef[])].sort((a, b) => a.position - b.position);

  return (
    <Layout title="Маршрут" description="Где я и что читать дальше">
      <main className="container margin-vert--lg">
        <h1>Маршрут</h1>

        <div className="track-banners">
          {banners.map((t) => (
            <Link key={t.dir} to={`/docs/${t.dir}`}>
              <TrackBanner track={t.dir} mini />
            </Link>
          ))}
        </div>

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
        <Certificate track={track} total={main.length} passed={fullCount(main.map((e) => e.id))} />

        <DailyChallenge />
        <RouteList map={all} pages={pages as Entry[]} track={track} />
      </main>
    </Layout>
  );
}
