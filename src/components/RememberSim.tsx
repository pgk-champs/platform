import React, { useEffect, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Симулятор remember: переключатель «без remember / с remember», кнопка
// счётчика и кнопка «Форсировать рекомпозицию». Без remember рекомпозиция
// создаёт var count = 0 заново и значение теряется; с remember — значение
// переживает перевызов функции. Цель: увидеть обе судьбы значения.

const FIRST_XP = 10;

export default function RememberSim({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const [withRemember, setWithRemember] = useState(false);
  const [count, setCount] = useState(0);
  const [recomps, setRecomps] = useState(0);
  const [msg, setMsg] = useState('');
  const [seenReset, setSeenReset] = useState(false);
  const [seenKept, setSeenKept] = useState(false);
  const done = seenReset && seenKept;

  useEffect(() => {
    if (!done || !chapterId || !trainerId) return;
    const already = store.getProgress().trainers[chapterId]?.[trainerId];
    store.markTrainerDone(chapterId, trainerId, { seenReset: true, seenKept: true });
    if (!already) store.addXp(FIRST_XP, `trainer:${chapterId}:${trainerId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pickMode = (m: boolean) => {
    if (m === withRemember) return;
    setWithRemember(m);
    setCount(0);
    setRecomps(0);
    setMsg(
      m
        ? 'Режим «с remember»: значение теперь живёт снаружи тела функции, в хранилище remember.'
        : 'Режим «без remember»: значение — обычный var внутри тела функции.',
    );
  };

  const increment = () => {
    setCount((c) => c + 1);
    setMsg(
      withRemember
        ? 'count++ → setValue записал новое значение в MutableState, который хранит remember.'
        : 'count++ увеличил локальный var — но он живёт только до следующего вызова функции.',
    );
  };

  const recompose = () => {
    setRecomps((r) => r + 1);
    if (withRemember) {
      setMsg(
        `Рекомпозиция: функция вызвана заново, remember отдал сохранённое значение — счёт остался ${count}.`,
      );
      if (count > 0) setSeenKept(true);
    } else {
      setMsg(
        count > 0
          ? `Рекомпозиция: функция вызвана заново, var count = 0 создан заново — накопленное значение ${count} потеряно, счёт сброшен в 0.`
          : 'Рекомпозиция: функция вызвана заново, var count = 0 создан заново.',
      );
      if (count > 0) setSeenReset(true);
      setCount(0);
    }
  };

  return (
    <div className="rms">
      <div className="rms-toggle" role="group" aria-label="Как объявлен счётчик">
        <button
          type="button"
          className={withRemember ? 'rms-toggle-btn' : 'rms-toggle-btn rms-toggle-on'}
          onClick={() => pickMode(false)}
        >
          без remember
        </button>
        <button
          type="button"
          className={withRemember ? 'rms-toggle-btn rms-toggle-on' : 'rms-toggle-btn'}
          onClick={() => pickMode(true)}
        >
          с remember
        </button>
      </div>

      <code className="rms-code">
        {withRemember ? 'var count by remember { mutableStateOf(0) }' : 'var count = 0  // внутри тела функции'}
      </code>

      <div className="rms-screen">
        <div className="rms-count">Счёт: {count}</div>
        <div className="rms-recomps">Рекомпозиций: {recomps}</div>
      </div>

      <div className="rms-actions">
        <button type="button" className="rms-btn" onClick={increment}>
          Плюс (count++)
        </button>
        <button type="button" className="rms-btn" onClick={recompose}>
          Форсировать рекомпозицию
        </button>
      </div>

      {msg ? <div className="rms-msg">{msg}</div> : null}

      {done ? (
        <div className="rms-done">
          Выполнено! Ты увидел обе судьбы значения: без remember рекомпозиция сбрасывает счёт в 0, с
          remember — сохраняет.{chapterId && trainerId ? ` +${FIRST_XP} XP` : ''}
        </div>
      ) : (
        <div className="rms-hint">
          Накрути счёт и форсируй рекомпозицию в обоих режимах — сравни, что случится со значением.
        </div>
      )}
    </div>
  );
}
