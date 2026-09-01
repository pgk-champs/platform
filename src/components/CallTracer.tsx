import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Пошаговый трассировщик вызова функции с map/лямбдой: кнопка «Шаг»
// подсвечивает текущую строку и показывает панель значений (it = 3 → 3000...).
// Шаги захардкожены по построчному разбору главы «Функции и лямбды».

const XP_SOLVE = 15;

export const CODE = [
  'fun toMeters(km: List<Int>): List<Int> {',
  '    return km.map { it * 1000 }',
  '}',
  '',
  'fun main() {',
  '    val distances = listOf(3, 5, 4)',
  '    val meters = toMeters(distances)',
  '    println(meters)',
  '}',
];

export type TraceStep = {
  /** Индекс подсвечиваемой строки в CODE. */
  line: number;
  /** Пары имя → значение для панели значений. */
  vars: [string, string][];
  note: string;
  /** Что уже напечатано в вывод к этому шагу. */
  out?: string;
};

export const STEPS: TraceStep[] = [
  {
    line: 4,
    vars: [],
    note: 'Запуск: выполнение всегда начинается с main. Объявление toMeters выше компилятор уже прочитал — порядок объявления функций не важен.',
  },
  {
    line: 5,
    vars: [['distances', '[3, 5, 4]']],
    note: 'Создан список: в distances теперь три дистанции в километрах.',
  },
  {
    line: 6,
    vars: [['distances', '[3, 5, 4]']],
    note: 'Вызов toMeters(distances): выполнение прыгает в функцию, аргумент distances передаётся параметру km.',
  },
  {
    line: 0,
    vars: [['km', '[3, 5, 4]']],
    note: 'Мы внутри toMeters: параметр km получил переданный список.',
  },
  {
    line: 1,
    vars: [['km', '[3, 5, 4]'], ['it', '3 → 3000']],
    note: 'map берёт первый элемент: it = 3, лямбда it * 1000 даёт 3000.',
  },
  {
    line: 1,
    vars: [['km', '[3, 5, 4]'], ['it', '5 → 5000']],
    note: 'Второй элемент: it = 5, лямбда возвращает 5000.',
  },
  {
    line: 1,
    vars: [['km', '[3, 5, 4]'], ['it', '4 → 4000']],
    note: 'Третий элемент: it = 4 → 4000. map собрал новый список [3000, 5000, 4000].',
  },
  {
    line: 1,
    vars: [['km', '[3, 5, 4]']],
    note: 'return отдаёт [3000, 5000, 4000] наружу — выполнение возвращается в место вызова.',
  },
  {
    line: 6,
    vars: [['distances', '[3, 5, 4]'], ['meters', '[3000, 5000, 4000]']],
    note: 'Результат функции лёг в meters — ровно туда, откуда был вызов.',
  },
  {
    line: 7,
    vars: [['distances', '[3, 5, 4]'], ['meters', '[3000, 5000, 4000]']],
    note: 'println печатает список.',
    out: '[3000, 5000, 4000]',
  },
  {
    line: 8,
    vars: [],
    note: 'Закрывающая скобка main — программа завершена.',
    out: '[3000, 5000, 4000]',
  },
];

export default function CallTracer({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них тренажёр работает без записи в store. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [idx, setIdx] = useState(-1);
  const rewardedRef = useRef(false);

  const step = idx >= 0 ? STEPS[idx] : null;
  const done = idx === STEPS.length - 1;

  useEffect(() => {
    if (done && !rewardedRef.current) {
      rewardedRef.current = true;
      if (chapterId && trainerId) {
        const first = !store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { solved: true, steps: STEPS.length });
        if (first) store.addXp(XP_SOLVE, `trainer:${chapterId}:${trainerId}`);
      }
    }
  }, [done, chapterId, trainerId]);

  return (
    <div className="ctr">
      <pre className="ctr-code" aria-label="Код трассировки">
        {CODE.map((line, i) => (
          <div key={i} className={`ctr-line ${step && step.line === i ? 'ctr-line-active' : ''}`.trim()}>
            <span className="ctr-lineno">{i + 1}</span>
            <code>{line || ' '}</code>
          </div>
        ))}
      </pre>

      <div className="ctr-panel">
        {step ? (
          <>
            <div className="ctr-counter">
              Шаг {idx + 1} из {STEPS.length}
            </div>
            {step.vars.length > 0 ? (
              <dl className="ctr-vars" aria-label="Значения">
                {step.vars.map(([name, value]) => (
                  <div key={name} className="ctr-var">
                    <dt>
                      <code>{name}</code>
                    </dt>
                    <dd>
                      <code>{value}</code>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <p className="ctr-note">{step.note}</p>
            {step.out ? (
              <p className="ctr-out">
                Вывод: <code>{step.out}</code>
              </p>
            ) : null}
          </>
        ) : (
          <p className="ctr-note">
            Нажимай «Шаг» и следи, как выполнение прыгает из main в функцию и обратно, а map
            прогоняет лямбду по каждому элементу.
          </p>
        )}

        {done ? <div className="ctr-done">Выполнено! Трассировка пройдена до конца.</div> : null}

        <div className="ctr-controls">
          {!done ? (
            <button type="button" className="ctr-btn" onClick={() => setIdx(idx + 1)}>
              Шаг
            </button>
          ) : null}
          {idx >= 0 ? (
            <button type="button" className="ctr-btn ctr-btn-reset" onClick={() => setIdx(-1)}>
              Сначала
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
