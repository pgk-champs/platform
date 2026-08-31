import '../components/trainers.css';

// Тонкая полоса прогресса скролла вверху страницы. Docusaurus подключает
// clientModules и в SSR-сборке, и в браузерном бандле — поэтому весь код
// обёрнут в проверку document/window, иначе сборка упадёт на Node.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const BAR_ID = 'reading-progress-bar';

  const update = (): void => {
    if (!document.body) return;
    let bar = document.getElementById(BAR_ID);
    if (!bar) {
      bar = document.createElement('div');
      bar.id = BAR_ID;
      document.body.prepend(bar);
    }
    const el = document.documentElement;
    const scrollable = el.scrollHeight - el.clientHeight;
    const pct = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0;
    bar.style.width = `${pct}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  // ponytail: после SPA-перехода на другую страницу Docusaurus полоса
  // обновится только при следующем scroll/resize (браузер и так сбрасывает
  // скролл при переходе, событие приходит само); если понадобится точный
  // сброс к 0 в момент навигации — подписаться на history 'popstate' и
  // дергать update() из клиентского роутера.
  update();
}

export {};
