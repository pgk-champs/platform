import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { fetchBoard, isLoggedIn, type Board } from '../lib/account';
import '../components/trainers.css';

function fmtTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

function Table() {
  const [board, setBoard] = useState<Board | null>(null);
  const [module, setModule] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchBoard(module).then((b) => {
      if (!alive) return;
      if (!b) setOffline(true);
      setBoard(b);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [module]);

  if (offline) {
    return <p className="ac-muted">Рейтинг сейчас недоступен. Загляни позже.</p>;
  }

  const tabs = [{ module: 'overall', title: 'Общий зачёт', players: 0 }, ...(board?.modules ?? [])];

  return (
    <div className="lb-wrap">
      <div className="lb-tabs" role="tablist" aria-label="Модуль рейтинга">
        {tabs.map((t) => (
          <button
            key={t.module}
            type="button"
            role="tab"
            aria-selected={module === t.module}
            className={`lb-tab ${module === t.module ? 'lb-tab-active' : ''}`.trim()}
            onClick={() => setModule(t.module)}
          >
            {t.title}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="ac-muted">Загрузка…</p>
      ) : !board || board.rows.length === 0 ? (
        <div className="ac-card">
          <p>
            Здесь пока пусто. Пройди{' '}
            <Link to="/simulator">симулятор чемпионата</Link> — твой результат откроет таблицу.
          </p>
          {!isLoggedIn() && (
            <p className="ac-muted">
              Чтобы попасть в рейтинг, <Link to="/account">войди через GitHub</Link>.
            </p>
          )}
        </div>
      ) : (
        <div className="lb-table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Участник</th>
                <th scope="col">Баллы</th>
                <th scope="col">{module === 'overall' ? 'Модулей' : 'Время'}</th>
              </tr>
            </thead>
            <tbody>
              {board.rows.map((r) => (
                <tr key={r.gh_id} className={r.me ? 'lb-me' : undefined}>
                  <td className="lb-place" data-medal={r.place <= 3 ? r.place : undefined}>
                    {r.place}
                  </td>
                  <td>
                    <span className="lb-user">
                      {r.avatar ? (
                        <img className="lb-avatar" src={r.avatar} alt="" width={28} height={28} />
                      ) : (
                        <span className="lb-avatar lb-avatar-empty" aria-hidden="true">
                          {r.login.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="lb-name">{r.name || r.login}</span>
                      {r.me && <span className="lb-you">ты</span>}
                    </span>
                  </td>
                  <td className="lb-score">
                    {r.score}
                    <span className="lb-max"> / {r.max_score}</span>
                  </td>
                  <td className="lb-secondary">
                    {module === 'overall' ? r.modules : fmtTime(r.duration_sec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Layout title="Рейтинг" description="Таблица лидеров симулятора чемпионата">
      <main className="container margin-vert--lg ac-page">
        <h1>Рейтинг</h1>
        <p className="ac-muted">
          Лучший результат каждого участника в симуляторе чемпионата. При равных баллах выше тот, кто
          справился быстрее.
        </p>
        <BrowserOnly fallback={<p className="ac-muted">Загрузка…</p>}>{() => <Table />}</BrowserOnly>
      </main>
    </Layout>
  );
}
