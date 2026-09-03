import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import knowledgeMap from '../data/knowledge-map.json';
import { levelForXp } from '../lib/levels';
import {
  addMentor,
  createGroup,
  deleteGroup,
  fetchMentorStudents,
  fetchPendingCommunity,
  fetchProfile,
  isLoggedIn,
  listGroups,
  listMentors,
  login,
  removeMentor,
  removeStudent,
  reviewCommunity,
  type MentorEntry,
  type MentorGroup,
  type MentorStudent,
  type PendingItem,
} from '../lib/account';
import '../components/trainers.css';

// Выгрузка группы в CSV — открывается в Excel/Google Sheets.
function downloadCsv(students: MentorStudent[], groupName: string): void {
  const head = ['Логин', 'Имя', 'XP', 'Главы', 'Секции', 'Квизы', 'Экзамены', 'Симулятор', 'Активность'];
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = students.map((s) =>
    [
      s.login,
      s.name || s.login,
      s.xp,
      s.chaptersStarted,
      s.sectionsRead,
      s.quizzesDone,
      s.examsDone,
      s.bestScore ?? '',
      s.updatedAt ? new Date(s.updatedAt).toISOString().slice(0, 10) : '',
    ]
      .map(esc)
      .join(';'),
  );
  // BOM — чтобы Excel открыл кириллицу в UTF-8 без «кракозябр».
  const csv = '﻿' + [head.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${groupName || 'группа'}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
  const [groups, setGroups] = useState<MentorGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<number | 0>(0); // 0 = все
  const [busy, setBusy] = useState(false);
  const [isRoot, setIsRoot] = useState(false);

  const reloadStudents = async (groupId: number) => {
    const list = await fetchMentorStudents(groupId || undefined);
    setStudents(list ?? []);
  };
  const reloadGroups = async () => setGroups(await listGroups());

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await fetchProfile();
      if (!alive) return;
      if (!p || !p.mentor) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      setAllowed(true);
      setIsRoot(!!p.root);
      await Promise.all([reloadStudents(0), reloadGroups()]);
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectGroup = async (id: number) => {
    setActiveGroup(id);
    setStudents(null);
    await reloadStudents(id);
  };

  const onCreateGroup = async () => {
    const name = window.prompt('Название группы (например, «1-А, мобилка»):');
    if (!name || !name.trim()) return;
    setBusy(true);
    const g = await createGroup(name.trim());
    setBusy(false);
    if (g) {
      await reloadGroups();
      window.alert(`Группа «${g.name}» создана.\nКод для учеников: ${g.code}\n\nПопроси их зайти в Личный кабинет → «Присоединиться к группе» и ввести этот код.`);
    }
  };

  const onDeleteGroup = async (g: MentorGroup) => {
    if (!window.confirm(`Удалить группу «${g.name}»? Прогресс учеников не пострадает, только сама группа.`)) return;
    setBusy(true);
    await deleteGroup(g.id);
    setBusy(false);
    if (activeGroup === g.id) setActiveGroup(0);
    await Promise.all([reloadGroups(), reloadStudents(activeGroup === g.id ? 0 : activeGroup)]);
  };

  const onRemoveStudent = async (s: MentorStudent) => {
    if (!activeGroup) return;
    if (!window.confirm(`Убрать ${s.name || s.login} из группы? Аккаунт и прогресс ученика останутся.`)) return;
    setBusy(true);
    await removeStudent(activeGroup, s.gh_id);
    setBusy(false);
    await reloadStudents(activeGroup);
  };

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

  const activeName = activeGroup ? groups.find((g) => g.id === activeGroup)?.name ?? 'группа' : 'Все ученики';
  const list = students ?? [];
  const totSections = list.reduce((a, s) => a + s.sectionsRead, 0);
  const active = list.filter((s) => Date.now() - s.updatedAt < 7 * 86400000).length;

  return (
    <div className="mn-wrap">
      {/* Группы: выбор, создание, код, удаление */}
      <div className="mn-groups">
        <button
          type="button"
          className={`lb-tab ${activeGroup === 0 ? 'lb-tab-active' : ''}`.trim()}
          onClick={() => selectGroup(0)}
        >
          Все ученики
        </button>
        {groups.map((g) => (
          <span key={g.id} className={`mn-group-chip ${activeGroup === g.id ? 'mn-group-active' : ''}`.trim()}>
            <button type="button" className="mn-group-name" onClick={() => selectGroup(g.id)}>
              {g.name} <span className="mn-group-count">{g.members}</span>
            </button>
            <button
              type="button"
              className="mn-group-code"
              title="Код для учеников — нажми, чтобы скопировать"
              onClick={() => {
                navigator.clipboard?.writeText(g.code).catch(() => {});
              }}
            >
              {g.code} ⧉
            </button>
            <button type="button" className="mn-group-del" title="Удалить группу" onClick={() => onDeleteGroup(g)}>
              ✕
            </button>
          </span>
        ))}
        <button type="button" className="mn-group-new" onClick={onCreateGroup} disabled={busy}>
          + Создать группу
        </button>
      </div>

      {list.length === 0 ? (
        <div className="ac-card">
          <p>
            {activeGroup
              ? 'В этой группе пока никого. Дай ученикам код группы — он на плашке выше.'
              : 'Пока никто из учеников не вошёл в аккаунт. Как войдут и начнут заниматься — здесь появится их прогресс.'}
          </p>
        </div>
      ) : (
        <RosterView
          list={list}
          activeGroup={activeGroup}
          activeName={activeName}
          totSections={totSections}
          active={active}
          onRemoveStudent={onRemoveStudent}
        />
      )}

      <ModerationQueue />
      <MentorsPanel canRemove={isRoot} />
    </div>
  );
}

// Очередь модерации присланных материалов.
function ModerationQueue() {
  const [items, setItems] = useState<PendingItem[] | null>(null);
  const reload = () => fetchPendingCommunity('pending').then(setItems);
  useEffect(() => {
    reload();
  }, []);
  const act = async (id: number, action: 'approve' | 'reject') => {
    await reviewCommunity(id, action);
    reload();
  };
  if (!items) return null;
  return (
    <section className="mn-section">
      <h2 className="mn-h">Материалы на проверку {items.length > 0 && <span className="mn-badge">{items.length}</span>}</h2>
      {items.length === 0 ? (
        <p className="ac-muted">Новых материалов нет. Присланное учениками появляется здесь.</p>
      ) : (
        <div className="mn-queue">
          {items.map((it) => {
            const url = typeof it.data === 'string' ? it.data : null;
            return (
              <div key={it.id} className="ac-card mn-qcard">
                <div className="mn-qmain">
                  <span className="mn-qtype">{it.type}</span>
                  <strong className="mn-qtitle">{it.title}</strong>
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="mn-qurl">
                      {url}
                    </a>
                  )}
                  <span className="ac-muted mn-qmeta">
                    от @{it.author}
                    {it.chapterId ? ` · глава: ${it.chapterId}` : ''}
                  </span>
                </div>
                <div className="mn-qactions">
                  <button type="button" className="button button--primary button--sm" onClick={() => act(it.id, 'approve')}>
                    Одобрить
                  </button>
                  <button type="button" className="mn-reject" onClick={() => act(it.id, 'reject')}>
                    Отклонить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Со-наставники: добавить/снять преподавателей.
function MentorsPanel({ canRemove }: { canRemove: boolean }) {
  const [mentors, setMentors] = useState<MentorEntry[] | null>(null);
  const [login, setLoginValue] = useState('');
  const reload = () => listMentors().then(setMentors);
  useEffect(() => {
    reload();
  }, []);
  if (!mentors) return null;
  return (
    <section className="mn-section">
      <h2 className="mn-h">Со-наставники</h2>
      <p className="ac-muted">Добавь преподавателя по GitHub-логину — он получит доступ к этому дашборду.</p>
      <div className="mn-mentors">
        {mentors.map((m) => (
          <span key={m.login} className="mn-mentor-chip">
            @{m.login}
            {m.root ? (
              <span className="mn-mentor-root" title="Главный наставник (в настройках сервера)">
                ★
              </span>
            ) : canRemove ? (
              <button
                type="button"
                className="mn-mentor-del"
                title="Снять со-наставника"
                onClick={async () => {
                  if (window.confirm(`Снять @${m.login} с наставников?`)) {
                    await removeMentor(m.login);
                    reload();
                  }
                }}
              >
                ✕
              </button>
            ) : null}
          </span>
        ))}
      </div>
      <form
        className="mn-mentor-add"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!login.trim()) return;
          await addMentor(login.trim());
          setLoginValue('');
          reload();
        }}
      >
        <input
          value={login}
          onChange={(e) => setLoginValue(e.target.value)}
          placeholder="github-логин"
          aria-label="GitHub-логин со-наставника"
          className="ac-join-input mn-mentor-input"
        />
        <button type="submit" className="button button--secondary" disabled={!login.trim()}>
          Добавить
        </button>
      </form>
    </section>
  );
}

function RosterView({
  list,
  activeGroup,
  activeName,
  totSections,
  active,
  onRemoveStudent,
}: {
  list: MentorStudent[];
  activeGroup: number;
  activeName: string;
  totSections: number;
  active: number;
  onRemoveStudent: (s: MentorStudent) => void;
}) {
  return (
    <div>
      <div className="mn-summary">
        <div className="ac-card ac-stat">
          <span className="ac-stat-num">{list.length}</span>
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

      <div className="mn-h-row">
        <h2 className="mn-h">Сводка · {activeName}</h2>
        <button type="button" className="button button--secondary button--sm" onClick={() => downloadCsv(list, activeName)}>
          ↓ Скачать CSV
        </button>
      </div>
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
              {activeGroup > 0 && <th scope="col" aria-label="Действия"></th>}
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
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
                  {activeGroup > 0 && (
                    <td>
                      <button
                        type="button"
                        className="mn-kick"
                        title="Убрать из группы"
                        onClick={() => onRemoveStudent(s)}
                      >
                        ✕
                      </button>
                    </td>
                  )}
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
            {list.map((s) => (
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
