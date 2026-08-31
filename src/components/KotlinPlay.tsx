import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    __kotlinPlayLoadPromise?: Promise<void>;
    KotlinPlayground?: (target: Element) => unknown;
  }
}

const KOTLIN_PLAYGROUND_SRC = 'https://unpkg.com/kotlin-playground@1';

// Loads the kotlin-playground script once per page (shared promise on
// window survives across SPA navigations), WITHOUT data-selector: that
// attribute only converts elements present when the script itself first
// loads, so a component mounted later (e.g. after client-side navigation)
// would never get initialized. Instead each mounted instance awaits this
// promise and then converts its own node explicitly.
function loadKotlinPlaygroundScript(): Promise<void> {
  if (!window.__kotlinPlayLoadPromise) {
    window.__kotlinPlayLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = KOTLIN_PLAYGROUND_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('kotlin-playground failed to load'));
      document.body.appendChild(script);
    });
  }
  return window.__kotlinPlayLoadPromise;
}

export default function KotlinPlay({ code }: { code: string }) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      loadKotlinPlaygroundScript()
        .then(() => {
          if (cancelled || !codeRef.current) return;
          try {
            window.KotlinPlayground?.(codeRef.current);
          } catch {
            // playground init failed; raw code block stays visible
          }
        })
        .catch(() => {
          // script failed to load; raw code block stays visible
        });
    } catch {
      // SSR or no DOM: skip loading
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <code ref={codeRef} className="kotlin-playground">
      {code}
    </code>
  );
}
