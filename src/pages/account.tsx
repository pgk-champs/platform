import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { store } from '../lib/store';
import { levelForXp } from '../lib/levels';
import Link from '@docusaurus/Link';
import {
  apiAvailable,
  fetchMyPlaces,
  fetchProfile,
  isLoggedIn,
  isSyncing,
  login,
  logout,
  subscribe,
  sync,
  type MyPlaces,
} from '../lib/account';
import '../components/trainers.css';

type Profile = { id: number; login: string; name: string; avatar: string };

function Cabinet() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [places, setPlaces] = useState<MyPlaces | null>(null);
  const [, force] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const up = await apiAvailable();
      if (!alive) return;
      setOnline(up);
      const p = up ? await fetchProfile() : null;
      if (alive) {
        setProfile(p);
        setLoading(false);
      }
      if (p) {
        const pl = await fetchMyPlaces();
        if (alive) setPlaces(pl);
      }
    })();
    const off = subscribe(() => force((n) => n + 1));
    return () => {
      alive = false;
      off();
    };
  }, []);

  const xp = store.getXp();
  const lvl = levelForXp(xp);

  if (loading) {
    return <p className="ac-muted">Загрузка…</p>;
  }

  if (!online) {
    return (
      <div className="ac-card ac-login">
        <h2>Личный кабинет скоро откроется</h2>
        <p>
          Вход через GitHub и синхронизация прогресса между устройствами появятся здесь
          после запуска. Пока весь прогресс сохраняется в этом браузере и никуда не
          денется.
        </p>
      </div>
    );
  }

  if (!isLoggedIn() || !profile) {
    return (
      <div className="ac-card ac-login">
        <h2>Вход через GitHub</h2>
        <p>
          Войди, чтобы прогресс, достижения и место в рейтинге сохранялись за твоим
          аккаунтом и открывались на любом устройстве — в колледже, дома и с телефона.
        </p>
        <p className="ac-muted">
          Учебник работает и без входа: всё, что ты уже прошёл в этом браузере, при
          первом входе перенесётся в аккаунт и не потеряется.
        </p>
        <button type="button" className="button button--primary ac-gh" onClick={login}>
          <span className="ac-gh-mark" aria-hidden="true">
            {''}
          </span>
          Войти через GitHub
        </button>
        <p className="ac-fine">
          Запрашивается только имя профиля. Доступа к твоим репозиториям кабинет не
          получает.
        </p>
      </div>
    );
  }

  return (
    <div className="ac-wrap">
      <div className="ac-card ac-profile">
        {profile.avatar ? (
          <img className="ac-avatar" src={profile.avatar} alt="" width={72} height={72} />
        ) : (
          <div className="ac-avatar ac-avatar-empty" aria-hidden="true">
            {profile.login.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="ac-name">{profile.name || profile.login}</h2>
          <p className="ac-login-line">@{profile.login}</p>
        </div>
      </div>

      <div className="ac-grid">
        <div className="ac-card ac-stat">
          <span className="ac-stat-num">{lvl.level}</span>
          <span className="ac-stat-label">Уровень · {lvl.title}</span>
        </div>
        <div className="ac-card ac-stat">
          <span className="ac-stat-num">{xp}</span>
          <span className="ac-stat-label">Очков опыта</span>
        </div>
      </div>

      {places && (places.overall || places.modules.length > 0) && (
        <div className="ac-card ac-places">
          <div className="ac-places-head">
            <strong>Место в рейтинге</strong>
            <Link to="/leaderboard" className="ac-places-link">
              Вся таблица →
            </Link>
          </div>
          {places.overall && (
            <div className="ac-place-row ac-place-overall">
              <span>Общий зачёт</span>
              <span className="ac-place-badge">
                {places.overall.place} из {places.overall.players}
              </span>
            </div>
          )}
          {places.modules.map((m) => (
            <div key={m.module} className="ac-place-row">
              <span className="ac-place-mod">{m.title}</span>
              <span className="ac-place-secondary">
                {m.score} из {m.max_score}
              </span>
              <span className="ac-place-badge">
                {m.place} из {m.players}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="ac-card ac-sync">
        <div>
          <strong>Синхронизация</strong>
          <p className="ac-muted">
            {isSyncing()
              ? 'Синхронизируем…'
              : lastSync
                ? `Обновлено в ${lastSync}`
                : 'Прогресс сохраняется в аккаунт автоматически.'}
          </p>
        </div>
        <button
          type="button"
          className="button button--secondary"
          disabled={isSyncing()}
          onClick={async () => {
            const ok = await sync();
            if (ok) setLastSync(new Date().toLocaleTimeString('ru-RU').slice(0, 5));
          }}
        >
          Синхронизировать сейчас
        </button>
      </div>

      <button type="button" className="ac-logout" onClick={logout}>
        Выйти из аккаунта
      </button>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Layout title="Личный кабинет" description="Вход через GitHub и синхронизация прогресса">
      <main className="container margin-vert--lg ac-page">
        <h1>Личный кабинет</h1>
        <BrowserOnly fallback={<p className="ac-muted">Загрузка…</p>}>{() => <Cabinet />}</BrowserOnly>
      </main>
    </Layout>
  );
}
