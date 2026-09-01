import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Сборка структуры карточки товара: перетасованные строки вёрстки кликами
// выстроить в правильную вложенность; проверка подсвечивает ошибочные позиции.

type Line = { id: string; text: string; indent: number };

const LINES: Line[] = [
  { id: 'col', text: 'Column(Modifier.padding(12.dp)) {', indent: 0 },
  { id: 'img', text: 'Image(...) // изображение товара', indent: 1 },
  { id: 'title', text: 'Text(text = title, fontSize = 16.sp)', indent: 1 },
  { id: 'row', text: 'Row(horizontalArrangement = Arrangement.SpaceBetween) {', indent: 1 },
  { id: 'price', text: 'Text(text = price, fontSize = 18.sp)', indent: 2 },
  { id: 'rowEnd', text: '} // конец Row', indent: 1 },
  { id: 'colEnd', text: '} // конец Column', indent: 0 },
];

// Фиксированная перетасовка вместо Math.random — одинакова на сервере и клиенте.
const SHUFFLED = ['price', 'colEnd', 'img', 'row', 'title', 'rowEnd', 'col'];

const XP = 25;

const byId = (id: string): Line => LINES.find((l) => l.id === id)!;

export default function CardAssembler({ chapterId, trainerId }: { chapterId?: string; trainerId?: string }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongIdx, setWrongIdx] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const rewardedRef = useRef(false);

  const pool = SHUFFLED.filter((id) => !placed.includes(id));

  const add = (id: string) => {
    if (solved) return;
    setPlaced([...placed, id]);
    setWrongIdx([]);
  };

  const remove = (idx: number) => {
    if (solved) return;
    setPlaced(placed.filter((_, i) => i !== idx));
    setWrongIdx([]);
  };

  const check = () => {
    if (solved || placed.length !== LINES.length) return;
    const wrong = placed.map((id, i) => (id === LINES[i].id ? -1 : i)).filter((i) => i >= 0);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setWrongIdx(wrong);
    if (wrong.length === 0) {
      setSolved(true);
      if (chapterId && trainerId) {
        store.markTrainerDone(chapterId, trainerId, { attempts: nextAttempts });
        if (!rewardedRef.current) {
          rewardedRef.current = true;
          store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
        }
      }
    }
  };

  const reset = () => {
    setPlaced([]);
    setWrongIdx([]);
  };

  return (
    <div className="casm">
      <div className="casm-hint">
        Кликай по строкам в правильном порядке — сверху вниз, как они идут в коде карточки. Клик по собранной
        строке возвращает её обратно.
      </div>

      {pool.length > 0 ? (
        <div className="casm-pool">
          {pool.map((id) => {
            const l = byId(id);
            return (
              <button key={id} type="button" className="casm-line" onClick={() => add(id)}>
                {l.text}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="casm-card">
        {placed.length === 0 ? (
          <div className="casm-empty">Карточка пока пустая</div>
        ) : (
          placed.map((id, i) => {
            const l = byId(id);
            return (
              <button
                key={id}
                type="button"
                className={`casm-line casm-placed ${wrongIdx.includes(i) ? 'casm-bad' : ''}`.trim()}
                style={{ marginLeft: `${l.indent * 1.25}rem` }}
                onClick={() => remove(i)}
              >
                {l.text}
              </button>
            );
          })
        )}
      </div>

      {solved ? (
        <div className="casm-done">
          Выполнено! Структура карточки собрана верно.
          {chapterId && trainerId ? ` +${XP} XP` : ''}
        </div>
      ) : (
        <div className="casm-actions">
          <button type="button" className="casm-check" disabled={placed.length !== LINES.length} onClick={check}>
            Проверить
          </button>
          <button type="button" className="casm-reset" disabled={placed.length === 0} onClick={reset}>
            Сбросить
          </button>
          {wrongIdx.length > 0 ? (
            <span className="casm-feedback">
              Подсвеченные строки стоят не на своих местах — верни их и собери заново.
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
