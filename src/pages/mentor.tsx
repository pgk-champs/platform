import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import knowledgeMap from '../data/knowledge-map.json';
import { levelForXp } from '../lib/levels';
import { ACHIEVEMENTS } from '../lib/achievements';
import {
  addGroupComentor,
  addMentor,
  createGroup,
  deleteGroup,
  fetchMentorStudents,
  fetchNotifications,
  fetchPendingCommunity,
  fetchProfile,
  fetchStudentDetail,
  isLoggedIn,
  listGroups,
  listMentors,
  login,
  markNotificationsSeen,
  removeGroupComentor,
  removeMentor,
  removeStudent,
  reviewCommunity,
  type MentorEntry,
  type MentorGroup,
  type MentorNotifications,
  type MentorStudent,
  type PendingItem,
  type StudentDetail,
} from '../lib/account';
import '../components/trainers.css';

const CH_TITLE = new Map((knowledgeMap as Chapter[]).map((c) => [c.id, c.title]));
const CH_TRACK = new Map((knowledgeMap as Chapter[]).map((c) => [c.id, c.path.split('/')[0]]));
const ACH_TITLE = new Map(ACHIEVEMENTS.map((a) => [a.id, { title: a.title, icon: a.icon }]));
const TRACK_NAME: Record<string, string> = { foundation: 'Фундамент', mobile: 'Мобилка', blockchain: 'Блокчейн', advanced: 'Отдельные темы' };

// Детальная карточка одного ученика — модальное окно поверх дашборда.
function StudentCard({ id, onClose }: { id: number; onClose: () => void }) {
  const [d, setD] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetchStudentDetail(id).then((res) => {
      if (alive) {
        setD(res);
        setLoading(false);
      }
    });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      alive = false;
      document.removeEventListener('keydown', onKey);
    };
  }, [id, onClose]);

  // Главы ученика, сгруппированные по трекам, в порядке трек→глава.
  const byTrack = new Map<string, StudentDetail['chapters']>();
  for (const c of d?.chapters ?? []) {
    const tr = CH_TRACK.get(c.chapterId) ?? 'advanced';
    if (!byTrack.has(tr)) byTrack.set(tr, []);
    byTrack.get(tr)!.push(c);
  }

  return (
    <div className="sc-modal-back" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sc-modal-close" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
        {loading ? (
          <p className="ac-muted">Загрузка…</p>
        ) : !d ? (
          <p className="ac-muted">Не удалось загрузить карточку.</p>
        ) : (
          <>
            <div className="sc-head">
              {d.student.avatar ? (
                <img className="ac-avatar" src={d.student.avatar} alt="" width={56} height={56} />
              ) : (
                <div className="ac-avatar ac-avatar-empty" aria-hidden="true">
                  {d.student.login.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="sc-name">{d.student.name || d.student.login}</h3>
                <p className="sc-sub">
                  @{d.student.login} · уровень {levelForXp(d.student.xp).level} · {d.student.xp} XP · был активен {ago(d.student.updatedAt)}
                </p>
                {d.groups.length > 0 && (
                  <p className="sc-groups">{d.groups.map((g) => g.name).join(', ')}</p>
                )}
              </div>
            </div>

            {d.results.length > 0 && (
              <div className="sc-block">
                <h4>Симулятор</h4>
                <ul className="sc-list">
                  {d.results.map((r) => (
                    <li key={r.module}>
                      {r.title}: <strong>{r.score}</strong> из {r.max_score}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="sc-block">
              <h4>Прогресс по главам</h4>
              {byTrack.size === 0 ? (
                <p className="ac-muted">Пока ничего не пройдено.</p>
              ) : (
                [...byTrack.entries()].map(([tr, chs]) => (
                  <div key={tr} className="sc-track">
                    <div className="sc-track-name">{TRACK_NAME[tr] ?? tr}</div>
                    {chs.map((c) => (
                      <div key={c.chapterId} className="sc-chapter">
                        <span className="sc-ch-title">{CH_TITLE.get(c.chapterId) ?? c.chapterId}</span>
                        <span className="sc-ch-stats">
                          {c.sections > 0 && <span title="секций прочитано">📖 {c.sections}</span>}
                          {c.trainers > 0 && <span title="тренажёров пройдено">🎮 {c.trainers}</span>}
                          {c.quizzes.map((q) => (
                            <span key={q.id} className={`sc-quiz ${q.correct === q.total ? 'sc-quiz-full' : ''}`.trim()} title="квиз">
                              {q.correct}/{q.total}
                            </span>
                          ))}
                          {c.exam && (
                            <span className="sc-exam" title="лучший экзамен">
                              экз. {c.exam.correct}/{c.exam.total}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {d.achievements.length > 0 && (
              <div className="sc-block">
                <h4>Достижения ({d.achievements.length})</h4>
                <div className="sc-achs">
                  {d.achievements.map((a) => {
                    const meta = ACH_TITLE.get(a);
                    return (
                      <span key={a} className="sc-ach" title={meta?.title ?? a}>
                        {meta?.icon ?? '🏅'} {meta?.title ?? a}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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

// Русское склонение числительного: 1 материал / 2 материала / 5 материалов.
function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
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
  const [openStudent, setOpenStudent] = useState<number | null>(null);
  const [notif, setNotif] = useState<MentorNotifications | null>(null);

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
      const n = await fetchNotifications();
      if (alive) setNotif(n);
      await Promise.all([reloadStudents(0), reloadGroups()]);
      if (alive) setLoading(false);
      // Открыл дашборд — считаем, что увидел новое.
      void markNotificationsSeen();
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

  const onAddComentor = async (g: MentorGroup) => {
    const login = window.prompt(`GitHub-логин со-наставника для группы «${g.name}»:`);
    if (!login || !login.trim()) return;
    setBusy(true);
    await addGroupComentor(g.id, login.trim());
    setBusy(false);
    await reloadGroups();
  };

  const onRemoveComentor = async (g: MentorGroup, login: string) => {
    if (!window.confirm(`Снять @${login} с со-наставников группы «${g.name}»?`)) return;
    await removeGroupComentor(g.id, login);
    await reloadGroups();
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

  const hasNotif = notif && (notif.pendingMaterials > 0 || notif.newMembers > 0);

  return (
    <div className="mn-wrap">
      {hasNotif && (
        <div className="mn-notif" role="status">
          🔔{' '}
          {notif!.pendingMaterials > 0 && (
            <span>
              {notif!.pendingMaterials} {plural(notif!.pendingMaterials, 'материал', 'материала', 'материалов')} на проверку
            </span>
          )}
          {notif!.pendingMaterials > 0 && notif!.newMembers > 0 && ' · '}
          {notif!.newMembers > 0 && (
            <span>
              {notif!.newMembers} {plural(notif!.newMembers, 'новый ученик', 'новых ученика', 'новых учеников')} с прошлого визита
            </span>
          )}
        </div>
      )}
      {/* Группы: выбор, создание, код, со-наставники, удаление */}
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
              {g.owner === false && <span className="mn-group-co" title="Вы со-наставник этой группы">со-наст.</span>}
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
            {g.owner !== false && (
              <button
                type="button"
                className="mn-group-co-add"
                title={
                  g.comentors && g.comentors.length
                    ? `Со-наставники: ${g.comentors.join(', ')} · нажми, чтобы добавить`
                    : 'Добавить со-наставника'
                }
                onClick={() => onAddComentor(g)}
              >
                +👤{g.comentors && g.comentors.length ? ` ${g.comentors.length}` : ''}
              </button>
            )}
            {g.owner !== false && (
              <button type="button" className="mn-group-del" title="Удалить группу" onClick={() => onDeleteGroup(g)}>
                ✕
              </button>
            )}
          </span>
        ))}
        <button type="button" className="mn-group-new" onClick={onCreateGroup} disabled={busy}>
          + Создать группу
        </button>
      </div>

      {(() => {
        const ag = groups.find((g) => g.id === activeGroup);
        if (!ag || ag.owner === false || !ag.comentors || ag.comentors.length === 0) return null;
        return (
          <p className="mn-co-line">
            Со-наставники группы:{' '}
            {ag.comentors.map((login) => (
              <span key={login} className="mn-co-chip">
                @{login}
                <button type="button" className="mn-co-del" title="Снять" onClick={() => onRemoveComentor(ag, login)}>
                  ✕
                </button>
              </span>
            ))}
          </p>
        );
      })()}

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
          onOpenStudent={setOpenStudent}
        />
      )}

      <ModerationQueue />
      <MentorsPanel canRemove={isRoot} />
      {openStudent !== null && <StudentCard id={openStudent} onClose={() => setOpenStudent(null)} />}
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
  onOpenStudent,
}: {
  list: MentorStudent[];
  activeGroup: number;
  activeName: string;
  totSections: number;
  active: number;
  onRemoveStudent: (s: MentorStudent) => void;
  onOpenStudent: (ghId: number) => void;
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
                    <button type="button" className="lb-user mn-open" onClick={() => onOpenStudent(s.gh_id)} title="Открыть карточку ученика">
                      {s.avatar ? (
                        <img className="lb-avatar" src={s.avatar} alt="" width={28} height={28} />
                      ) : (
                        <span className="lb-avatar lb-avatar-empty" aria-hidden="true">
                          {s.login.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="lb-name mn-open-name">{s.name || s.login}</span>
                    </button>
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
