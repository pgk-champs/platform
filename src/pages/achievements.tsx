import React, { useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import { store } from '../lib/store';
import { ACHIEVEMENTS } from '../lib/achievements';
import '../components/trainers.css';

export default function Achievements() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const xp = store.getXp();
  const unlocked = new Set(store.achievements.list());

  return (
    <Layout title="Достижения" description="Достижения и опыт на платформе PGK Champs">
      <main className="container margin-vert--lg">
        <h1>Достижения</h1>
        <div className="ach-xp">XP: {xp}</div>
        <div className="ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.has(a.id);
            return (
              <div key={a.id} className={`ach-card ${isUnlocked ? 'ach-card-on' : 'ach-card-off'}`.trim()}>
                <div className="ach-icon" aria-hidden="true">
                  {isUnlocked ? a.icon : '🔒'}
                </div>
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
