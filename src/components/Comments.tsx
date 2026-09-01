import React, { useEffect, useRef, useState } from 'react';
import './trainers.css';

// Комментарии к главам через giscus (GitHub Discussions): вход гитхабом,
// своих серверов нет. Скрипт giscus.app вставляет iframe в контейнер;
// маппинг обсуждения — pathname страницы. Рендерится в футере каждой
// главы через обёртку src/theme/DocItem/Footer.
//
// Пока giscus-app не установлен на репо (клик владельца), виджет сам
// покажет подсказку об ошибке, а рядом видна наша заглушка ниже.
//
// Категория: сейчас Announcements (создана автоматически при включении
// Discussions). Когда владелец руками создаст категорию «Комментарии глав»
// (тип Announcements), заменить два поля ниже на её имя и id.
const GISCUS = {
  repo: 'pgk-champs/platform',
  repoId: 'R_kgDOUJ1h_w',
  category: 'Announcements',
  categoryId: 'DIC_kwDOUJ1h_84DEqqy',
};

export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.childElementCount > 0) return;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', GISCUS.repo);
    s.setAttribute('data-repo-id', GISCUS.repoId);
    s.setAttribute('data-category', GISCUS.category);
    s.setAttribute('data-category-id', GISCUS.categoryId);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    // ponytail: preferred_color_scheme не следит за ручным тумблером темы
    // в навбаре; если понадобится — useColorMode + postMessage в iframe.
    s.setAttribute('data-theme', 'preferred_color_scheme');
    s.setAttribute('data-lang', 'ru');
    el.appendChild(s);

    // Заглушку прячем, как только giscus подал признаки жизни.
    const onMsg = (e: MessageEvent) => {
      if (e.origin === 'https://giscus.app') setReady(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <section className="cm-comments">
      <h3 className="cm-title">Комментарии</h3>
      <div ref={ref} />
      {!ready && (
        <p className="cm-fallback">
          Комментарии появятся после настройки. Нужен аккаунт GitHub — вход
          прямо в виджете выше.
        </p>
      )}
    </section>
  );
}
