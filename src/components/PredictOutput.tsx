import React, { useState } from 'react';
import { store } from '../lib/store';
import KotlinPlay from './KotlinPlay';
import './trainers.css';

const XP_FIRST_TRY = 10;
const REVEAL_AFTER = 3;

export type PredictOutputProps = {
  /** Ожидаемый вывод программы (сравнение после trim). */
  expected: string;
  /** Код, который надо «прокрутить в голове». Обязателен при kotlin: true. */
  code?: string;
  /** Произвольный рендер кода вместо code (например, готовая подсветка). */
  children?: React.ReactNode;
  /** Прощать лишние пробелы и переводы строк при сравнении. */
  normalizeWhitespace?: boolean;
  /** После ответа показать запускаемый KotlinPlay с этим же code. */
  kotlin?: boolean;
  /** Вместе включают запись прогресса и XP в store. */
  chapterId?: string;
  trainerId?: string;
};

// «Предскажи вывод»: сначала думаешь сам, потом проверяешь, потом запускаешь.
export default function PredictOutput({
  expected,
  code,
  children,
  normalizeWhitespace = false,
  kotlin = false,
  chapterId,
  trainerId,
}: PredictOutputProps) {
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'right' | 'revealed'>('idle');
  const [gotXp, setGotXp] = useState(false);

  const norm = (s: string) => (normalizeWhitespace ? s.trim().replace(/\s+/g, ' ') : s.trim());
  const resolved = status === 'right' || status === 'revealed';

  const check = () => {
    if (resolved) return;
    const n = attempts + 1;
    setAttempts(n);
    if (norm(answer) === norm(expected)) {
      setStatus('right');
      if (chapterId && trainerId) {
        const first = !store.getProgress().trainers[chapterId]?.[trainerId];
        store.markTrainerDone(chapterId, trainerId, { attempts: n });
        if (first && n === 1) {
          store.addXp(XP_FIRST_TRY, `predict:${chapterId}:${trainerId}`);
          setGotXp(true);
        }
      }
    } else {
      setStatus('wrong');
    }
  };

  return (
    <div className="po">
      {children ?? (code ? <pre className="po-code">{code}</pre> : null)}
      <p className="po-label">Что напечатает этот код? Сначала ответь, потом проверяй.</p>
      <textarea
        aria-label="Твой ответ"
        spellCheck={false}
        rows={2}
        value={answer}
        disabled={resolved}
        onChange={(e) => setAnswer(e.target.value)}
      />
      {!resolved ? (
        <div className="po-actions">
          <button type="button" className="po-btn" onClick={check} disabled={answer.trim() === ''}>
            Проверить
          </button>
          {status === 'wrong' && attempts >= REVEAL_AFTER ? (
            <button type="button" className="po-btn" onClick={() => setStatus('revealed')}>
              Показать ответ
            </button>
          ) : null}
        </div>
      ) : null}
      {status === 'right' ? (
        <p className="po-feedback po-right">
          {attempts === 1 ? `Верно — с первой попытки!${gotXp ? ' +10 XP' : ''}` : 'Верно!'}
        </p>
      ) : null}
      {status === 'wrong' ? (
        <p className="po-feedback po-wrong">
          Пока не так — сравни с тем, что реально напечатает код, и попробуй ещё раз.
        </p>
      ) : null}
      {status === 'revealed' ? (
        <div className="po-feedback">
          Правильный ответ:
          <pre className="po-code">{expected}</pre>
        </div>
      ) : null}
      {resolved && kotlin && code ? (
        <div className="po-run">
          <p className="po-label">А теперь запусти и убедись:</p>
          <KotlinPlay code={code} />
        </div>
      ) : null}
    </div>
  );
}
