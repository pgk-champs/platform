import React, { useEffect, useId, useRef, useState } from 'react';
import { store } from '../lib/store';
import { sha256Hex } from '../lib/sha256';
import './trainers.css';

const XP = 10;
const DEFAULT_TEXT = 'Привет, блокчейн!';

/**
 * Живая песочница SHA-256: печатаешь текст — видишь хеш. Предыдущий хеш
 * остаётся серым для сравнения, изменившиеся hex-символы подсвечены,
 * счётчик показывает масштаб «лавинного эффекта». Первое увиденное
 * изменение хеша (при заданных chapterId/trainerId) — зачёт + XP.
 */
export default function HashPlayground({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const inputId = useId();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [hash, setHash] = useState('');
  const [prevHash, setPrevHash] = useState('');
  const [rewarded, setRewarded] = useState(false);
  const hashRef = useRef('');
  const reqRef = useRef(0);
  const rewardedRef = useRef(false);

  // Хеш считаем только в браузере (WebCrypto нет на SSR-этапе сборки).
  // Счётчик запросов отбрасывает устаревшие ответы при быстрой печати.
  useEffect(() => {
    const req = ++reqRef.current;
    void sha256Hex(text).then((h) => {
      if (reqRef.current !== req || h === hashRef.current) return;
      setPrevHash(hashRef.current);
      hashRef.current = h;
      setHash(h);
    });
  }, [text]);

  const diff = prevHash && hash ? [...hash].filter((c, i) => c !== prevHash[i]).length : 0;

  useEffect(() => {
    if (diff === 0 || rewardedRef.current || !chapterId || !trainerId) return;
    rewardedRef.current = true;
    store.markTrainerDone(chapterId, trainerId, { diff });
    store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
    setRewarded(true);
  }, [diff, chapterId, trainerId]);

  return (
    <div className="hp">
      <label className="hp-label" htmlFor={inputId}>
        Текст — измени хотя бы один символ и следи за хешем
      </label>
      <input
        id={inputId}
        className="hp-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {prevHash ? (
        <>
          <div className="hp-label">Предыдущий SHA-256</div>
          <code className="hp-hash hp-hash-prev">{prevHash}</code>
        </>
      ) : null}

      <div className="hp-label">Текущий SHA-256</div>
      <code className="hp-hash">
        {hash
          ? [...hash].map((c, i) => (
              <span key={i} className={prevHash && prevHash[i] !== c ? 'hp-diff' : undefined}>
                {c}
              </span>
            ))
          : '…'}
      </code>

      {prevHash ? (
        <div className="hp-counter">
          Изменилось hex-символов: {diff} из 64
          {diff > 0 ? ' — лавинный эффект: крошечная правка меняет почти весь хеш' : ''}
        </div>
      ) : null}

      {rewarded ? (
        <div className="hc-reward">✓ Готово! +{XP} XP — ты увидел лавинный эффект своими глазами</div>
      ) : null}
    </div>
  );
}
