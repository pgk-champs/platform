import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { looksWithState } from '../lib/looks';
import { store } from '../lib/store';
import { levelForXp } from '../lib/levels';
import Link from '@docusaurus/Link';
import './edit.css';
import '../components/vessels.css';
import {
  apiAvailable,
  fetchMyPlaces,
  fetchProfile,
  isLoggedIn,
  isSyncing,
  joinGroup,
  login,
  logout,
  subscribe,
  sync,
  type MyPlaces,
  fetchContentMeta,
} from '../lib/account';

function JoinGroup({ groups }: { groups?: { id: number; name: string }[] }) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'joined' | 'error'; name?: string }>({ kind: 'idle' });
  const mine = groups ?? [];
  return (
    <div className="ac-card ac-join">
      <strong>{mine.length ? 'Твоя группа' : 'Присоединиться к группе'}</strong>
      {mine.length > 0 ? (
        <p className="ac-join-ok">
          Ты в {mine.length === 1 ? 'группе' : 'группах'}: {mine.map((g) => `«${g.name}»`).join(', ')}.
          Наставник видит твой прогресс.
        </p>
      ) : null}
      <p className="ac-muted">
        {mine.length
          ? 'Можно вступить ещё в одну — по коду от другого наставника.'
          : 'Наставник дал код группы? Введи его, чтобы попасть в его список.'}
      </p>
      <form
        className="ac-join-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const g = await joinGroup(code.trim().toUpperCase());
          setState(g ? { kind: 'joined', name: g.name } : { kind: 'error' });
          if (g) setCode('');
        }}
      >
        <input
          className="ac-join-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Код группы"
          maxLength={8}
          aria-label="Код группы"
        />
        <button type="submit" className="button button--secondary" disabled={!code.trim()}>
          Войти в группу
        </button>
      </form>
      {state.kind === 'joined' && <p className="ac-join-ok">Готово — ты в группе «{state.name}».</p>}
      {state.kind === 'error' && <p className="sim-submit-err">Код не подошёл. Проверь у наставника.</p>}
    </div>
  );
}
import '../components/trainers.css';

type Profile = {
  id: number;
  login: string;
  name: string;
  avatar: string;
  groups?: { id: number; name: string }[];
};

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
      <AuthorLink />
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

      <JoinGroup groups={profile.groups} />

      <button type="button" className="ac-logout" onClick={logout}>
        Выйти из аккаунта
      </button>
    </div>
  );
}

/** Ссылка на правку страниц — показывается только тому, у кого есть роль автора. */
function AuthorLink(): React.ReactElement | null {
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => {
    void fetchContentMeta().then((m) => setCanEdit(!!m.canEdit));
  }, []);
  if (!canEdit) return null;
  return (
    <div className="ac-card ac-author-link">
      <div>
        <strong>Вы автор учебника</strong>
        <p className="ac-muted">Можно добавлять и править страницы прямо на сайте.</p>
      </div>
      <Link to="/edit" className="button button--primary">Править страницы</Link>
    </div>
  );
}

// Оформление сосудов Маршрута. Стоит на уровне страницы, а не внутри кабинета:
// это местная настройка, она работает и без входа.
function SkinPicker() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // До монтирования store спрашивать нельзя: он читает localStorage при
  // импорте, и серверная разметка разошлась бы с первой клиентской.
  const looks = mounted ? looksWithState(store.snapshot()) : [];
  const active = mounted ? store.prefs.getSkin() : 'classic';

  if (!mounted) return null;

  return (
    <div className="ac-card">
      <h2>Облик</h2>
      <p className="ac-muted">
        Как выглядят сосуды глав, огонёк серии и акцент «твоё». Три первых — просто на вкус, остальные
        открываются делом: облик не покупается, он говорит, чем ты занимался.
      </p>
      <div className="ac-looks">
        {looks.map((l) => {
          const путь = l.at ? Math.min(100, Math.round((100 * l.at.now) / l.at.need)) : 0;
          return (
            <button
              key={l.id}
              type="button"
              className={`ac-look${l.open ? '' : ' ac-look-shut'}`}
              // data-skin на самой кнопке обязателен: без него все образцы
              // показали бы текущий облик вместо своего.
              data-skin={l.id}
              aria-pressed={active === l.id}
              disabled={!l.open}
              onClick={() => store.prefs.setSkin(l.id)}
              title={l.open ? l.tells : undefined}
            >
              <i className="ac-skin-chip" aria-hidden="true" />
              <span className="ac-look-name">{l.name}</span>
              <span className="ac-look-tells">{l.tells}</span>
              {/* Закрытое не молчит: «18 из 25» двигает, а голое условие — нет. */}
              {!l.open && l.at ? (
                <>
                  <span className="ac-look-bar" aria-hidden="true">
                    <span className="ac-look-fill" style={{ width: `${путь}%` }} />
                  </span>
                  <span className="ac-look-at">
                    {l.at.now} из {l.at.need} · {l.at.unit}
                  </span>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Layout title="Личный кабинет" description="Вход через GitHub и синхронизация прогресса">
      <main className="container margin-vert--lg ac-page">
        <h1>Личный кабинет</h1>
        <BrowserOnly fallback={<p className="ac-muted">Загрузка…</p>}>
          {() => (
            <>
              <Cabinet />
              <SkinPicker />
            </>
          )}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
