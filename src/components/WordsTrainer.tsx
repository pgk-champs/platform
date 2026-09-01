import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { VOCAB } from '../data/vocab';
import { loadProgress, statusOf, type Entry } from './RouteList';
import knowledgeMap from '../data/knowledge-map.json';
import './trainers.css';

// Тренировка слов: избранные слова + все словари пройденных глав.
// Очередь раунда строит store.words.queue — незнакомые («не знал»)
// получают больший вес и показываются чаще.

type Word = { term: string; translation: string; note?: string };

export function buildPool(): Word[] {
  const progress = loadProgress();
  const passed = new Set(
    (knowledgeMap as Entry[])
      .filter((e) => statusOf(e.id, !!progress[e.id]) === 'passed')
      .map((e) => e.id),
  );

  const byTerm = new Map<string, Word>();
  for (const f of store.favorites.list()) {
    if (f.data?.kind === 'word') {
      byTerm.set(f.data.term, { term: f.data.term, translation: f.data.translation, note: f.data.note });
    }
  }
  for (const v of VOCAB) {
    if (passed.has(v.chapterId) && !byTerm.has(v.term)) {
      byTerm.set(v.term, { term: v.term, translation: v.translation, note: v.note });
    }
  }
  return [...byTerm.values()];
}

export default function WordsTrainer() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  // Пул и очередь собираются после маунта: localStorage нет при SSR-рендере.
  const [pool, setPool] = useState<Word[] | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [roundKnown, setRoundKnown] = useState(0);

  useEffect(() => {
    const p = buildPool();
    setPool(p);
    setQueue(store.words.queue(p.map((w) => w.term)));
  }, []);

  if (pool === null) return <div className="wt">Загрузка…</div>;

  if (pool.length === 0) {
    return (
      <div className="wt wt-empty">
        <p>Пока нет слов для тренировки.</p>
        <p>
          Отметьте слова звёздочкой ★ в словарях глав или пройдите главу целиком на странице{' '}
          <Link to="/route">Маршрут</Link> — её словарь добавится сюда автоматически.
        </p>
      </div>
    );
  }

  const restart = () => {
    setQueue(store.words.queue(pool.map((w) => w.term)));
    setI(0);
    setRevealed(false);
    setRoundKnown(0);
  };

  if (i >= queue.length) {
    return (
      <div className="wt wt-done">
        <p>
          Круг пройден: {roundKnown} из {queue.length} показов — «знал».
        </p>
        <button type="button" className="button button--primary" onClick={restart}>
          Ещё круг
        </button>
      </div>
    );
  }

  const term = queue[i];
  const word = pool.find((w) => w.term === term)!;

  const grade = (known: boolean) => {
    store.words.grade(term, known);
    if (known) setRoundKnown((n) => n + 1);
    setRevealed(false);
    setI((n) => n + 1);
  };

  return (
    <div className="wt">
      <div className="wt-counter">
        {i + 1} / {queue.length} · слов в наборе: {pool.length}
      </div>
      <div className="wt-card">
        <div className="fc-term">{word.term}</div>
        {revealed ? (
          <>
            <div className="fc-translation">{word.translation}</div>
            {word.note ? <div className="fc-note">{word.note}</div> : null}
          </>
        ) : null}
      </div>
      {revealed ? (
        <div className="wt-controls">
          <button type="button" className="button button--success" onClick={() => grade(true)}>
            Знал
          </button>
          <button type="button" className="button button--danger" onClick={() => grade(false)}>
            Не знал
          </button>
        </div>
      ) : (
        <div className="wt-controls">
          <button type="button" className="button button--secondary" onClick={() => setRevealed(true)}>
            Показать перевод
          </button>
        </div>
      )}
    </div>
  );
}
