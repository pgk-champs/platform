import React, { useEffect, useState } from 'react';
import { fetchCommunityBoard, type ContributorRow } from '../lib/account';
import './trainers.css';

// Рейтинг вклада в каталог: кто сколько прислал и сколько из этого приняли.
// Сортировка по принятому — отправить можно что угодно, а вклад в каталог
// это то, что прошло проверку. Публичный, как и обычный /leaderboard: чужой
// вклад видно и без входа, это и есть стимул прислать свой.

export default function CommunityBoard(): React.ReactElement {
  // null — ещё не знаем: либо загрузка не завершилась, либо сервер не ответил.
  // Различать надо: «сервер лежит» — не то же самое, что «каталог пуст», и
  // писать «стань первым» на упавшем сервере нельзя (тот же принцип, что у
  // fetchApprovedCommunity).
  const [rows, setRows] = useState<ContributorRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchCommunityBoard().then((r) => {
      if (!alive) return;
      setRows(r);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="cc-board lb-wrap">
      <h3>Кто вкладывается в каталог</h3>
      {loading ? (
        <p className="ac-muted">Загрузка…</p>
      ) : rows === null ? (
        <p className="ac-muted">Рейтинг сейчас недоступен. Загляни позже.</p>
      ) : rows.length === 0 ? (
        <p className="ac-muted">Пока никто не прислал ни одного материала — стань первым.</p>
      ) : (
        <div className="lb-table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Участник</th>
                <th scope="col">Принято</th>
                <th scope="col">Отправлено</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
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
                  <td className="lb-score">{r.approved}</td>
                  <td className="lb-secondary">{r.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
