import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Симулятор сети из трёх нод: транзакция расходится по рёбрам, клик по ноде
// выключает её. Две живые ноды — кворум есть, одна — «сеть остановилась».
// Квест: прогнать транзакцию при одной выключенной ноде.

const XP_QUEST = 15;
const STEP_MS = 450;

const POS = [
  { x: 150, y: 48 },
  { x: 56, y: 200 },
  { x: 244, y: 200 },
];
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 2],
];

export default function NodeNetSim({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const [alive, setAlive] = useState([true, true, true]);
  const [sending, setSending] = useState(false);
  const [confirms, setConfirms] = useState<number | null>(null);
  const [questDone, setQuestDone] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  const aliveCount = alive.filter(Boolean).length;
  const noQuorum = aliveCount < 2;

  const toggleNode = (i: number) => {
    if (sending) return;
    setAlive((a) => a.map((v, k) => (k === i ? !v : v)));
    setConfirms(null);
  };

  const send = () => {
    if (sending || noQuorum) return;
    setSending(true);
    setConfirms(0);
    const count = aliveCount;
    for (let k = 1; k <= count; k += 1) {
      timersRef.current.push(window.setTimeout(() => setConfirms(k), STEP_MS * k));
    }
    timersRef.current.push(
      window.setTimeout(() => {
        setSending(false);
        if (count === 2 && !questDone) {
          setQuestDone(true);
          if (chapterId && trainerId) {
            const first = !store.getProgress().trainers[chapterId]?.[trainerId];
            store.markTrainerDone(chapterId, trainerId, { solved: true });
            if (first) store.addXp(XP_QUEST, `trainer:${chapterId}:${trainerId}`);
          }
        }
      }, STEP_MS * count + 200),
    );
  };

  return (
    <div className="nns">
      <p className="nns-quest">
        Квест: выключи ровно одну ноду кликом по ней и отправь транзакцию — сеть из двух
        оставшихся должна её подтвердить.
      </p>

      <svg viewBox="0 0 300 250" className="nns-svg" role="img" aria-label="Сеть из трёх нод">
        {EDGES.map(([a, b]) => {
          const active = alive[a] && alive[b];
          return (
            <line
              key={`${a}-${b}`}
              x1={POS[a].x}
              y1={POS[a].y}
              x2={POS[b].x}
              y2={POS[b].y}
              className={`nns-edge${active ? '' : ' nns-edge-off'}${
                active && sending ? ' nns-edge-pulse' : ''
              }`}
            />
          );
        })}
        {POS.map((p, i) => (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`нода node-${i} (${alive[i] ? 'работает' : 'выключена'})`}
            className={`nns-node${alive[i] ? '' : ' nns-node-off'}`}
            onClick={() => toggleNode(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleNode(i);
            }}
          >
            <circle cx={p.x} cy={p.y} r={26} />
            <text x={p.x} y={p.y + 4} textAnchor="middle">
              node-{i}
            </text>
          </g>
        ))}
      </svg>

      {noQuorum ? (
        <div className="nns-halt">
          Сеть остановилась: нет кворума. Осталась одна нода — «большинства из трёх» (двух
          согласных нод) больше не набрать, сверять хеши не с кем. Включи ноду обратно кликом.
        </div>
      ) : (
        <div className="nns-controls">
          <button type="button" className="nns-send" onClick={send} disabled={sending}>
            Отправить транзакцию
          </button>
          {confirms !== null ? (
            <span className="nns-confirms">
              Подтверждений: {confirms} из {aliveCount}
              {!sending && confirms >= 2 ? ' — большинство набрано, транзакция в блоке' : ''}
            </span>
          ) : null}
        </div>
      )}

      {questDone ? <div className="nns-done">Выполнено! +{XP_QUEST} XP</div> : null}
    </div>
  );
}
