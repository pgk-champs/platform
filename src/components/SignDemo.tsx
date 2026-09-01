import React, { useId, useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

const XP = 10;
const ALG = { name: 'ECDSA', namedCurve: 'P-256' } as const;
const SIGN_ALG = { name: 'ECDSA', hash: 'SHA-256' } as const;
const DEFAULT_MSG = 'Alice -> Bob: 5 монет';

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const short = (hex: string) => `${hex.slice(0, 20)}…${hex.slice(-8)}`;

/**
 * Живая цифровая подпись в браузере (WebCrypto, ECDSA P-256). Создай ключи,
 * подпиши сообщение, проверь — зелёная галочка. Измени сообщение после
 * подписи — проверка честно упадёт: подпись привязана к точному содержимому.
 * Цель тренажёра: увидеть и успешную, и проваленную проверку.
 * SSR-safe: весь WebCrypto — только в обработчиках кнопок.
 */
export default function SignDemo({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const inputId = useId();
  const [pubHex, setPubHex] = useState('');
  const [message, setMessage] = useState(DEFAULT_MSG);
  const [sigHex, setSigHex] = useState('');
  const [signedMsg, setSignedMsg] = useState('');
  const [verdict, setVerdict] = useState<'ok' | 'fail' | null>(null);
  const [done, setDone] = useState(false);
  const keysRef = useRef<CryptoKeyPair | null>(null);
  const sigRef = useRef<ArrayBuffer | null>(null);
  const seenRef = useRef({ ok: false, fail: false, rewarded: false });

  async function createKeys() {
    const keys = await crypto.subtle.generateKey(ALG, true, ['sign', 'verify']);
    keysRef.current = keys;
    setPubHex(toHex(await crypto.subtle.exportKey('raw', keys.publicKey)));
    sigRef.current = null;
    setSigHex('');
    setVerdict(null);
  }

  async function sign() {
    if (!keysRef.current) return;
    const sig = await crypto.subtle.sign(SIGN_ALG, keysRef.current.privateKey, new TextEncoder().encode(message));
    sigRef.current = sig;
    setSigHex(toHex(sig));
    setSignedMsg(message);
    setVerdict(null);
  }

  async function verify() {
    if (!keysRef.current || !sigRef.current) return;
    const ok = await crypto.subtle.verify(
      SIGN_ALG,
      keysRef.current.publicKey,
      sigRef.current,
      new TextEncoder().encode(message),
    );
    setVerdict(ok ? 'ok' : 'fail');
    const seen = seenRef.current;
    if (ok) seen.ok = true;
    else seen.fail = true;
    if (seen.ok && seen.fail && !seen.rewarded && chapterId && trainerId) {
      seen.rewarded = true;
      store.markTrainerDone(chapterId, trainerId, { ok: true, fail: true });
      store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
      setDone(true);
    }
  }

  return (
    <div className="sd">
      <div className="sd-actions">
        <button type="button" className="sd-btn" onClick={createKeys}>
          Создать ключи
        </button>
        <button type="button" className="sd-btn" onClick={sign} disabled={!pubHex}>
          Подписать
        </button>
        <button type="button" className="sd-btn" onClick={verify} disabled={!sigHex}>
          Проверить
        </button>
      </div>

      {pubHex ? (
        <div className="sd-field">
          <span className="sd-label">Открытый ключ (можно показывать всем)</span>
          <code className="sd-code">{short(pubHex)}</code>
        </div>
      ) : (
        <div className="sd-hint">Начни с кнопки «Создать ключи» — пара ключей сгенерируется прямо в твоём браузере.</div>
      )}

      <div className="sd-field">
        <label className="sd-label" htmlFor={inputId}>
          Сообщение
        </label>
        <input id={inputId} className="sd-input" value={message} onChange={(e) => { setMessage(e.target.value); setVerdict(null); }} />
      </div>

      {sigHex ? (
        <div className="sd-field">
          <span className="sd-label">Подпись (ECDSA P-256, закрытым ключом)</span>
          <code className="sd-code">{short(sigHex)}</code>
          {message !== signedMsg ? (
            <span className="sd-hint">Сообщение изменилось после подписания — нажми «Проверить» и посмотри, что будет.</span>
          ) : null}
        </div>
      ) : null}

      {verdict === 'ok' ? (
        <div className="sd-ok">✓ Подпись верна: сообщение в точности то, которое подписывали. Теперь измени в нём хоть один символ и проверь снова.</div>
      ) : null}
      {verdict === 'fail' ? (
        <div className="sd-fail">
          ✗ Проверка провалилась: подпись привязана к точному содержимому сообщения. Изменился хоть один
          символ — старая подпись для нового текста недействительна.
        </div>
      ) : null}

      {done ? <div className="hc-reward">Выполнено! +{XP} XP — ты увидел и подлинную подпись, и её провал после правки</div> : null}
    </div>
  );
}
