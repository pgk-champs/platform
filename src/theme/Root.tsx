import React, { useEffect } from 'react';
import AchievementsWatcher from '../components/AchievementsWatcher';
import { store } from '../lib/store';
import { effectiveLook } from '../lib/looks';

// Non-swizzlable wrapper Docusaurus mounts around the whole app. Used to host
// the achievements toast watcher globally, and to stamp the chosen vessel skin
// on <html> so [data-skin] rules apply on every page.
export default function Root({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Тема читается только в браузере: при сборке localStorage нет, а атрибут
    // всё равно должен появиться до того, как пользователь увидит сосуды.
    const apply = () => {
      // Выбранный облик применяется, только если он ОТКРЫТ: факт открытия
      // нигде не хранится, он выводится из выданных достижений. Чужая
      // вкладка, ручная правка localStorage или сброс достижений — и облик
      // молча откатывается к обычному, а не остаётся «купленным навсегда».
      const html = document.documentElement;
      html.dataset.skin = effectiveLook(store.prefs.getSkin(), store.achievements.list());
      // Настройки чтения тем же штампом. Кегль вдобавок ставится ДО отрисовки
      // маленьким скриптом из headTags (docusaurus.config.ts): иначе каждая
      // загрузка начиналась бы с перекладки всей страницы.
      html.dataset.motion = store.prefs.getMotion();
      html.dataset.read = store.prefs.getRead();
    };
    apply();
    return store.subscribe(apply);
  }, []);

  return (
    <>
      {children}
      <AchievementsWatcher />
    </>
  );
}
