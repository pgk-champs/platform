import React, { useEffect, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// SVG-схема модулей :app / :ui-kit / :net: клик по паре узлов рисует
// стрелку-зависимость. Цикл подсвечивается красным, правильный ациклический
// граф (app→ui-kit, app→net) засчитывает тренажёр.

const FIRST_XP = 10;
const R = 32;

type NodeDef = { id: string; label: string; x: number; y: number };
export type Edge = { from: string; to: string };

const NODES: NodeDef[] = [
  { id: 'app', label: ':app', x: 160, y: 48 },
  { id: 'ui-kit', label: ':ui-kit', x: 72, y: 168 },
  { id: 'net', label: ':net', x: 248, y: 168 },
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

/** Рёбра, входящие хоть в один цикл: ребро циклично, если из его конца достижимо его начало. */
export function cycleEdges(edges: Edge[]): Edge[] {
  // ponytail: O(E²·V) перебор — на графе из трёх узлов быстрее не нужно
  const reaches = (from: string, to: string): boolean => {
    const seen = new Set([from]);
    const stack = [from];
    while (stack.length) {
      const n = stack.pop()!;
      if (n === to) return true;
      for (const e of edges)
        if (e.from === n && !seen.has(e.to)) {
          seen.add(e.to);
          stack.push(e.to);
        }
    }
    return false;
  };
  return edges.filter((e) => reaches(e.to, e.from));
}

export default function ModuleGraph({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const bad = cycleEdges(edges);
  const has = (from: string, to: string) => edges.some((e) => e.from === from && e.to === to);
  const done = bad.length === 0 && has('app', 'ui-kit') && has('app', 'net');

  useEffect(() => {
    if (!done || !chapterId || !trainerId) return;
    const already = store.getProgress().trainers[chapterId]?.[trainerId];
    store.markTrainerDone(chapterId, trainerId, { edges: edges.length });
    if (!already) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const clickNode = (id: string) => {
    if (!selected) return setSelected(id);
    if (selected === id) return setSelected(null);
    setEdges((prev) => {
      const exists = prev.some((e) => e.from === selected && e.to === id);
      return exists
        ? prev.filter((e) => !(e.from === selected && e.to === id))
        : [...prev, { from: selected, to: id }];
    });
    setSelected(null);
  };

  const lineFor = (e: Edge) => {
    const a = byId[e.from];
    const b = byId[e.to];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ux = (b.x - a.x) / len;
    const uy = (b.y - a.y) / len;
    // перпендикулярный сдвиг разводит встречные стрелки при цикле
    const px = -uy * 5;
    const py = ux * 5;
    return {
      x1: a.x + ux * R + px,
      y1: a.y + uy * R + py,
      x2: b.x - ux * (R + 10) + px,
      y2: b.y - uy * (R + 10) + py,
    };
  };

  const isBad = (e: Edge) => bad.some((c) => c.from === e.from && c.to === e.to);

  return (
    <div className="mg">
      <svg viewBox="0 0 320 224" className="mg-svg" role="img" aria-label="Граф зависимостей модулей">
        <defs>
          <marker id="mg-arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" className="mg-arrhead" />
          </marker>
          <marker id="mg-arr-bad" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" className="mg-arrhead-bad" />
          </marker>
        </defs>
        {edges.map((e) => (
          <line
            key={`${e.from}->${e.to}`}
            {...lineFor(e)}
            className={isBad(e) ? 'mg-edge mg-edge-bad' : 'mg-edge'}
            markerEnd={isBad(e) ? 'url(#mg-arr-bad)' : 'url(#mg-arr)'}
          />
        ))}
        {NODES.map((n) => (
          <g
            key={n.id}
            className="mg-node"
            role="button"
            tabIndex={0}
            aria-label={n.label}
            onClick={() => clickNode(n.id)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                clickNode(n.id);
              }
            }}
          >
            <circle cx={n.x} cy={n.y} r={R} className={selected === n.id ? 'mg-circle mg-sel' : 'mg-circle'} />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" className="mg-label">
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      {bad.length > 0 ? (
        <div className="mg-cycle">
          Циклическая зависимость! Gradle не может выбрать порядок сборки: каждый модуль ждёт
          другого — ровно та ошибка «Circular dependency between the following tasks» из раздела
          «Типичные ошибки». Убери стрелку в одном из направлений (повторный клик по той же паре).
        </div>
      ) : done ? (
        <div className="mg-done">
          Выполнено! :app зависит от :ui-kit и :net, циклов нет — Gradle соберёт такой проект.
          {chapterId && trainerId ? ` +${FIRST_XP} XP` : ''}
        </div>
      ) : (
        <div className="mg-hint">
          Клик по модулю выбирает его, клик по второму рисует зависимость «первый → второй»
          (повторный клик по той же паре убирает стрелку). Цель: :app зависит от :ui-kit и от :net.
        </div>
      )}

      <button type="button" className="mg-reset" onClick={() => { setEdges([]); setSelected(null); }}>
        Сбросить
      </button>
    </div>
  );
}
