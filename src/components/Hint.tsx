import React, { useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

export type HintType = 'tip' | 'important' | 'fact';

const TYPE_META: Record<HintType, { label: string; icon: string }> = {
  tip: { label: 'Совет', icon: '💡' },
  important: { label: 'Важно', icon: '⚠️' },
  fact: { label: 'Интересный факт', icon: '✨' },
};

export default function Hint({ id, type, children }: { id: string; type: HintType; children: React.ReactNode }) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  // "Показать подсказку" — временный возврат в рамках текущего просмотра
  // страницы, не отменяет постоянное решение "больше не показывать".
  const [forceShow, setForceShow] = useState(false);
  const meta = TYPE_META[type];
  const dismissed = store.isHintDismissed(id);

  if (dismissed && !forceShow) {
    return (
      <button type="button" className="hint-collapsed" onClick={() => setForceShow(true)}>
        {meta.icon} Показать подсказку
      </button>
    );
  }

  return (
    <div className={`hint hint-${type}`}>
      <div className="hint-header">
        <span className="hint-icon" aria-hidden="true">
          {meta.icon}
        </span>
        <span className="hint-label">{meta.label}</span>
      </div>
      <div className="hint-body">{children}</div>
      <button
        type="button"
        className="hint-dismiss"
        onClick={() => {
          store.dismissHint(id);
          setForceShow(false);
        }}
      >
        Понятно, больше не показывать
      </button>
    </div>
  );
}
