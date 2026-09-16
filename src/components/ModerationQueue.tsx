import React, { useEffect, useState } from 'react';
import { decideMaterial, fetchModerationQueue, type PendingItem } from '../lib/account';
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
