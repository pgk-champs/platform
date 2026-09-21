import React, { useEffect, useState } from 'react';
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  apiKeyLog,
  type ApiKeysView,
  type ApiLogRow,
} from '../lib/account';
import './trainers.css';

// Ключи для внешних сервисов. Выдаёт человек себе и только себе; права выше
// собственной роли сервер не отдаст, и проверяет это не только здесь.
//
// Ключ показывается ОДИН раз: в базе лежит хеш, восстановить нечем. Поэтому
// после создания он висит в отдельной плашке, пока её не закроют.

const дата = (ts: number | null) => (ts ? new Date(ts).toLocaleDateString('ru-RU') : '—');

export default function ApiKeys() {
  const [view, setView] = useState<ApiKeysView | null>(null);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [days, setDays] = useState(90);
  const [fresh, setFresh] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ id: number; rows: ApiLogRow[] } | null>(null);
  // Отличаем «ещё грузим» от «сервер отказал»: без этого у невошедшего
  // окно висело бы в «Загрузка…» навсегда.
  const [state, setState] = useState<'загрузка' | 'готово' | 'нет доступа'>('загрузка');

  const refresh = () =>
    listApiKeys().then((v) => {
      setView(v);
      setState(v ? 'готово' : 'нет доступа');
    });
  useEffect(() => {
    refresh();
  }, []);

  if (state === 'загрузка') return <p className="ac-muted">Загрузка…</p>;
  if (!view)
    return (
      <section className="mn-section">
        <h2 className="mn-h">Ключи для сервисов</h2>
        <p className="ac-muted">
          Ключи выдаются вошедшему: войди через GitHub на этой странице.{' '}
          <a href="/api">Что умеет API</a>.
        </p>
      </section>
    );

  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const create = async () => {
    setБезОшибки();
    setBusy(true);
    const r = await createApiKey(name.trim(), picked, days);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error ?? 'не вышло');
      return;
    }
    setFresh(r.ключ ?? '');
    setName('');
    setPicked([]);
    refresh();
  };
  function setБезОшибки() {
    setErr('');
  }

  return (
    <section className="mn-section">
      <h2 className="mn-h">Ключи для сервисов</h2>
      <p className="ac-muted">
        Чтобы внешний сервис или нейросеть работали с платформой по HTTP, не трогая её код.{' '}
        <a href="/api">Что умеет API</a> · <a href="/api.md">сырой файл для модели</a>.
      </p>

      {fresh ? (
        <div className="ac-card ak-fresh">
          <p>
            <b>Ключ создан. Он показывается один раз</b> — скопируй сейчас, в базе лежит только его хеш.
          </p>
          <code className="ak-secret">{fresh}</code>
          <div className="gb-actions">
            <button
              type="button"
              className="button button--sm button--primary"
              onClick={() => navigator.clipboard?.writeText(fresh)}
            >
              Скопировать
            </button>
            <button type="button" className="button button--sm button--secondary" onClick={() => setFresh('')}>
              Я сохранил
            </button>
          </div>
        </div>
      ) : null}

      <div className="ac-card ak-form">
        <label className="gb-field">
          <span>Название — по нему ключ узнают в журнале</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="например: бот-редактор" />
        </label>
        <fieldset className="ak-scopes">
          <legend>Что разрешить</legend>
          {view.все.map((s) => {
            const можно = view.доступныеПрава.some((d) => d.право === s.право);
            return (
              <label key={s.право} className={`ak-scope${можно ? '' : ' ak-scope-off'}`}>
                <input
                  type="checkbox"
                  checked={picked.includes(s.право)}
                  disabled={!можно}
                  onChange={() => toggle(s.право)}
                />
                <code>{s.право}</code> <span className="ac-muted">— {s.что}</span>
                {!можно ? <em className="ac-muted"> (нужна роль: {s.нужнаРоль === 'author' ? 'автор' : 'наставник'})</em> : null}
              </label>
            );
          })}
        </fieldset>
        <label className="gb-field">
          <span>Срок, дней</span>
          <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        </label>
        {err ? <p className="gb-error">{err}</p> : null}
        <button
          type="button"
          className="button button--sm button--primary"
          onClick={create}
          disabled={busy || !name.trim() || picked.length === 0}
        >
          {busy ? 'Создаю…' : 'Создать ключ'}
        </button>
      </div>

      {view.ключи.length === 0 ? (
        <p className="ac-muted">Ключей пока нет.</p>
      ) : (
        <table className="rl-matrix ak-table">
          <thead>
            <tr>
              <th>Ключ</th>
              <th>Права</th>
              <th>Создан</th>
              <th>Работал</th>
              <th>До</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {view.ключи.map((k) => (
              <tr key={k.id} className={k.отозван ? 'ak-dead' : ''}>
                <td>
                  {k.имя} <code className="ac-muted">{k.подсказка}</code>
                </td>
                <td>
                  {k.права.map((p) => (
                    <code key={p} className={k.действуют.includes(p) ? 'ak-on' : 'ak-off'}>
                      {p}
                    </code>
                  ))}
                </td>
                <td>{дата(k.создан)}</td>
                <td>{дата(k.последнийРаз)}</td>
                <td>{k.отозван ? 'отозван' : дата(k.истекает)}</td>
                <td>
                  <button
                    type="button"
                    className="sc-linkbtn"
                    onClick={() => apiKeyLog(k.id).then((rows) => setLog({ id: k.id, rows }))}
                  >
                    журнал
                  </button>
                  {!k.отозван ? (
                    <button
                      type="button"
                      className="mn-reject"
                      onClick={() => revokeApiKey(k.id).then(refresh)}
                    >
                      отозвать
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {log ? (
        <div className="ac-card">
          <h3>Что делал ключ #{log.id}</h3>
          {log.rows.length === 0 ? (
            <p className="ac-muted">Пока ничего.</p>
          ) : (
            <ol className="ak-log">
              {log.rows.map((r, i) => (
                <li key={i}>
                  <code>
                    {r.method} {r.path}
                  </code>{' '}
                  → {r.status} · {new Date(r.ts).toLocaleString('ru-RU')}
                  {r.note ? ` · ${r.note}` : ''}
                </li>
              ))}
            </ol>
          )}
          <button type="button" className="button button--sm button--secondary" onClick={() => setLog(null)}>
            Закрыть
          </button>
        </div>
      ) : null}
    </section>
  );
}
