import React, { useEffect, useRef } from 'react';
import { store } from '../lib/store';

const DWELL_MS = 2000;

// Невидимый маркер прочитанности секции: ставится в КОНЕЦ секции контентом
// главы. Секция засчитывается двумя способами:
//   1) метка провисела на экране 2+ секунды (короткая секция целиком в окне);
//   2) метка ушла вверх за край экрана — значит секцию пролистали до конца.
// Только первого способа мало: пока ученик читает секцию, её конец ещё ниже
// экрана, а при обычной прокрутке метка пролетает мимо за доли секунды, и
// «Прочитано» так и остаётся на нуле.
// SSR-safe: рендерит только <span>, IntersectionObserver трогаем лишь в
// useEffect (клиент), любая ошибка окружения проглатывается try/catch.
export default function SectionAnchor({ chapterId, sectionId }: { chapterId: string; sectionId: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (store.isSectionRead(chapterId, sectionId)) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let firstDelivery = true;
    const markRead = () => {
      try {
        store.setSectionRead(chapterId, sectionId);
      } catch {
        // ignore: private mode / quota / SSR
      }
    };

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          const isFirst = firstDelivery;
          firstDelivery = false;

          if (entry.isIntersecting) {
            if (timer === null) timer = setTimeout(markRead, DWELL_MS);
            return;
          }

          if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }

          // Ушла ли метка ВВЕРХ за край экрана (а не вниз, куда ещё не дошли).
          // Самую первую доставку пропускаем: при заходе по ссылке в середину
          // главы все метки выше уже «за экраном», но их никто не читал.
          const rootTop = entry.rootBounds ? entry.rootBounds.top : 0;
          if (!isFirst && entry.boundingClientRect.bottom <= rootTop) markRead();
        },
        // threshold 0: метка высотой в один пиксель, доли процента здесь
        // считать не от чего — важен сам факт появления на экране.
        { threshold: 0 },
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
