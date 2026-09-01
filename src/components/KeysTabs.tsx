import React, { useSyncExternalStore } from 'react';
import { store, type OsId } from '../lib/store';
import './trainers.css';

export type KeyCombo = { mac: string; win: string; linux: string };
export type KeyItem = { combo: KeyCombo; action: string };

const OS_LABELS: Record<OsId, string> = { mac: 'macOS', win: 'Windows', linux: 'Ubuntu' };
const OS_ORDER: OsId[] = ['mac', 'win', 'linux'];

export default function KeysTabs({ items }: { items: KeyItem[] }) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const os = store.prefs.getOs() ?? 'mac';

  return (
    <div className="keys-tabs">
      <div className="keys-os-switch" role="tablist" aria-label="Операционная система">
        {OS_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={os === id}
            className={`keys-os-btn ${os === id ? 'keys-os-btn-active' : ''}`.trim()}
            onClick={() => store.prefs.setOs(id)}
          >
            {OS_LABELS[id]}
          </button>
        ))}
      </div>
      <table className="keys-table">
        <thead>
          <tr>
            <th scope="col">Сочетание</th>
            <th scope="col">Действие</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>
                <kbd className="keys-kbd">{item.combo[os]}</kbd>
              </td>
              <td>{item.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
