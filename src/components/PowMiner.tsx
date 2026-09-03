import React, { useEffect, useId, useRef, useState } from 'react';
import { store } from '../lib/store';
import { sha256Hex } from '../lib/sha256';
import UnderHood from './UnderHood';
import './trainers.css';

const XP = 10;
const BATCH = 64; // попыток на порцию — между порциями отдаём поток браузеру
const DEFAULT_DATA = 'Блок #4: Alice -> Bob: 5 монет';
const DIFFICULTIES = [1, 2, 3, 4] as const;

/**
 * PoW-майнер: подбираем nonce, чтобы SHA-256(данные + nonce) начинался с
 * N нулей. Перебор идёт порциями через setTimeout — счётчик попыток и
 * хешей/сек живые, вкладка не зависает, есть стоп. Хеш считается только в
 * браузере (WebCrypto), SSR-рендер безопасен.
 */
export default function PowMiner({ chapterId, trainerId }: { chapterId?: string; trainerId?: string }) {
  const dataId = useId();
  const nonceId = useId();
  const [data, setData] = useState(DEFAULT_DATA);
  const [nonce, setNonce] = useState(0);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [hash, setHash] = useState('');
  const [mining, setMining] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hps, setHps] = useState(0);
  const [found, setFound] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const runRef = useRef(0); // инкремент = отмена текущего перебора
  const reqRef = useRef(0);
  const rewardedRef = useRef(false);

  const target = '0'.repeat(difficulty);

  // Живой хеш текущей пары данные+nonce (в эффекте — на SSR crypto нет).
  useEffect(() => {
    const req = ++reqRef.current;
    void sha256Hex(data + nonce).then((h) => {
      if (reqRef.current === req) setHash(h);
    });
  }, [data, nonce]);

  // Уход со страницы (SPA-навигация Docusaurus) отменяет перебор — иначе цикл
  // SHA-256 продолжал бы крутиться в фоне до самой находки nonce.
  useEffect(() => () => { runRef.current += 1; }, []);

  const mine = async () => {
    const run = ++runRef.current;
    setMining(true);
    setFound(false);
    setAttempts(0);
    const t0 = Date.now();
    let n = nonce;
    let tries = 0;
    for (;;) {
      for (let i = 0; i < BATCH; i += 1) {
        const h = await sha256Hex(data + n);
        tries += 1;
        if (runRef.current !== run) return;
        if (h.startsWith(target)) {
          setHash(h); // найденный хеш показываем сразу, не дожидаясь эффекта
          setNonce(n);
          setAttempts(tries);
          setHps(Math.round(tries / Math.max((Date.now() - t0) / 1000, 0.001)));
          setFound(true);
          setMining(false);
          if (chapterId && trainerId && !rewardedRef.current) {
            rewardedRef.current = true;
            store.markTrainerDone(chapterId, trainerId, { nonce: n, difficulty, attempts: tries });
            store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
            setRewarded(true);
          }
          return;
        }
        n += 1;
      }
      setNonce(n);
      setAttempts(tries);
      setHps(Math.round(tries / Math.max((Date.now() - t0) / 1000, 0.001)));
      await new Promise((r) => setTimeout(r, 0));
      if (runRef.current !== run) return;
    }
  };

  const stop = () => {
    runRef.current += 1;
    setMining(false);
  };

  const matched = hash.startsWith(target);

  return (
    <div className="pm">
      <label className="pm-label" htmlFor={dataId}>
        Данные блока
      </label>
      <input
        id={dataId}
        className="pm-input"
        value={data}
        disabled={mining}
        onChange={(e) => {
          setData(e.target.value);
          setFound(false);
        }}
      />

      <div className="pm-row">
        <label className="pm-label" htmlFor={nonceId}>
          nonce
          <input
            id={nonceId}
            className="pm-input pm-nonce"
            inputMode="numeric"
            value={nonce}
            disabled={mining}
            onChange={(e) => {
              setNonce(Math.max(0, Math.floor(Number(e.target.value)) || 0));
              setFound(false);
            }}
          />
        </label>
        <div className="pm-diff" role="group" aria-label="Сложность — сколько нулей в начале хеша">
          <span className="pm-label">Сложность</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={difficulty === d}
              disabled={mining}
              onClick={() => {
                setDifficulty(d);
                setFound(false);
              }}
            >
              {d} {d === 1 ? 'ноль' : d < 5 ? 'нуля' : 'нулей'} · ≈{(16 ** d).toLocaleString('ru-RU')} попыток
            </button>
          ))}
        </div>
      </div>

      <div className="pm-label">SHA-256(данные + nonce) — должен начинаться с «{target}»</div>
      <code className={'pm-hash' + (matched ? ' pm-hash-found' : '')}>
        {hash ? (
          <>
            <span className={matched ? 'pm-zeros' : undefined}>{hash.slice(0, difficulty)}</span>
            {hash.slice(difficulty)}
          </>
        ) : (
          '…'
        )}
      </code>

      <div className="pm-controls">
        {mining ? (
          <button type="button" className="pm-btn pm-btn-stop" onClick={stop}>
            Стоп
          </button>
        ) : (
          <button type="button" className="pm-btn" onClick={mine}>
            Майнить
          </button>
        )}
        {attempts > 0 && (
          <span className="pm-stats" aria-live="polite">
            попыток: {attempts.toLocaleString('ru-RU')} · {hps.toLocaleString('ru-RU')} хешей/сек
          </span>
        )}
      </div>

      {found && (
        <div className="pm-done" aria-live="polite">
          ✓ Выполнено! nonce = {nonce} найден за {attempts.toLocaleString('ru-RU')}{' '}
          {attempts % 10 === 1 && attempts % 100 !== 11 ? 'попытку' : 'попыток'}
          {rewarded ? ` +${XP} XP` : ''}. Каждый следующий ноль — примерно в 16 раз дольше: попробуй поднять сложность.
        </div>
      )}

      <UnderHood>
        Перебор честный: для каждого nonce строка «данные + nonce» хешируется настоящим SHA-256 через встроенный в
        браузер crypto.subtle.digest, и проверяется, начинается ли hex-запись хеша с нужного числа нулей. Чтобы вкладка
        не зависала, перебор идёт порциями по {BATCH} попытки с паузой через setTimeout — браузер успевает
        отрисовывать живой счётчик. Каждый следующий требуемый ноль уменьшает долю подходящих хешей в 16 раз (один
        hex-символ — 16 вариантов), отсюда и рост времени. Настоящие майнеры делают ровно то же самое, только на
        специализированных чипах и с триллионами попыток в секунду.
      </UnderHood>
    </div>
  );
}
