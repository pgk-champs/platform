import React, { useSyncExternalStore } from 'react';
import { store, type IdeId } from '../lib/store';
import './trainers.css';

export type { IdeId };
export type IdeTabItem = { ide: IdeId; content: React.ReactNode };

const IDE_LABELS: Record<IdeId, string> = {
  'android-studio': 'Android Studio',
  webstorm: 'WebStorm',
  vscode: 'VS Code',
};

/**
 * Вставки «если ты в X»: переключатель IDE по образцу KeysTabs, тот же
 * глобальный выбор в store, что и у переключателя ОС. Показывает только те
 * вкладки, для которых передан content — так один и тот же компонент
 * годится и для «WebStorm/VS Code» в блокчейн-треке, и для полного набора
 * трёх IDE там, где это понадобится позже.
 */
export default function IdeTabs({ items, defaultIde = 'webstorm' }: { items: IdeTabItem[]; defaultIde?: IdeId }) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  if (items.length === 0) return null;

  const available = items.map((item) => item.ide);
  const stored = store.prefs.getIde();
  const ide = stored && available.includes(stored) ? stored : available.includes(defaultIde) ? defaultIde : available[0];
  const current = items.find((item) => item.ide === ide) ?? items[0];

  return (
    <div className="keys-tabs">
      <div className="keys-os-switch" role="tablist" aria-label="IDE">
        {items.map((item) => (
          <button
            key={item.ide}
            type="button"
            role="tab"
            aria-selected={ide === item.ide}
            className={`keys-os-btn ${ide === item.ide ? 'keys-os-btn-active' : ''}`.trim()}
            onClick={() => store.prefs.setIde(item.ide)}
          >
            {IDE_LABELS[item.ide]}
          </button>
        ))}
      </div>
      <div className="ide-card">
        <div className="ide-card-desc">{current.content}</div>
      </div>
    </div>
  );
}
