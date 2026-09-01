import React, { useState } from 'react';
import { tgShareUrl, vkShareUrl } from '../lib/integrations';
import './trainers.css';

// «Поделиться» результатом: Web Share API, а где его нет (десктопные
// браузеры) — копирование текста + прямые share-ссылки Telegram/VK.
// Ссылки рендерятся всегда: это обычные <a>, вреда от них нет, а ветвление
// по navigator при рендере ломало бы SSR-гидрацию.
export default function ShareResult({ text, url }: { text: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const link = () => url ?? window.location.href;

  const share = async () => {
    const payload = `${text}\n${link()}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text, url: link() });
        return;
      }
      await navigator.clipboard.writeText(payload);
      setCopied(true);
    } catch {
      // пользователь закрыл системный диалог или clipboard недоступен
    }
  };

  return (
    <div className="intg-share">
      <button type="button" className="button button--secondary" onClick={share}>
        Поделиться
      </button>
      <a
        className="intg-share-link"
        href={tgShareUrl(url ?? '', text)}
        onClick={(e) => {
          // href собран на рендере (при SSR url страницы неизвестен) —
          // на клике подставляем актуальную ссылку.
          e.currentTarget.href = tgShareUrl(link(), text);
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Telegram
      </a>
      <a
        className="intg-share-link"
        href={vkShareUrl(url ?? '', text)}
        onClick={(e) => {
          e.currentTarget.href = vkShareUrl(link(), text);
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        VK
      </a>
      {copied ? <span className="intg-note">Скопировано!</span> : null}
    </div>
  );
}
