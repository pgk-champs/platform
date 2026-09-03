import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import knowledgeMap from '../data/knowledge-map.json';
import { isLoggedIn, login, submitCommunity } from '../lib/account';

type Chapter = { id: string; title: string };
const CHAPTERS = knowledgeMap as Chapter[];

// Типы, которые ученик может прислать прямо с платформы (ссылочные). Пресеты
// добавляются из конструктора /gym кнопкой «Поделиться», поэтому здесь их нет.
const TYPES: { value: string; label: string; hint: string }[] = [
  { value: 'video', label: 'Видео', hint: 'ссылка на YouTube-разбор по теме' },
  { value: 'source', label: 'Источник', hint: 'статья, документация, шпаргалка' },
  { value: 'link', label: 'Полезная ссылка', hint: 'инструмент, песочница, визуализатор' },
  { value: 'repo', label: 'Репозиторий', hint: 'твой проект по теме на GitHub' },
];

function Form() {
  const [type, setType] = useState('video');
  const [title, setTitle] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'ok' | 'err'; msg?: string }>({ kind: 'idle' });
  const [sending, setSending] = useState(false);

  if (!isLoggedIn()) {
    return (
      <div className="ac-card">
        <p>
          Хочешь поделиться материалом с группой? <button type="button" className="sc-linkbtn" onClick={login}>Войди через GitHub</button> — и добавишь ссылку прямо отсюда, наставник её проверит.
        </p>
      </div>
    );
  }

  return (
    <details className="sc-submit">
      <summary>Поделиться материалом</summary>
      <form
        className="sc-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim() || !/^https:\/\//.test(urlValue.trim())) {
            setState({ kind: 'err', msg: 'Нужно название и https-ссылка.' });
            return;
          }
          setSending(true);
          const res = await submitCommunity({
            type,
            title: title.trim(),
            chapterId: chapterId || undefined,
            data: urlValue.trim(),
          });
          setSending(false);
          if (res.ok) {
            setState({ kind: 'ok' });
            setTitle('');
            setUrlValue('');
          } else {
            setState({ kind: 'err', msg: res.error });
          }
        }}
      >
        <label className="sc-field">
          <span>Что это</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <p className="sc-hint">{TYPES.find((t) => t.value === type)?.hint}</p>
        <label className="sc-field">
          <span>Название</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Коротко и по делу" />
        </label>
        <label className="sc-field">
          <span>Ссылка (https)</span>
          <input value={urlValue} onChange={(e) => setUrlValue(e.target.value)} placeholder="https://…" inputMode="url" />
        </label>
        <label className="sc-field">
          <span>Глава (необязательно)</span>
          <select value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
            <option value="">— без привязки —</option>
            {CHAPTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="button button--primary" disabled={sending}>
          {sending ? 'Отправляем…' : 'Отправить на проверку'}
        </button>
        {state.kind === 'ok' && (
          <p className="ac-join-ok">Спасибо! Материал ушёл наставнику на проверку — появится в каталоге после одобрения.</p>
        )}
        {state.kind === 'err' && <p className="sim-submit-err">{state.msg}</p>}
      </form>
    </details>
  );
}

export default function SubmitCommunity() {
  return <BrowserOnly>{() => <Form />}</BrowserOnly>;
}
