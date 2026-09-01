import React, { useState } from 'react';
import Layout from '@theme/Layout';
import RouteList, { type Entry } from '../components/RouteList';
import DailyChallenge from '../components/DailyChallenge';
import TrainingSchedule from '../components/TrainingSchedule';
import map from '../data/knowledge-map.json';

export default function Route() {
  const [track, setTrack] = useState<'мобилка' | 'блокчейн'>('мобилка');

  return (
    <Layout title="Маршрут" description="Маршрут обучения по треку с прогрессом и матрицей охвата">
      <main className="container margin-vert--lg">
        <h1>Маршрут</h1>
        <DailyChallenge />
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
        <RouteList map={map as Entry[]} track={track} />
        <TrainingSchedule />
      </main>
    </Layout>
  );
}
