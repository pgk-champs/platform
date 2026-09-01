import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Соединялка «код Compose ↔ скетч экрана»: клик по фрагменту кода,
// затем по скетчу — пара; «Проверить» сверяет все три.

const PERFECT_XP = 15;

export type SketchKind = 'column' | 'row' | 'button';
export type CodeSketchPair = { id: string; code: string; sketch: SketchKind; why: string };

const DEFAULT_PAIRS: CodeSketchPair[] = [
  {
    id: 'column',
    sketch: 'column',
    code: 'Column {\n    Text("Привет, Олег!")\n    Text("Готов к тренировке?")\n}',
    why: 'Column складывает содержимое сверху вниз — два текста окажутся друг под другом',
  },
  {
    id: 'row',
    sketch: 'row',
    code: 'Row {\n    Text("Победы: 7")\n    Text("Поражения: 2")\n}',
    why: 'Row выстраивает содержимое слева направо — два текста лягут в один ряд',
  },
  {
    id: 'button',
    sketch: 'button',
    code: 'Button(onClick = onStartClick) {\n    Text("Начать")\n}',
    why: 'Button рисует одну нажимаемую кнопку, а Text внутри трейлинг-лямбды — надпись на ней',
  },
];

function Sketch({ kind }: { kind: SketchKind }) {
  return (
    <svg viewBox="0 0 120 90" className="csm-svg" aria-hidden focusable="false">
      <rect x="6" y="6" width="108" height="78" rx="8" className="csm-frame" />
      {kind === 'column' && (
        <>
          <rect x="20" y="26" width="80" height="9" rx="4" className="csm-line" />
          <rect x="20" y="46" width="62" height="9" rx="4" className="csm-line" />
        </>
      )}
      {kind === 'row' && (
        <>
          <rect x="16" y="40" width="42" height="9" rx="4" className="csm-line" />
          <rect x="66" y="40" width="38" height="9" rx="4" className="csm-line" />
        </>
      )}
      {kind === 'button' && (
        <>
          <rect x="28" y="32" width="64" height="26" rx="13" className="csm-pill" />
          <rect x="44" y="42" width="32" height="6" rx="3" className="csm-pill-label" />
        </>
      )}
    </svg>
  );
}

export default function CodeSketchMatch({
  pairs = DEFAULT_PAIRS,
  chapterId,
  trainerId,
}: {
  pairs?: CodeSketchPair[];
  chapterId?: string;
  trainerId?: string;
}) {
  // matches: id пары кода -> id пары, чей скетч выбран
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const rewardedRef = useRef(false);

  if (pairs.length === 0) return null;

  // Скетчи показываем не в порядке кода: статичный сдвиг на одну позицию.
  const sketches = pairs.map((_, i) => pairs[(i + 1) % pairs.length]);

  const allMatched = pairs.every((p) => matches[p.id]);
  const wrong = pairs.filter((p) => matches[p.id] && matches[p.id] !== p.id);
  const perfect = checked && allMatched && wrong.length === 0;

  const clickCode = (id: string) => {
    if (matches[id]) {
      setMatches((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
      setChecked(false);
      return;
    }
    setSelected(selected === id ? null : id);
  };

  const clickSketch = (sketchOwnerId: string) => {
    if (!selected) return;
    setMatches((m) => {
      const next = { ...m };
      // один скетч — одна пара: снимаем чужую привязку к этому скетчу
      for (const k of Object.keys(next)) {
        if (next[k] === sketchOwnerId) delete next[k];
      }
      next[selected] = sketchOwnerId;
      return next;
    });
    setSelected(null);
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (chapterId && trainerId) {
      const correct = pairs.length - wrong.length;
      store.markTrainerDone(chapterId, trainerId, { correct, total: pairs.length });
      if (wrong.length === 0 && !rewardedRef.current) {
        rewardedRef.current = true;
        store.addXp(PERFECT_XP, `trainer:${chapterId}:${trainerId}`);
      }
    }
  };

  const sketchNo = (ownerId: string) => sketches.findIndex((s) => s.id === ownerId) + 1;
  const codeMark = (p: CodeSketchPair) =>
    !checked || !matches[p.id] ? '' : matches[p.id] === p.id ? ' csm-ok' : ' csm-no';

  return (
    <div className="csm">
      <div className="csm-grid">
        <div className="csm-codes">
          {pairs.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`csm-code${selected === p.id ? ' csm-sel' : ''}${codeMark(p)}`}
              onClick={() => clickCode(p.id)}
            >
              <pre>{p.code}</pre>
              {matches[p.id] && <span className="csm-badge">скетч {sketchNo(matches[p.id])}</span>}
            </button>
          ))}
        </div>
        <div className="csm-sketches">
          {sketches.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="csm-sketch"
              aria-label={`Скетч ${i + 1}`}
              onClick={() => clickSketch(s.id)}
            >
              <Sketch kind={s.sketch} />
              <span className="csm-sketch-no">скетч {i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {!checked && (
        <div className="csm-bar">
          <span className="csm-hint">
            {selected
              ? 'Теперь кликни по скетчу, который нарисует этот код.'
              : allMatched
                ? 'Все пары собраны — проверяй.'
                : 'Кликни по фрагменту кода, затем по подходящему скетчу. Пару можно разорвать кликом по коду.'}
          </span>
          <button type="button" className="csm-check" disabled={!allMatched} onClick={check}>
            Проверить
          </button>
        </div>
      )}

      {perfect && (
        <div className="csm-done">
          Выполнено! Все {pairs.length} фрагмента узнаны по их экранному результату.
          {chapterId && trainerId ? ` +${PERFECT_XP} XP` : ''}
        </div>
      )}

      {checked && wrong.length > 0 && (
        <div className="csm-errors">
          <b>
            Не сошлось: {wrong.length} из {pairs.length}.
          </b>
          <ul>
            {wrong.map((p) => (
              <li key={p.id}>
                Фрагмент с <code>{p.code.split(/[\s({]/, 1)[0]}</code> — {p.why}.
              </li>
            ))}
          </ul>
          Разорви подсвеченные пары кликом по коду и собери заново.
        </div>
      )}
    </div>
  );
}
