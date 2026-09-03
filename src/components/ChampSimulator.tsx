// Симулятор чемпионата «Профессионалы»: выбор модуля официальных критериев
// оценки → тайм-боксед спринт с чек-листом аспектов → итоговая карточка.
// Данные — src/data/champ-criteria.json (см. заголовок файла на источник).
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import criteria from '../data/champ-criteria.json';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { simShareText } from '../lib/integrations';
import { isLoggedIn, submitResult } from '../lib/account';
import ShareResult from './ShareResult';
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

// Короткий beep по окончании перерыва (WebAudio, без внешних файлов).
// Любая ошибка (нет API, автоплей заблокирован) — просто тишина.
function beep(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => void ctx.close();
  } catch {
    // без звука
  }
}

const BREAK_PRESETS = [10, 15, 30];


type Phase = 'select' | 'run' | 'done';

export default function ChampSimulator() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);

  const [phase, setPhase] = useState<Phase>('select');
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(true);
  // Перерыв «как на чемпионате»: основной таймер стоит, перерыв тикает вниз.
  const [brk, setBrk] = useState<{ left: number; planned: number } | null>(null);
  const [breakLog, setBreakLog] = useState({ count: 0, totalSec: 0 });
  const [customBreak, setCustomBreak] = useState('');
  const [beepOn, setBeepOn] = useState(false);
  // «Чистый таймер»: полноэкранный оверлей с огромными цифрами.
  const [zen, setZen] = useState(false);
  const rewardedRef = useRef<Set<string>>(new Set());
  // Статус отправки результата в рейтинг: idle → sending → sent | error.
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Время считаем по моменту окончания, а не по числу тиков: в фоновой вкладке
  // (студент ушёл в Android Studio) браузер режет setInterval до одного тика в
  // минуту, и спринт на 8 часов отстал бы от реального времени на часы.
  const deadlineRef = useRef(0); // момент окончания спринта, мс
  const timeLeftRef = useRef(0); // остаток на момент заморозки (пауза/перерыв)
  const brkDeadlineRef = useRef(0);

  const secondsUntil = (deadline: number) => Math.max(0, Math.round((deadline - Date.now()) / 1000));

  // Единственная точка правды по времени спринта: остаток + его дедлайн.
  const setSprintTime = (sec: number) => {
    timeLeftRef.current = sec;
    deadlineRef.current = Date.now() + sec * 1000;
    setTimeLeft(sec);
  };

  const mod = MODULES.find((m) => m.id === moduleId) ?? null;
  const onBreak = brk !== null;

  const score = Object.values(checks).reduce((acc, v) => acc + v, 0);

  const exitZen = () => {
    setZen(false);
    try {
      if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    } catch {
      // ignore
    }
  };

  const enterZen = () => {
    setZen(true);
    // Fullscreen API опционален: если недоступен или отклонён — остаётся
    // просто оверлей на весь вьюпорт (graceful fallback).
    try {
      document.documentElement.requestFullscreen?.()?.catch?.(() => {});
    } catch {
      // fallback: только оверлей
    }
  };

  const finish = () => {
    if (!mod) return;
    const rounded = Math.round(score * 100) / 100;
    // Незавершённый перерыв тоже попадает в лог (фактически отгулянное время).
    let log = breakLog;
    if (brk) log = { count: log.count + 1, totalSec: log.totalSec + brk.planned - Math.max(0, brk.left) };
    store.sim.addRun(mod.id, {
      score: rounded,
      maxScore: mod.maxTotal,
      ...(log.count > 0 ? { breaks: log } : {}),
    });
    if (!rewardedRef.current.has(mod.id)) {
      rewardedRef.current.add(mod.id);
      const xp = Math.round(rounded * XP_PER_POINT);
      if (xp > 0) store.addXp(xp, `sim:${mod.id}`);
    }
    setBreakLog(log);
    setBrk(null);
    exitZen();
    setPhase('done');
  };

  useEffect(() => {
    if (phase !== 'run' || !running || onBreak) return undefined;
    // Запуск, снятие паузы, конец перерыва: новый дедлайн от остатка.
    deadlineRef.current = Date.now() + timeLeftRef.current * 1000;
    const tick = () => {
      const left = secondsUntil(deadlineRef.current);
      timeLeftRef.current = left;
      setTimeLeft(left);
    };
    const id = setInterval(tick, 1000);
    // Возврат на вкладку — пересчёт сразу, не дожидаясь следующего тика.
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [phase, running, onBreak]);

  // Тик перерыва: отдельный интервал (и тот же дедлайн вместо декремента),
  // основной таймер в это время замер.
  useEffect(() => {
    if (phase !== 'run' || !onBreak) return undefined;
    const tick = () =>
      setBrk((b) => {
        if (!b) return b;
        const left = secondsUntil(brkDeadlineRef.current);
        return left === b.left ? b : { ...b, left };
      });
    const id = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [phase, onBreak]);

  // Окончание перерыва: лог + оповещение (beep — опционально по чекбоксу).
  useEffect(() => {
    if (brk && brk.left <= 0) {
      setBreakLog((l) => ({ count: l.count + 1, totalSec: l.totalSec + brk.planned }));
      setBrk(null);
      if (beepOn) beep();
    }
  }, [brk, beepOn]);

  // Выход из браузерного fullscreen (Esc) закрывает и «чистый таймер».
  // В fallback-режиме событие не приходит — выход только кнопкой.
  useEffect(() => {
    if (!zen) return;
    const onChange = () => {
      if (!document.fullscreenElement) setZen(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [zen]);

  useEffect(() => {
    if (phase === 'run' && timeLeft <= 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const selectModule = (id: string) => {
    const m = MODULES.find((x) => x.id === id);
    if (!m) return;
    setModuleId(id);
    setChecks({});
    setSprintTime((m.timeLimitMinutes ?? 60) * 60);
    setRunning(true);
    setBrk(null);
    setBreakLog({ count: 0, totalSec: 0 });
    setPhase('run');
  };

  const resetRun = () => {
    if (!mod) return;
    setChecks({});
    setSprintTime((mod.timeLimitMinutes ?? 60) * 60);
    setRunning(true);
    setBrk(null);
    setBreakLog({ count: 0, totalSec: 0 });
  };

  const startBreak = (minutes: number) => {
    const m = Math.round(minutes);
    if (!m || m <= 0) return;
    brkDeadlineRef.current = Date.now() + m * 60 * 1000;
    setBrk({ left: m * 60, planned: m * 60 });
  };

  // Досрочное завершение: в лог идёт фактически отгулянное время.
  const endBreakEarly = () => {
    if (!brk) return;
    setBreakLog((l) => ({ count: l.count + 1, totalSec: l.totalSec + brk.planned - Math.max(0, brk.left) }));
    setBrk(null);
  };

  const backToSelect = () => {
    setPhase('select');
    setModuleId(null);
  };

  const sendToLeaderboard = async () => {
    if (!mod) return;
    setSubmitState('sending');
    const durationSec = Math.max(0, Math.round((mod.timeLimitMinutes ?? 60) * 60 - timeLeft));
    const ok = await submitResult({
      module: mod.id,
      title: mod.title,
      score: Math.round(score * 100) / 100,
      maxScore: mod.maxTotal,
      durationSec,
    });
    setSubmitState(ok ? 'sent' : 'error');
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
            {breakLog.count > 0 && (
              <div className="sim-history-row">
                Перерывы: {breakLog.count}, суммарно {fmtTime(breakLog.totalSec)}
              </div>
            )}
          </div>
          <div className="sim-leaderboard">
            {isLoggedIn() ? (
              <>
                <button
                  type="button"
                  className="sim-submit"
                  onClick={sendToLeaderboard}
                  disabled={submitState === 'sending' || submitState === 'sent'}
                >
                  {submitState === 'sent'
                    ? 'Результат в рейтинге ✓'
                    : submitState === 'sending'
                      ? 'Отправляем…'
                      : 'Отправить в рейтинг 🏆'}
                </button>
                <div className="sim-leaderboard-hint">
                  {submitState === 'error' ? (
                    <span className="sim-submit-err">Не удалось отправить — попробуй ещё раз.</span>
                  ) : (
                    <Link to="/leaderboard">Таблица лидеров →</Link>
                  )}
                </div>
              </>
            ) : (
              <div className="sim-leaderboard-hint">
                <Link to="/account">Войди через GitHub</Link>, чтобы результат попал в{' '}
                <Link to="/leaderboard">рейтинг</Link>.
              </div>
            )}
          </div>
          <ShareResult text={simShareText(Math.round(score * 100) / 100, mod.maxTotal)} />
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
          <button type="button" className="sim-timer-btn" onClick={enterZen}>
            Чистый таймер
          </button>
        </div>

        {onBreak ? (
          <div className="sim-break-active">
            <span className="sim-break-time">Перерыв: {fmtTime(brk?.left ?? 0)}</span>
            <button type="button" className="sim-timer-btn" onClick={endBreakEarly}>
              Завершить перерыв
            </button>
          </div>
        ) : (
          <div className="sim-break-controls">
            {BREAK_PRESETS.map((m) => (
              <button type="button" className="sim-timer-btn" key={m} onClick={() => startBreak(m)}>
                Перерыв {m} мин
              </button>
            ))}
            <input
              type="number"
              className="sim-break-input"
              min={1}
              max={180}
              placeholder="мин"
              aria-label="Свой перерыв, минут"
              value={customBreak}
              onChange={(e) => setCustomBreak(e.target.value)}
            />
            <button type="button" className="sim-timer-btn" onClick={() => startBreak(Number(customBreak))}>
              Свой перерыв
            </button>
            <label className="sim-break-beep">
              <input type="checkbox" checked={beepOn} onChange={(e) => setBeepOn(e.target.checked)} />
              звук по окончании
            </label>
          </div>
        )}

        {zen && (
          <div className="sim-zen">
            <div className="sim-zen-module">{mod.title}</div>
            {onBreak ? (
              <>
                <div className="sim-zen-label">Перерыв</div>
                <div className="sim-zen-time">{fmtTime(brk?.left ?? 0)}</div>
              </>
            ) : (
              <div className={`sim-zen-time ${lowTime ? 'sim-timer-low' : ''}`.trim()}>{fmtTime(timeLeft)}</div>
            )}
            <div className="sim-zen-score">
              Набрано {Math.round(score * 100) / 100} из {mod.maxTotal}
            </div>
            <button type="button" className="sim-zen-exit" onClick={exitZen}>
              Выйти
            </button>
          </div>
        )}

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
