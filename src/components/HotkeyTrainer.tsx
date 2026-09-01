import React, { useState, useSyncExternalStore } from 'react';
import { store, type OsId } from '../lib/store';
import './trainers.css';

const FIRST_XP = 10;
const FLAWLESS_XP = 15;

export type HotkeyItem = {
  /** Название действия — то, что видит ученик в задании. */
  action: string;
  /** Сочетания в записи как у KeysTabs: '⌘/', 'Ctrl+/', 'Alt+1', '⇧F6', 'Shift+F10'. */
  mac: string;
  win: string;
  linux: string;
  /**
   * Браузер перехватывает это сочетание (Ctrl+S/W/T, ⌘1…9 и т.п.) —
   * настоящее нажатие проверить нельзя, задание закрывается кнопкой-подтверждением.
   */
  browserReserved?: boolean;
};

export type HotkeyTrainerProps = {
  items: HotkeyItem[];
  /** Опциональны вместе: без них тренажёр работает, но ничего не пишет в store. */
  chapterId?: string;
  trainerId?: string;
};

export type ParsedCombo = { ctrl: boolean; alt: boolean; shift: boolean; meta: boolean; code: string };

const MAC_MODS: Record<string, 'ctrl' | 'alt' | 'shift' | 'meta'> = {
  '⌘': 'meta',
  '⌃': 'ctrl',
  '⌥': 'alt',
  '⇧': 'shift',
};

const WORD_MODS: Record<string, 'ctrl' | 'alt' | 'shift' | 'meta'> = {
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  shift: 'shift',
  cmd: 'meta',
  meta: 'meta',
  win: 'meta',
};

const PUNCT_CODES: Record<string, string> = {
  '/': 'Slash',
  '\\': 'Backslash',
  '.': 'Period',
  ',': 'Comma',
  ';': 'Semicolon',
  '-': 'Minus',
  '=': 'Equal',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  '`': 'Backquote',
  "'": 'Quote',
};

function keyToCode(token: string): string | null {
  const t = token.trim();
  if (/^[a-z]$/i.test(t)) return 'Key' + t.toUpperCase();
  if (/^[0-9]$/.test(t)) return 'Digit' + t;
  if (/^f([1-9]|1[0-2])$/i.test(t)) return 'F' + t.slice(1);
  const named: Record<string, string> = {
    space: 'Space',
    пробел: 'Space',
    enter: 'Enter',
    tab: 'Tab',
    esc: 'Escape',
    escape: 'Escape',
    backspace: 'Backspace',
    del: 'Delete',
    delete: 'Delete',
  };
  const byName = named[t.toLowerCase()];
  if (byName) return byName;
  return PUNCT_CODES[t] ?? null;
}

/**
 * Разбирает строку сочетания в модификаторы + KeyboardEvent.code.
 * Понимает mac-запись символами (⌘⌃⌥⇧ подряд + клавиша) и запись через плюс
 * (Ctrl+Alt+L). Непонятное (например «Shift, дважды») — null: такое задание
 * проверяется кнопкой-подтверждением, как browserReserved.
 */
export function parseCombo(raw: string): ParsedCombo | null {
  const combo: ParsedCombo = { ctrl: false, alt: false, shift: false, meta: false, code: '' };
  let rest = raw.trim();
  if (/[⌘⌃⌥⇧]/.test(rest)) {
    while (rest && MAC_MODS[rest[0]]) {
      combo[MAC_MODS[rest[0]]] = true;
      rest = rest.slice(1);
    }
    if (/[⌘⌃⌥⇧]/.test(rest)) return null; // модификатор не в начале — не понимаем
    const code = keyToCode(rest);
    if (!code) return null;
    combo.code = code;
    return combo;
  }
  const parts = rest.split('+').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const keyToken = parts.pop()!;
  for (const p of parts) {
    const mod = WORD_MODS[p.toLowerCase()];
    if (!mod) return null;
    combo[mod] = true;
  }
  const code = keyToCode(keyToken);
  if (!code) return null;
  combo.code = code;
  return combo;
}

function matchesEvent(e: React.KeyboardEvent, c: ParsedCombo): boolean {
  return (
    e.ctrlKey === c.ctrl &&
    e.altKey === c.alt &&
    e.shiftKey === c.shift &&
    e.metaKey === c.meta &&
    e.code === c.code
  );
}

// Человекочитаемая запись того, что реально нажали — для дружелюбной ошибки.
function describeEvent(e: React.KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Cmd');
  const key = e.code.replace(/^Key/, '').replace(/^Digit/, '') || e.key;
  parts.push(key);
  return parts.join('+');
}

const OS_LABELS: Record<OsId, string> = { mac: 'macOS', win: 'Windows', linux: 'Ubuntu' };
const OS_ORDER: OsId[] = ['mac', 'win', 'linux'];
const PURE_MODIFIER_KEYS = ['Control', 'Shift', 'Alt', 'Meta', 'CapsLock'];

export default function HotkeyTrainer({ items, chapterId, trainerId }: HotkeyTrainerProps) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const os = store.prefs.getOs() ?? 'mac';

  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'err' | null>(null);
  const [lastPress, setLastPress] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [focused, setFocused] = useState(false);

  if (items.length === 0) return null;

  const done = index >= items.length;
  const current = done ? null : items[index];
  const currentComboText = current ? current[os] : '';
  const parsed = current ? parseCombo(currentComboText) : null;
  // «Псевдо»-режим: браузер перехватит сочетание, либо запись не про клавиши
  // (например «Shift, дважды») — честно говорим и закрываем задание кнопкой.
  const manual = !!current && (current.browserReserved || parsed === null);

  const advance = () => {
    setFlash('ok');
    setLastPress(null);
    setHintShown(false);
    const next = index + 1;
    setIndex(next);
    if (next >= items.length) complete();
  };

  const complete = () => {
    if (!chapterId || !trainerId) return;
    const prev = store.getProgress().trainers[chapterId]?.[trainerId];
    const prevMistakes = (prev?.result as { mistakes?: number } | undefined)?.mistakes;
    if (prevMistakes === undefined || mistakes < prevMistakes) {
      store.markTrainerDone(chapterId, trainerId, { total: items.length, mistakes });
    }
    if (!prev) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    if (mistakes === 0 && prevMistakes !== 0) {
      store.addXp(FLAWLESS_XP, `trainer-goal:${chapterId}:${trainerId}`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!current || manual) return;
    if (PURE_MODIFIER_KEYS.includes(e.key)) return;
    // Одиночный Tab не съедаем — иначе с клавиатуры из зоны не выбраться.
    if (e.code === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey && parsed!.code !== 'Tab') return;
    e.preventDefault();
    if (matchesEvent(e, parsed!)) {
      advance();
    } else {
      setFlash('err');
      setMistakes((m) => m + 1);
      setLastPress(describeEvent(e));
    }
  };

  const reset = () => {
    setIndex(0);
    setMistakes(0);
    setFlash(null);
    setLastPress(null);
    setHintShown(false);
  };

  return (
    <div className="hk-trainer">
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

      <div className="hk-progress" aria-hidden="true">
        {items.map((_, i) => (
          <span
            key={i}
            className={`hk-dot ${i < index ? 'hk-dot-done' : ''} ${i === index ? 'hk-dot-current' : ''}`.trim()}
          />
        ))}
      </div>
      <p className="hk-score">Выполнено: {index} из {items.length}</p>

      {done ? (
        <div className="hk-result" role="status">
          <span className="hk-result-check" aria-hidden="true">✓</span>
          <p className="hk-result-title">Готово! Все {items.length} сочетаний выполнены.</p>
          <p className="hk-result-sub">
            {mistakes === 0
              ? 'Без единого промаха — рука уже помнит!'
              : `Промахов по пути: ${mistakes}. Повтори серию — станет чище.`}
          </p>
          <button type="button" className="hk-btn" onClick={reset}>
            Ещё раз
          </button>
        </div>
      ) : (
        <>
          <p className="hk-task">
            Нажми сочетание: <strong>{current!.action}</strong>
          </p>

          {manual ? (
            <div className="hk-reserved">
              <p>
                Сочетание <kbd className="keys-kbd">{currentComboText}</kbd> перехватит браузер —
                здесь его не проверить. Потренируй его в самой IDE.
              </p>
              <button type="button" className="hk-btn" onClick={advance}>
                Потренирую в IDE — дальше
              </button>
            </div>
          ) : (
            <>
              <div
                role="group"
                aria-label="Зона тренировки: кликни и нажми сочетание"
                tabIndex={0}
                className={`hk-zone ${flash === 'ok' ? 'hk-zone-ok' : ''} ${flash === 'err' ? 'hk-zone-err' : ''}`.trim()}
                onKeyDown={onKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              >
                {focused ? 'Жми сочетание прямо сейчас' : 'Кликни сюда, затем нажми сочетание клавиш'}
              </div>

              {lastPress && (
                <p className="hk-feedback hk-feedback-err" role="status">
                  Нажато: <kbd className="keys-kbd">{lastPress}</kbd> — не то сочетание. Попробуй ещё раз
                  или открой подсказку.
                </p>
              )}

              {hintShown ? (
                <p className="hk-hint">
                  Подсказка: <kbd className="keys-kbd">{currentComboText}</kbd>
                </p>
              ) : (
                <button type="button" className="hk-btn hk-btn-ghost" onClick={() => setHintShown(true)}>
                  Показать подсказку
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
