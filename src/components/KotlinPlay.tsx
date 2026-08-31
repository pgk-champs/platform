import React, { useEffect } from 'react';

declare global {
  interface Window {
    __kotlinPlayLoaded?: boolean;
  }
}

export default function KotlinPlay({ code }: { code: string }) {
  useEffect(() => {
    try {
      if (window.__kotlinPlayLoaded || document.querySelector('script[src*="kotlin-playground"]')) {
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/kotlin-playground@1';
      script.setAttribute('data-selector', 'code.kotlin-playground');
      document.body.appendChild(script);
      window.__kotlinPlayLoaded = true;
    } catch {
      // SSR or no DOM: skip loading
    }
  }, []);

  return <code className="kotlin-playground">{code}</code>;
}
