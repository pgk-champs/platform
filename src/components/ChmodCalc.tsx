import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Калькулятор прав доступа chmod: 9 галочек rwx ↔ восьмеричное число ↔
// буквенная запись, синхронизация в обе стороны.

const GROUPS = [
  { name: 'Владелец', desc: 'пользователь, которому принадлежит файл' },
  { name: 'Группа', desc: 'участники группы файла' },
  { name: 'Остальные', desc: 'все прочие пользователи системы' },
] as const;

const RIGHTS = [
  { char: 'r', label: 'чтение' },
  { char: 'w', label: 'запись' },
  { char: 'x', label: 'запуск' },
] as const;

const PRESETS = [
  { oct: '755', hint: 'скрипты и каталоги: владелец всё, остальные читают и запускают' },
  { oct: '644', hint: 'обычные файлы: владелец пишет, остальные читают' },
  { oct: '600', hint: 'приватный файл: только владелец' },
  { oct: '777', hint: 'всем всё — почти всегда ошибка' },
];

const DONE_XP = 10;

/** 0o755 → '755' */
export function toOctal(bits: number): string {
  return [(bits >> 6) & 7, (bits >> 3) & 7, bits & 7].join('');
}

/** 0o755 → 'rwxr-xr-x' */
export function toLetters(bits: number): string {
  let s = '';
  for (let i = 8; i >= 0; i -= 1) {
    s += (bits >> i) & 1 ? 'rwx'[(8 - i) % 3] : '-';
  }
  return s;
}

export default function ChmodCalc({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них работает как песочница, без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [bits, setBits] = useState(0o644);
  // Черновик поля ввода: пока число не собралось в валидные 3 цифры,
  // держим строку как есть, чтобы можно было печатать посимвольно.
  const [draft, setDraft] = useState<string | null>(null);
  const [usedBoxes, setUsedBoxes] = useState(false);
  const [usedOctal, setUsedOctal] = useState(false);
  const rewardedRef = useRef(false);

  const goalDone = usedBoxes && usedOctal;

  useEffect(() => {
    if (!goalDone || !chapterId || !trainerId || rewardedRef.current) return;
    rewardedRef.current = true;
    store.markTrainerDone(chapterId, trainerId, { octal: toOctal(bits) });
    store.addXp(DONE_XP, `trainer:${chapterId}:${trainerId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalDone, chapterId, trainerId]);

  const mask = (g: number, r: number) => 1 << ((2 - g) * 3 + (2 - r));

  const toggle = (g: number, r: number) => {
    setBits((b) => b ^ mask(g, r));
    setDraft(null);
    setUsedBoxes(true);
  };

  const onOctalChange = (v: string) => {
    if (/^[0-7]{3}$/.test(v)) {
      setBits(parseInt(v, 8));
      setDraft(null);
      setUsedOctal(true);
    } else {
      setDraft(v);
    }
  };

  const applyPreset = (oct: string) => {
    setBits(parseInt(oct, 8));
    setDraft(null);
  };

  const invalid = draft !== null && /[^0-7]/.test(draft);

  return (
    <div className="cc">
      <div className="cc-groups">
        {GROUPS.map((grp, g) => (
          <div className="cc-group" key={grp.name}>
            <div className="cc-group-head">
              <span className="cc-group-name">{grp.name}</span>
              <span className="cc-digit">{(bits >> ((2 - g) * 3)) & 7}</span>
            </div>
            <div className="cc-group-desc">{grp.desc}</div>
            {RIGHTS.map((rt, r) => (
              <label className="cc-right" key={rt.char}>
                <input
                  type="checkbox"
                  checked={!!(bits & mask(g, r))}
                  onChange={() => toggle(g, r)}
                  aria-label={`${grp.name}: ${rt.label}`}
                />
                <code className="cc-right-char">{rt.char}</code>
                <span>{rt.label}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div className="cc-readout">
        <label className="cc-octal">
          chmod{' '}
          <input
            className={`cc-octal-input ${invalid ? 'cc-octal-invalid' : ''}`.trim()}
            value={draft ?? toOctal(bits)}
            onChange={(e) => onOctalChange(e.target.value)}
            onBlur={() => setDraft(null)}
            aria-label="восьмеричные права"
            inputMode="numeric"
            maxLength={3}
          />
        </label>
        <code className="cc-letters">{toLetters(bits)}</code>
      </div>
      {invalid ? <div className="cc-error">Нужно три цифры от 0 до 7 — например, 644</div> : null}

      <div className="cc-presets">
        {PRESETS.map((p) => (
          <button
            key={p.oct}
            type="button"
            className={`cc-preset ${p.oct === '777' ? 'cc-preset-warn' : ''}`.trim()}
            title={p.hint}
            onClick={() => applyPreset(p.oct)}
          >
            {p.oct}
          </button>
        ))}
      </div>

      {bits === 0o777 ? (
        <div className="cc-warn">
          777 — любой пользователь сможет читать, менять и запускать этот файл. Почти всегда это
          ошибка: выбирай права по принципу «не больше, чем нужно».
        </div>
      ) : null}

      {chapterId && trainerId ? (
        <div className={`cc-goal ${goalDone ? 'cc-goal-done' : ''}`.trim()}>
          {goalDone
            ? `✓ Разобрался: связь работает в обе стороны! +${DONE_XP} XP`
            : 'Задание: щёлкни любую галочку и введи число (например, 640) — увидишь связь в обе стороны'}
        </div>
      ) : null}
    </div>
  );
}
