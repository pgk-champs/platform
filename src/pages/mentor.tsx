import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import knowledgeMap from '../data/knowledge-map.json';
import { levelForXp } from '../lib/levels';
import { fetchMentorStudents, fetchProfile, isLoggedIn, login, type MentorStudent } from '../lib/account';
import '../components/trainers.css';

type Chapter = { id: string; title: string; path: string };
const CHAPTERS = (knowledgeMap as Chapter[]).map((c) => ({
  id: c.id,
  title: c.title,
  track: c.path.split('/')[0],
}));

// Короткая метка колонки: номер из пути или первые буквы id.
function shortLabel(id: string): string {
  return id
    .split('-')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function ago(ts: number): string {
  if (!ts) return '—';
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d <= 0) return 'сегодня';
  if (d === 1) return 'вчера';
  if (d < 7) return `${d} дн назад`;
  return `${Math.floor(d / 7)} нед назад`;
}

function Dashboard() {
  const [students, setStudents] = useState<MentorStudent[] | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await fetchProfile();
      if (!alive) return;
      if (!p) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      if (!p.mentor) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      setAllowed(true);
      const list = await fetchMentorStudents();
      if (alive) {
        setStudents(list ?? []);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="ac-muted">Загрузка…</p>;

  if (!allowed) {
    return (
      <div className="ac-card">
        <h2>Только для наставника</h2>
        <p>Эта страница показывает прогресс группы и доступна преподавателю.</p>
        {!isLoggedIn() && (
          <button type="button" className="button button--primary" onClick={login}>
            Войти через GitHub
          </button>
        )}
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="ac-card">
        <p>Пока никто из учеников не вошёл в аккаунт. Как войдут и начнут заниматься — здесь появится их прогресс.</p>
      </div>
    );
  }

  const totSections = students.reduce((a, s) => a + s.sectionsRead, 0);
  const active = students.filter((s) => Date.now() - s.updatedAt < 7 * 86400000).length;

  return (
    <div className="mn-wrap">
      <div className="mn-summary">
        <div className="ac-card ac-stat">
          <span className="ac-stat-num">{students.length}</span>
          <span className="ac-stat-label">учеников</span>
        </div>
        <div className="ac-card ac-stat">
          <span className="ac-stat-num">{active}</span>
          <span className="ac-stat-label">активны за неделю</span>
        </div>
        <div className="ac-card ac-stat">
          <span className="ac-stat-num">{totSections}</span>
          <span className="ac-stat-label">секций прочитано всего</span>
        </div>
      </div>

      <h2 className="mn-h">Сводка</h2>
      <div className="lb-table-wrap">
        <table className="lb-table mn-table">
          <thead>
            <tr>
              <th scope="col">Ученик</th>
              <th scope="col">Уровень</th>
              <th scope="col">Главы</th>
              <th scope="col">Секции</th>
              <th scope="col">Квизы</th>
              <th scope="col">Экз.</th>
              <th scope="col">Симул.</th>
              <th scope="col">Активность</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const lvl = levelForXp(s.xp);
              const stale = Date.now() - s.updatedAt > 14 * 86400000;
              return (
                <tr key={s.gh_id} className={stale ? 'mn-stale' : undefined}>
                  <td>
                    <span className="lb-user">
                      {s.avatar ? (
                        <img className="lb-avatar" src={s.avatar} alt="" width={28} height={28} />
                      ) : (
                        <span className="lb-avatar lb-avatar-empty" aria-hidden="true">
                          {s.login.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="lb-name">{s.name || s.login}</span>
                    </span>
                  </td>
                  <td className="lb-secondary">
                    {lvl.level} · {s.xp} XP
                  </td>
                  <td className="lb-secondary">{s.chaptersStarted}</td>
                  <td className="lb-secondary">{s.sectionsRead}</td>
                  <td className="lb-secondary">{s.quizzesDone}</td>
                  <td className="lb-secondary">{s.examsDone}</td>
                  <td className="lb-secondary">{s.bestScore ?? '—'}</td>
                  <td className="lb-secondary">{ago(s.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mn-h">Кто где: карта глав</h2>
      <p className="ac-muted mn-legend">
        Заполненная клетка — в главе есть прочитанные секции. Так видно, кто застрял и на чём.
      </p>
      <div className="lb-table-wrap">
        <table className="mn-heat">
          <thead>
            <tr>
              <th scope="col" className="mn-heat-name">
                Ученик
              </th>
              {CHAPTERS.map((c) => (
                <th key={c.id} scope="col" title={c.title} className={`mn-heat-col mn-track-${c.track}`}>
                  {shortLabel(c.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.gh_id}>
                <td className="mn-heat-name">{s.name || s.login}</td>
                {CHAPTERS.map((c) => {
                  const n = s.coverage[c.id] || 0;
                  return (
                    <td
                      key={c.id}
                      className={`mn-cell ${n > 0 ? 'mn-cell-on' : ''}`.trim()}
                      title={`${c.title}: ${n} секц.`}
                    >
                      {n > 0 ? n : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MentorPage() {
  return (
    <Layout title="Дашборд наставника" description="Прогресс группы учеников">
      <main className="container margin-vert--lg ac-page mn-page">
        <h1>Дашборд наставника</h1>
        <p className="ac-muted">
          Прогресс твоей группы: кто сколько прошёл и кто застрял. Данные — из аккаунтов учеников.{' '}
          <Link to="/leaderboard">Рейтинг →</Link>
        </p>
        <BrowserOnly fallback={<p className="ac-muted">Загрузка…</p>}>{() => <Dashboard />}</BrowserOnly>
      </main>
    </Layout>
  );
}
