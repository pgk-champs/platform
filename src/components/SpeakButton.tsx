import React, { useEffect, useState } from 'react';
import './trainers.css';

export type SpeakButtonProps = {
  /** Слово или фраза для озвучки. */
  text: string;
  /** Язык произношения, по умолчанию английский. */
  lang?: string;
  className?: string;
};

// Кнопка-динамик на Web Speech API. SSR-safe: поддержка определяется после
// маунта; без API кнопка просто не рендерится (graceful degradation).
export default function SpeakButton({ text, lang = 'en-US', className }: SpeakButtonProps) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    );
  }, []);

  if (!supported) return null;

  const speak = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      // нет голосов или API капризничает — молча пропускаем
    }
  };

  return (
    <button
      type="button"
      className={`sb-speak ${className ?? ''}`.trim()}
      onClick={speak}
      aria-label={`Произнести: ${text}`}
      title="Произнести"
    >
      🔊
    </button>
  );
}
