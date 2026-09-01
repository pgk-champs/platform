import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Раскладка сущностей проекта по модулям :app / :ui-kit / :net:
// клик по карточке выбирает её, клик по колонке кладёт туда.

const PERFECT_XP = 15;

export type SortCol = 'app' | 'ui-kit' | 'net';
export type SortCard = { name: string; correct: SortCol; why: string };

const COLS: { id: SortCol; label: string; hint: string }[] = [
  { id: 'app', label: ':app', hint: 'экраны и точка входа' },
  { id: 'ui-kit', label: ':ui-kit', hint: 'дизайн-система' },
  { id: 'net', label: ':net', hint: 'сетевой слой' },
];

const DEFAULT_CARDS: SortCard[] = [
  { name: 'Colors', correct: 'ui-kit', why: 'цвета дизайн-системы объявляются один раз и переиспользуются всеми экранами' },
  { name: 'Dimens', correct: 'ui-kit', why: 'отступы и размеры — часть дизайн-системы, как и в разборе этой главы' },
  { name: 'ProductCard', correct: 'ui-kit', why: 'переиспользуемый @Composable — ровно то, ради чего :ui-kit и заводят' },
  { name: 'MainActivity', correct: 'app', why: 'точка входа приложения живёт только в модуле с com.android.application' },
  { name: 'CatalogScreen', correct: 'app', why: 'конкретный экран собирает готовые компоненты — это код приложения, не библиотеки' },
  { name: 'Retrofit-клиент', correct: 'net', why: 'создание и настройка сетевого клиента — внутренности сетевого слоя' },
  { name: 'ApiResponse', correct: 'net', why: 'модель ответа сервера объявлена рядом с кодом, который её получает' },
  { name: 'TokenStorage', correct: 'net', why: 'хранение токенов для авторизации запросов — деталь сетевого слоя' },
];

export default function ModuleSort({
  cards = DEFAULT_CARDS,
  chapterId,
  trainerId,
}: {
  cards?: SortCard[];
  chapterId?: string;
  trainerId?: string;
}) {
  const [placed, setPlaced] = useState<Record<string, SortCol>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const rewardedRef = useRef(false);

  if (cards.length === 0) return null;

  const pool = cards.filter((c) => !placed[c.name]);
  const allPlaced = pool.length === 0;
  const wrong = cards.filter((c) => placed[c.name] && placed[c.name] !== c.correct);
  const perfect = checked && wrong.length === 0;

  const clickCard = (name: string) => {
    if (placed[name]) {
      // карточка из колонки возвращается в пул
      setPlaced((p) => {
        const next = { ...p };
        delete next[name];
        return next;
      });
      setChecked(false);
      return;
    }
    setSelected(selected === name ? null : name);
  };

  const clickCol = (col: SortCol) => {
    if (!selected) return;
    setPlaced((p) => ({ ...p, [selected]: col }));
    setSelected(null);
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (chapterId && trainerId) {
      const correct = cards.length - wrong.length;
      store.markTrainerDone(chapterId, trainerId, { correct, total: cards.length });
      if (wrong.length === 0 && !rewardedRef.current) {
        rewardedRef.current = true;
        store.addXp(PERFECT_XP, `trainer:${chapterId}:${trainerId}`);
      }
    }
  };

  const reset = () => {
    setPlaced({});
    setSelected(null);
    setChecked(false);
  };

  const mark = (c: SortCard) => (!checked ? '' : placed[c.name] === c.correct ? ' msort-ok' : ' msort-no');

  return (
    <div className="msort">
      {pool.length > 0 && (
        <div className="msort-pool">
          {pool.map((c) => (
            <button
              key={c.name}
              type="button"
              className={selected === c.name ? 'msort-card msort-sel' : 'msort-card'}
              onClick={() => clickCard(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="msort-cols">
        {COLS.map((col) => (
          <div
            key={col.id}
            className="msort-col"
            role="button"
            tabIndex={0}
            onClick={() => clickCol(col.id)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                clickCol(col.id);
              }
            }}
          >
            <div className="msort-col-head">
              {col.label}
              <span className="msort-col-hint">{col.hint}</span>
            </div>
            {cards
              .filter((c) => placed[c.name] === col.id)
              .map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`msort-card${mark(c)}`}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    clickCard(c.name);
                  }}
                >
                  {c.name}
                </button>
              ))}
          </div>
        ))}
      </div>

      {!checked && (
        <div className="msort-bar">
          <span className="msort-hint">
            {selected
              ? `Куда положить «${selected}»? Кликни по колонке.`
              : allPlaced
                ? 'Всё разложено — проверяй.'
                : 'Кликни по карточке, затем по колонке-модулю. Карточку из колонки можно вернуть кликом.'}
          </span>
          <button type="button" className="msort-check" disabled={!allPlaced} onClick={check}>
            Проверить
          </button>
        </div>
      )}

      {perfect && (
        <div className="msort-done">
          Выполнено! Все {cards.length} сущностей по своим модулям.
          {chapterId && trainerId ? ` +${PERFECT_XP} XP` : ''}
        </div>
      )}

      {checked && wrong.length > 0 && (
        <div className="msort-errors">
          <b>Не сошлось: {wrong.length} из {cards.length}.</b>
          <ul>
            {wrong.map((c) => (
              <li key={c.name}>
                «{c.name}» — правильный модуль <code>:{c.correct}</code>: {c.why}.
              </li>
            ))}
          </ul>
          Верни подсвеченные карточки кликом и разложи заново.
        </div>
      )}

      <button type="button" className="msort-reset" onClick={reset}>
        Сбросить
      </button>
    </div>
  );
}
