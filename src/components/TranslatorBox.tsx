import React, { useState } from 'react';
import { translatorUrls } from '../lib/integrations';
import { store } from '../lib/store';
import './trainers.css';

const XP_FIRST_USE = 10;

export type TranslatorBoxProps = {
  /** Вместе включают запись прогресса и XP (как у остальных тренажёров). */
  chapterId?: string;
  trainerId?: string;
  /** Стартовая фраза в поле (глава может предзаполнить пример). */
  phrase?: string;
};

// Блок переводчиков: фраза → предзаполненная ссылка в DeepL/Google/Яндекс
// (window.open из клика) + памятка, как пользоваться переводчиком правильно.
export default function TranslatorBox({ chapterId, trainerId, phrase: initialPhrase }: TranslatorBoxProps) {
  const [phrase, setPhrase] = useState(initialPhrase ?? '');
  const trimmed = phrase.trim();

  const open = (service: 'deepl' | 'google' | 'yandex') => {
    if (!trimmed) return;
    window.open(translatorUrls(trimmed)[service], '_blank', 'noopener,noreferrer');
    if (chapterId && trainerId) {
      const first = !store.getProgress().trainers[chapterId]?.[trainerId];
      store.markTrainerDone(chapterId, trainerId, { service });
      if (first) store.addXp(XP_FIRST_USE, `translatorbox:${chapterId}:${trainerId}`);
    }
  };

  return (
    <div className="intg-translator">
      <input
        type="text"
        className="intg-translator-input"
        value={phrase}
        placeholder="Вставьте фразу или сообщение об ошибке…"
        onChange={(e) => setPhrase(e.target.value)}
        aria-label="Фраза для перевода"
      />
      <div className="intg-row">
        <button type="button" className="button button--secondary" disabled={!trimmed} onClick={() => open('deepl')}>
          DeepL
        </button>
        <button type="button" className="button button--secondary" disabled={!trimmed} onClick={() => open('google')}>
          Google
        </button>
        <button type="button" className="button button--secondary" disabled={!trimmed} onClick={() => open('yandex')}>
          Яндекс
        </button>
      </div>
      <div className="intg-translator-tips">
        <strong>Как пользоваться переводчиком правильно:</strong>
        <ul>
          <li>Переводи фразами, а не отдельными словами — у слова без контекста десяток значений.</li>
          <li>Проверяй обратным переводом: переведи результат назад и сравни смысл с оригиналом.</li>
          <li>Термины из словаря главы запоминай по-английски — в коде и ошибках они будут без перевода.</li>
        </ul>
      </div>
    </div>
  );
}
