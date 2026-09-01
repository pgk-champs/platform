import React, { useEffect, useRef } from 'react';
import { store } from '../lib/store';

const DWELL_MS = 2000;

// Невидимый маркер прочитанности секции: ставится в конец секции контентом
// главы. Если он остаётся во вьюпорте 2+ секунды, секция засчитывается как
// прочитанная в store — читает ChapterProgress и статус-чипы маршрута.
// SSR-safe: рендерит только <span>, IntersectionObserver трогаем лишь в
// useEffect (клиент), любая ошибка окружения проглатывается try/catch.
export default function SectionAnchor({ chapterId, sectionId }: { chapterId: string; sectionId: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (store.isSectionRead(chapterId, sectionId)) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (timer === null) {
              timer = setTimeout(() => {
                try {
                  store.setSectionRead(chapterId, sectionId);
                } catch {
                  // ignore: private mode / quota / SSR
                }
              }, DWELL_MS);
            }
          } else if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }
        },
        { threshold: 0.5 },
      );
      observer.observe(el);
      return () => {
        if (timer !== null) clearTimeout(timer);
        observer.disconnect();
      };
    } catch {
      return undefined;
    }
  }, [chapterId, sectionId]);

  return <span ref={ref} className="section-anchor" aria-hidden="true" />;
}
