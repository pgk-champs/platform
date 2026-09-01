import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Живая модель рекомпозиции: родитель владеет count, дочерний «Счёт» читает
// его, дочернее «Имя» — нет (React.memo). Бейджи считают реальные рендеры
// компонентов, показывая, что перерисовалось после нажатия. Это модель на
// React — в Compose логика та же: перевызывается только то, что читало
// изменившееся состояние.

const FIRST_XP = 10;
const GOAL_CLICKS = 3;

function timesWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'раз';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'раза';
  return 'раз';
}

function RenderBadge({ n, testId }: { n: number; testId: string }) {
  return (
    <span className="rcc-badge" data-testid={testId}>
      перерисован {n} {timesWord(n)}
    </span>
  );
}

function CounterText({ count }: { count: number }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div className="rcc-node">
      <div className="rcc-node-head">
        <code>{'Text("Счёт: $count")'}</code> — читает count
      </div>
      <div className="rcc-node-value">Счёт: {count}</div>
      <RenderBadge n={renders.current} testId="rcc-badge-counter" />
    </div>
  );
}

const NameText = React.memo(function NameText({ name }: { name: string }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div className="rcc-node">
      <div className="rcc-node-head">
        <code>{'Text("Имя: $name")'}</code> — НЕ читает count
      </div>
      <div className="rcc-node-value">Имя: {name}</div>
      <RenderBadge n={renders.current} testId="rcc-badge-name" />
    </div>
  );
});

export default function RecompositionCounter({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const [count, setCount] = useState(0);
  const renders = useRef(0);
  renders.current += 1;
  const done = count >= GOAL_CLICKS;

  useEffect(() => {
    if (!done || !chapterId || !trainerId) return;
    const already = store.getProgress().trainers[chapterId]?.[trainerId];
    store.markTrainerDone(chapterId, trainerId, { clicks: count });
    if (!already) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div className="rcc">
      <div className="rcc-parent">
        <div className="rcc-parent-head">
          <span>
            Родитель <code>TrainingScreen</code> — владеет <code>count</code>
          </span>
          <RenderBadge n={renders.current} testId="rcc-badge-parent" />
        </div>
        <button type="button" className="rcc-btn" onClick={() => setCount((c) => c + 1)}>
          Плюс (count++)
        </button>
        <div className="rcc-children">
          <CounterText count={count} />
          <NameText name="Олег" />
        </div>
      </div>

      {count > 0 ? (
        <div className="rcc-msg">
          Нажатие записало новое значение count → родитель и «Счёт» перерисованы, потому что читают
          count. «Имя» не перерисовано: его данные не менялись, и перерисовка пропущена.
        </div>
      ) : (
        <div className="rcc-hint">
          Нажми «Плюс» и следи за бейджами: кто из трёх кусков экрана перерисовался, а кто — нет.
        </div>
      )}

      <div className="rcc-note">
        Это модель на React, в Compose логика та же: у «Имени» перерисовку пропускает React.memo, а в
        Compose то же самое делает отслеживание чтений State.
      </div>

      {done && (
        <div className="rcc-done">
          Выполнено! После {GOAL_CLICKS} нажатий «Имя» так и осталось с одной отрисовкой —
          перерисовывается только то, что читало изменившееся состояние.
          {chapterId && trainerId ? ` +${FIRST_XP} XP` : ''}
        </div>
      )}
    </div>
  );
}
