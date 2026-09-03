import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Эмулятор экрана nano: два сценария на настоящие нажатия клавиш —
// «сохрани и выйди» (Ctrl+O → Enter → Ctrl+X) и «выйди без сохранения» (Ctrl+X → N).
// Ctrl+O/Ctrl+X перехватываются preventDefault в keydown; на случай, если браузер
// всё же заберёт сочетание себе, ^O и ^X в нижней панели кликабельны как fallback.

export type NanoStep = 'ctrl-o' | 'enter' | 'ctrl-x' | 'n';

type Scenario = {
  title: string;
  task: string;
  fileName: string;
  lines: string[];
  steps: NanoStep[];
};

const SCENARIOS: Scenario[] = [
  {
    title: 'Сценарий 1 из 2',
    task: 'Сохрани файл и выйди из nano',
    fileName: 'notes.txt',
    lines: ['port=2222', 'user=student'],
    steps: ['ctrl-o', 'enter', 'ctrl-x'],
  },
  {
    title: 'Сценарий 2 из 2',
    task: 'Выйди из nano БЕЗ сохранения изменений',
    fileName: 'draft.txt',
    lines: ['черновик — сохранять не нужно'],
    steps: ['ctrl-x', 'n'],
  },
];

const STEP_LABEL: Record<NanoStep, string> = {
  'ctrl-o': 'Ctrl+O (Write Out — сохранить)',
  enter: 'Enter (подтвердить имя файла)',
  'ctrl-x': 'Ctrl+X (Exit — выйти)',
  n: 'N (не сохранять)',
};

export function matchesStep(
  step: NanoStep,
  e: { ctrlKey: boolean; altKey: boolean; metaKey: boolean; code: string }
): boolean {
  const noMods = !e.ctrlKey && !e.altKey && !e.metaKey;
  switch (step) {
    case 'ctrl-o':
      return e.ctrlKey && !e.altKey && !e.metaKey && e.code === 'KeyO';
    case 'ctrl-x':
      return e.ctrlKey && !e.altKey && !e.metaKey && e.code === 'KeyX';
    case 'enter':
      return noMods && e.code === 'Enter';
    case 'n':
      return noMods && e.code === 'KeyN';
  }
}

function describePress(e: { ctrlKey: boolean; altKey: boolean; metaKey: boolean; shiftKey: boolean; code: string; key: string }): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Cmd');
  parts.push(e.code.replace(/^Key/, '').replace(/^Digit/, '') || e.key);
  return parts.join('+');
}

const PURE_MODIFIERS = ['Control', 'Shift', 'Alt', 'Meta', 'CapsLock'];
const XP = 25;

export default function NanoQuest({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них тренажёр работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [scenIdx, setScenIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [between, setBetween] = useState(false);
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const rewardedRef = useRef(false);

  const scen = SCENARIOS[scenIdx];
  const expected = scen.steps[stepIdx];

  const advance = () => {
    setHint(null);
    if (stepIdx + 1 < scen.steps.length) {
      setStepIdx(stepIdx + 1);
      return;
    }
    if (scenIdx + 1 < SCENARIOS.length) {
      setBetween(true);
      return;
    }
    setFinished(true);
    if (chapterId && trainerId && !rewardedRef.current) {
      rewardedRef.current = true;
      store.markTrainerDone(chapterId, trainerId, { scenarios: SCENARIOS.length });
      store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
    }
  };

  const miss = (pressed: string) => {
    if (expected === 'n' && (pressed === 'Y' || pressed === 'Enter')) {
      setHint('Y сохранит изменения — а задача выйти БЕЗ сохранения. Нажми N.');
      return;
    }
    setHint(`Нажато ${pressed} — а сейчас нужно ${STEP_LABEL[expected]}.`);
  };

  // Клик по кнопке-клавише — тот же путь, что настоящее нажатие (fallback,
  // если браузер перехватил сочетание раньше нашего preventDefault).
  const pressVirtual = (step: NanoStep, label: string) => {
    if (between || finished) return;
    if (step === expected) advance();
    else miss(label);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (between || finished) return;
    if (PURE_MODIFIERS.includes(e.key)) return;
    // Одиночный Tab не съедаем — иначе с клавиатуры из зоны не выбраться.
    if (e.code === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) return;
    e.preventDefault();
    if (matchesStep(expected, e)) advance();
    else miss(describePress(e));
  };

  const startScenario2 = () => {
    setScenIdx(1);
    setStepIdx(0);
    setBetween(false);
    setHint(null);
  };

  const reset = () => {
    setScenIdx(0);
    setStepIdx(0);
    setBetween(false);
    setFinished(false);
    setHint(null);
  };

  if (finished) {
    return (
      <div className="nq">
        <div className="nq-done">
          ✓ Выполнено! Оба сценария пройдены: сохранение через Ctrl+O и выход без
          сохранения через Ctrl+X → N.{chapterId && trainerId ? ` +${XP} XP` : ''}
        </div>
        <button type="button" className="nq-btn" onClick={reset}>
          Ещё раз
        </button>
      </div>
    );
  }

  if (between) {
    return (
      <div className="nq">
        <div className="nq-between">
          Файл записан, nano закрыт — сценарий 1 пройден. Теперь обратная ситуация: в
          файле лишние правки, их нужно отбросить.
        </div>
        <button type="button" className="nq-btn" onClick={startScenario2}>
          Сценарий 2 →
        </button>
      </div>
    );
  }

  // Что показывает нижняя строка экрана в текущем шаге.
  const savedAlready = scenIdx === 0 && stepIdx >= 2;
  const modified = !savedAlready;

  return (
    <div className="nq">
      <div className="nq-task">
        <span className="nq-task-n">{scen.title}.</span> {scen.task}
      </div>

      <div
        role="group"
        aria-label="Экран nano: кликни сюда и нажимай настоящие клавиши"
        tabIndex={0}
        className="nq-screen"
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <div className="nq-titlebar">
          <span>GNU nano 7.2</span>
          <span>{scen.fileName}</span>
          <span>{modified ? 'Изменён' : ''}</span>
        </div>

        <pre className="nq-body">{scen.lines.join('\n')}</pre>

        <div className="nq-status">
          {expected === 'enter' ? (
            <>
              <span className="nq-prompt">File Name to Write: {scen.fileName}</span>
              <button
                type="button"
                className="nq-key"
                onClick={() => pressVirtual('enter', 'Enter')}
              >
                Enter
              </button>
            </>
          ) : expected === 'n' ? (
            <>
              <span className="nq-prompt">Save modified buffer?</span>
              {/* Y ведёт к сохранению — задача обратная, поэтому это промах,
                  а не шаг сценария (кнопка рисует настоящий вопрос nano). */}
              <button type="button" className="nq-key" onClick={() => miss('Y')}>
                Y Yes
              </button>
              <button type="button" className="nq-key" onClick={() => pressVirtual('n', 'N')}>
                N No
              </button>
            </>
          ) : savedAlready ? (
            <span>[ Wrote {scen.lines.length} lines ]</span>
          ) : (
            <span> </span>
          )}
        </div>

        <div className="nq-panel">
          <span className="nq-panel-item">^G Help</span>
          <button
            type="button"
            className={`nq-panel-item nq-key ${expected === 'ctrl-o' ? 'nq-key-target' : ''}`.trim()}
            onClick={() => pressVirtual('ctrl-o', 'Ctrl+O')}
          >
            ^O Write Out
          </button>
          <span className="nq-panel-item">^W Where Is</span>
          <span className="nq-panel-item">^K Cut</span>
          <button
            type="button"
            className={`nq-panel-item nq-key ${expected === 'ctrl-x' ? 'nq-key-target' : ''}`.trim()}
            onClick={() => pressVirtual('ctrl-x', 'Ctrl+X')}
          >
            ^X Exit
          </button>
          <span className="nq-panel-item">^R Read File</span>
          <span className="nq-panel-item">^\ Replace</span>
          <span className="nq-panel-item">^U Paste</span>
        </div>
      </div>

      <p className="nq-focus-hint">
        {focused
          ? `Жми клавиши прямо сейчас — следующий шаг: ${STEP_LABEL[expected]}`
          : 'Кликни в окно nano, затем нажимай настоящие сочетания клавиш (подсвечены в панели). Если браузер перехватил сочетание — нажми его кнопкой прямо в панели.'}
      </p>

      {hint ? (
        <p className="nq-hint" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
