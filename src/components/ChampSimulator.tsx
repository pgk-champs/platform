// Симулятор чемпионата «Профессионалы»: выбор модуля официальных критериев
// оценки → тайм-боксед спринт с чек-листом аспектов → итоговая карточка.
// Данные — src/data/champ-criteria.json (см. заголовок файла на источник).
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import criteria from '../data/champ-criteria.json';
import { store } from '../lib/store';
import './trainers.css';

type Item = { text: string; maxScore: number; type: 'measurable' | 'judgement' };
type Section = { title: string; items: Item[] };
export type SimModule = {
  id: string;
  title: string;
  timeLimitMinutes?: number;
  sections: Section[];
  maxTotal: number;
};

const MODULES = (criteria as { modules: SimModule[] }).modules;

// 2 XP за каждый набранный балл критериев — сопоставимо с EXAM_XP=40 у
// «Экзамена главы» (там за 100%-й экзамен из 4 вопросов); засчитывается один
// раз за модуль за визит на страницу, повторные прогоны балл обновляют, но
// не удваивают награду (тот же принцип, что у ChapterExam).
const XP_PER_POINT = 2;

function fmtTime(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function gradeFor(pct: number): string {
  if (pct >= 80) return 'Отлично';
  if (pct >= 60) return 'Хорошо';
  return 'Потренируйся ещё';
}

function itemKey(sIdx: number, iIdx: number): string {
  return `${sIdx}-${iIdx}`;
}

type Phase = 'select' | 'run' | 'done';

export default function ChampSimulator() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const [phase, setPhase] = useState<Phase>('select');
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(true);
  const rewardedRef = useRef<Set<string>>(new Set());

  const mod = MODULES.find((m) => m.id === moduleId) ?? null;

  const score = Object.values(checks).reduce((acc, v) => acc + v, 0);

  const finish = () => {
    if (!mod) return;
    const rounded = Math.round(score * 100) / 100;
    store.sim.addRun(mod.id, { score: rounded, maxScore: mod.maxTotal });
    if (!rewardedRef.current.has(mod.id)) {
      rewardedRef.current.add(mod.id);
      const xp = Math.round(rounded * XP_PER_POINT);
      if (xp > 0) store.addXp(xp, `sim:${mod.id}`);
    }
    setPhase('done');
  };

  useEffect(() => {
    if (phase !== 'run' || !running) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, running]);

  useEffect(() => {
    if (phase === 'run' && timeLeft <= 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const selectModule = (id: string) => {
    const m = MODULES.find((x) => x.id === id);
    if (!m) return;
    setModuleId(id);
    setChecks({});
    setTimeLeft((m.timeLimitMinutes ?? 60) * 60);
    setRunning(true);
    setPhase('run');
  };

  const resetRun = () => {
    if (!mod) return;
    setChecks({});
    setTimeLeft((mod.timeLimitMinutes ?? 60) * 60);
    setRunning(true);
  };

  const backToSelect = () => {
    setPhase('select');
    setModuleId(null);
  };

  const toggleMeasurable = (key: string, maxScore: number) => {
    setChecks((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = maxScore;
      return next;
    });
  };

  const setJudgement = (key: string, value: number) => {
    setChecks((prev) => ({ ...prev, [key]: value }));
  };

  // --- экран выбора модуля ---
  if (phase === 'select' || !mod) {
    return (
      <div className="sim">
        <div className="sim-grid">
          {MODULES.map((m) => {
            const stats = store.sim.stats(m.id);
            const itemCount = m.sections.reduce((acc, s) => acc + s.items.length, 0);
            return (
              <div className="sim-card" key={m.id}>
                <div className="sim-card-title">{m.title}</div>
                <div className="sim-card-meta">
                  ⏱ {m.timeLimitMinutes ? fmtTime(m.timeLimitMinutes * 60) : '—'} · {itemCount} критериев ·{' '}
                  {m.maxTotal} баллов
                </div>
                {stats.best ? (
                  <div className="sim-card-best">
                    Лучший результат: {stats.best.score} из {stats.best.maxScore} (попыток: {stats.count})
                  </div>
                ) : (
                  <div className="sim-card-best sim-card-best-empty">Ещё не пройден</div>
                )}
                <button type="button" className="sim-card-start" onClick={() => selectModule(m.id)}>
                  Начать спринт
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- итоговая карточка ---
  if (phase === 'done') {
    const pct = mod.maxTotal > 0 ? Math.round((score / mod.maxTotal) * 1000) / 10 : 0;
    const stats = store.sim.stats(mod.id);
    return (
      <div className="sim">
        <div className="sim-done">
          <div className="sim-done-title">{mod.title}</div>
          <div className="sim-done-grade">{gradeFor(pct)}</div>
          <div className="sim-done-score">
            Набрано {Math.round(score * 100) / 100} из {mod.maxTotal} ({pct}%)
          </div>
          <div className="sim-history">
            <div className="sim-history-title">Мои попытки по этому модулю</div>
            <div className="sim-history-row">
              Лучший результат: {stats.best ? `${stats.best.score} из ${stats.best.maxScore}` : '—'}
            </div>
            <div className="sim-history-row">Попыток всего: {stats.count}</div>
          </div>
          <div className="sim-done-actions">
            <button type="button" className="sim-card-start" onClick={() => selectModule(mod.id)}>
              Попробовать снова
            </button>
            <button type="button" className="sim-back" onClick={backToSelect}>
              Выбрать другой модуль
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- экран спринта: таймер + чек-лист ---
  const lowTime = mod.timeLimitMinutes ? timeLeft <= Math.min(60, mod.timeLimitMinutes * 60 * 0.1) : false;
  return (
    <div className="sim">
      <div className="sim-run">
        <div className="sim-run-head">
          <button type="button" className="sim-back" onClick={backToSelect}>
            ← Модули
          </button>
          <span className="sim-run-title">{mod.title}</span>
        </div>

        <div className={`sim-timer ${lowTime ? 'sim-timer-low' : ''}`.trim()}>{fmtTime(timeLeft)}</div>
        <div className="sim-timer-controls">
          <button type="button" className="sim-timer-btn" onClick={() => setRunning((r) => !r)}>
            {running ? 'Пауза' : 'Продолжить'}
          </button>
          <button type="button" className="sim-timer-btn" onClick={resetRun}>
            Сбросить
          </button>
        </div>

        <div className="sim-score-live">
          Набрано {Math.round(score * 100) / 100} из {mod.maxTotal}
        </div>

        {mod.sections.map((s, sIdx) => (
          <div className="sim-section" key={s.title}>
            <div className="sim-section-title">{s.title}</div>
            {s.items.map((item, iIdx) => {
              const key = itemKey(sIdx, iIdx);
              if (item.type === 'measurable') {
                const checked = !!checks[key];
                return (
                  <label className="sim-item sim-item-measurable" key={key}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMeasurable(key, item.maxScore)} />
                    <span className="sim-item-text">{item.text}</span>
                    <span className="sim-item-score">{item.maxScore}</span>
                  </label>
                );
              }
              const value = checks[key] ?? 0;
              return (
                <div className="sim-item sim-item-judgement" key={key}>
                  <span className="sim-item-text">{item.text}</span>
                  <div className="sim-item-slider">
                    <input
                      type="range"
                      min={0}
                      max={item.maxScore}
                      step={0.1}
                      value={value}
                      onChange={(e) => setJudgement(key, Number(e.target.value))}
                      aria-label={item.text}
                    />
                    <span className="sim-item-score">
                      {Math.round(value * 10) / 10} / {item.maxScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <button type="button" className="sim-finish" onClick={finish}>
          Завершить спринт
        </button>
      </div>
    </div>
  );
}
