import React, { useEffect, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Модель видимости зависимостей: цепочка :app → :ui-kit → :lib,
// переключатель api/implementation на ребре ui-kit→lib показывает,
// доступен ли класс из :lib модулю :app.

const FIRST_XP = 10;

type Mode = 'api' | 'implementation';

export default function ApiVisToggle({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const [mode, setMode] = useState<Mode>('api');
  const [seenBoth, setSeenBoth] = useState(false);

  const visible = mode === 'api';

  useEffect(() => {
    if (!seenBoth || !chapterId || !trainerId) return;
    const already = store.getProgress().trainers[chapterId]?.[trainerId];
    store.markTrainerDone(chapterId, trainerId, { seen: ['api', 'implementation'] });
    if (!already) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenBoth]);

  const pick = (m: Mode) => {
    if (m !== mode) setSeenBoth(true);
    setMode(m);
  };

  return (
    <div className="avt">
      <div className="avt-chain">
        <div className="avt-mod">:app</div>
        <div className="avt-edge">
          <span className="avt-edge-label">implementation</span>
          <span className="avt-arrow">→</span>
        </div>
        <div className="avt-mod">:ui-kit</div>
        <div className="avt-edge">
          <span className="avt-toggle" role="group" aria-label="Конфигурация зависимости ui-kit → lib">
            {(['api', 'implementation'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={mode === m ? 'avt-toggle-btn avt-toggle-on' : 'avt-toggle-btn'}
                onClick={() => pick(m)}
              >
                {m}
              </button>
            ))}
          </span>
          <span className="avt-arrow">→</span>
        </div>
        <div className="avt-mod">:lib</div>
      </div>

      <div className="avt-app">
        <div className="avt-app-title">Внутри :app (Main.kt)</div>
        <code className="avt-import">import ru.champs.lib.LibClass</code>
        <div className={visible ? 'avt-class avt-class-ok' : 'avt-class avt-class-off'}>
          LibClass — {visible ? 'виден из :app: зависимость просочилась транзитивно через api' : 'НЕ виден из :app: implementation не пробрасывает :lib дальше'}
        </div>
        {visible ? (
          <pre className="avt-out avt-out-ok">{'BUILD SUCCESSFUL — :lib есть на classpath компиляции :app'}</pre>
        ) : (
          <pre className="avt-out avt-out-bad">{"e: Main.kt:3:18 Unresolved reference 'lib'."}</pre>
        )}
      </div>

      {seenBoth ? (
        <div className="avt-done">
          Выполнено! Ты увидел оба режима: api раскрывает :lib потребителям :ui-kit, implementation —
          прячет.{chapterId && trainerId ? ` +${FIRST_XP} XP` : ''}
        </div>
      ) : (
        <div className="avt-hint">
          Переключи зависимость ui-kit → lib на implementation и посмотри, что случится с импортом в :app.
        </div>
      )}
    </div>
  );
}
