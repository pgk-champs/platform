import React from 'react';
import AchievementsWatcher from '../components/AchievementsWatcher';

// Non-swizzlable wrapper Docusaurus mounts around the whole app. Used only
// to host the achievements toast watcher globally, on every page.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AchievementsWatcher />
    </>
  );
}
