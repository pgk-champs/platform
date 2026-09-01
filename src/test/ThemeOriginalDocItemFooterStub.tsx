import React from 'react';

// Стаб @theme-original/DocItem/Footer: оригинал живёт в теме Docusaurus и
// недоступен vitest'у. Рендерим маркер, чтобы проверить, что обёртка его сохраняет.
export default function FooterStub() {
  return <div data-testid="theme-original-footer" />;
}
