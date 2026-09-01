import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Цепочка модификаторов карточками с кнопками ▲▼ и живым превью:
// порядок padding/background/fillMaxWidth меняет картинку, как в главе.

const DONE_XP = 15;

export type ModId = 'fillMaxWidth' | 'padding' | 'background';

const MOD_CODE: Record<ModId, string> = {
  fillMaxWidth: '.fillMaxWidth()',
  padding: '.padding(16.dp)',
  background: '.background(Color.Green)',
};

const MOD_DESC: Record<ModId, string> = {
  fillMaxWidth: 'занять всю доступную ширину',
  padding: 'отступ 16dp по краям',
  background: 'закрасить область цветом',
};

type Task = { text: string; check: (order: ModId[]) => boolean };

const TASKS: Task[] = [
  {
    text: 'Сделай отступ прозрачным: фон НЕ должен закрашивать зону padding — цветная область только внутри отступа.',
    check: (o) => o.indexOf('padding') < o.indexOf('background'),
  },
  {
    text: 'Теперь наоборот: фон должен покрыть и зону отступа — текст внутри цветной области с полем 16dp.',
    check: (o) => o.indexOf('background') < o.indexOf('padding'),
  },
];

const START_ORDER: ModId[] = ['background', 'padding', 'fillMaxWidth'];

export default function ModifierChain({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const [order, setOrder] = useState<ModId[]>(START_ORDER);
  const [taskIdx, setTaskIdx] = useState(0);
  const rewardedRef = useRef(false);

  const done = taskIdx >= TASKS.length;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    if (taskIdx < TASKS.length && TASKS[taskIdx].check(next)) {
      const nextTask = taskIdx + 1;
      setTaskIdx(nextTask);
      if (nextTask === TASKS.length && !rewardedRef.current) {
        rewardedRef.current = true;
        if (chapterId && trainerId) {
          store.markTrainerDone(chapterId, trainerId, { tasks: TASKS.length });
          store.addXp(DONE_XP, `trainer:${chapterId}:${trainerId}`);
        }
      }
    }
  };

  // Слои превью: левый модификатор цепочки — внешний, правый — внутренний,
  // ровно как «каждый модификатор оборачивает результат предыдущего».
  const renderLayers = (idx: number): React.ReactNode => {
    if (idx >= order.length) return <span className="mchain-text">Привет, Compose!</span>;
    const id = order[idx];
    const cls =
      id === 'padding' ? 'mchain-l mchain-l-pad' : id === 'background' ? 'mchain-l mchain-l-bg' : 'mchain-l';
    return <div className={cls}>{renderLayers(idx + 1)}</div>;
  };

  const padBeforeBg = order.indexOf('padding') < order.indexOf('background');
  const fillBeforePad = order.indexOf('fillMaxWidth') < order.indexOf('padding');

  return (
    <div className="mchain">
      {!done && (
        <div className="mchain-task">
          Задание {taskIdx + 1} из {TASKS.length}: {TASKS[taskIdx].text}
        </div>
      )}

      <div className="mchain-body">
        <div className="mchain-cards">
          {order.map((id, i) => (
            <div key={id} className="mchain-card">
              <div className="mchain-card-main">
                <code>{MOD_CODE[id]}</code>
                <span className="mchain-card-desc">{MOD_DESC[id]}</span>
              </div>
              <div className="mchain-card-btns">
                <button
                  type="button"
                  className="mchain-btn"
                  aria-label={`выше: ${MOD_CODE[id]}`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="mchain-btn"
                  aria-label={`ниже: ${MOD_CODE[id]}`}
                  disabled={i === order.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mchain-preview">
          <div className="mchain-canvas" aria-label="превью элемента">
            {renderLayers(0)}
          </div>
          <code className="mchain-code">
            Modifier{order.map((id) => MOD_CODE[id]).join('')}
          </code>
        </div>
      </div>

      <div className="mchain-explain">
        <p>
          {padBeforeBg
            ? 'padding стоит раньше background: отступ применяется снаружи, фон закрашивает только внутреннюю область — зона отступа остаётся прозрачной.'
            : 'background стоит раньше padding: фон закрашивается первым и покрывает всю область элемента, а отступ прижимает текст внутрь цветной зоны.'}
        </p>
        <p>
          {fillBeforePad
            ? 'fillMaxWidth раньше padding: элемент сначала занял всю ширину, и отступ вычитается уже внутри неё.'
            : 'padding раньше fillMaxWidth: отступ применился первым, элемент заполняет ширину, оставшуюся после него.'}
        </p>
      </div>

      {done && (
        <div className="mchain-done">
          Выполнено! Оба порядка собраны — теперь видно, почему цепочка читается слева направо.
          {chapterId && trainerId ? ` +${DONE_XP} XP` : ''}
        </div>
      )}
    </div>
  );
}
