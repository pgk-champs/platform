import React, { useEffect, useState } from 'react';
import { decideMaterial, fetchModerationQueue, type PendingItem } from '../lib/account';
import type { NormalizedPreset } from '../../server/preset.d.mts';

type PresetData = NormalizedPreset;

/** Первые строки набора — столько, чтобы решение принималось глазами. */
export function presetPeek(p: PresetData, limit = 5): string[] {
  switch (p.engine) {
    case 'flashcards':
      return p.cards.slice(0, limit).map((c) => `${c.term} — ${c.translation}`);
    case 'wordorder':
      return [p.phrase];
    case 'codetyping':
      return p.snippets.slice(0, limit);
    case 'predict':
      return [p.code.split('\n').slice(0, limit).join('\n'), `→ ${p.expected}`];
    default:
      return [];
  }
}
import './trainers.css';

// Вынесено из раздела наставника, чтобы этой же очередью пользовалась страница
// модератора: ручки /moderate/* пускают и наставника, и модератора, так что
// разным страницам нужен один и тот же список.

// Очередь модерации присланных материалов.
export default function ModerationQueue() {
  const [items, setItems] = useState<PendingItem[] | null>(null);
  const reload = () => fetchModerationQueue().then(setItems);
  useEffect(() => {
    reload();
  }, []);
  const act = async (id: number, action: 'approve' | 'reject') => {
    await decideMaterial(id, action);
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
            // Набор — это данные, а не ссылка. Пока карточка умела только
            // ссылку, модератор одобрял набор вслепую: ни движка, ни единой
            // карточки видно не было.
            const preset = it.type === 'preset' ? (it.data as PresetData) : null;
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
                  {preset && (
                    <div className="mn-qpreset">
                      <span className="mn-qsummary">{it.summary ?? preset.engine}</span>
                      <ol className="mn-qpeek">
                        {presetPeek(preset).map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ol>
                    </div>
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
