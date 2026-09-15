import React, { useEffect } from 'react';
import AchievementsWatcher from '../components/AchievementsWatcher';
import { store } from '../lib/store';

// Non-swizzlable wrapper Docusaurus mounts around the whole app. Used to host
// the achievements toast watcher globally, and to stamp the chosen vessel skin
// on <html> so [data-skin] rules apply on every page.
export default function Root({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Тема читается только в браузере: при сборке localStorage нет, а атрибут
    // всё равно должен появиться до того, как пользователь увидит сосуды.
    const apply = () => {
      document.documentElement.dataset.skin = store.prefs.getSkin();
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
