import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { store } from '../lib/store';
import './trainers.css';

const TOUR_ID = 'chapter-basics';

// Смонтирован из ChapterProgress (есть на каждой главе): спотлайт-тур по
// прогрессу/блокам/звёздочке избранного при первом визите на любую главу —
// один раз на весь сайт, дальше store.tour запоминает, что тур уже видели.
// Ничего не рендерит сам — вся работа в эффекте, только на клиенте.
export default function ChapterTour(): null {
  useEffect(() => {
    if (store.tour.isSeen(TOUR_ID)) return;
    if (!document.querySelector('.cp')) return; // подстраховка: до прогресс-бара эффект не добежал

    const steps: DriveStep[] = [
      {
        element: '.cp',
        popover: {
          title: 'Прогресс главы',
          description: 'Здесь видно, сколько ты уже прочитал и сколько квизов и тренажёров прошёл — обновляется само, по мере чтения.',
        },
      },
      {
        element: '.block',
        popover: {
          title: 'Блоки',
          description: 'Тренажёр, квиз, разбор по составу, словарь — у каждого своя карточка со значком и бейджем. Стрелка слева сворачивает блок.',
        },
      },
      {
        element: '.block-fav',
        popover: {
          title: 'Избранное',
          description: 'Звёздочка сохраняет блок (или слово) в «Избранное» — вернёшься к нему одним кликом с любой страницы.',
        },
      },
    ];

    const tour = driver({
      animate: false, // мгновенный спотлайт без анимации перехода
      showProgress: true,
      progressText: '{{current}} из {{total}}',
      nextBtnText: 'Дальше',
      prevBtnText: 'Назад',
      doneBtnText: 'Понятно',
      skipMissingElement: true,
      waitForElement: 0,
      steps,
      // onDestroyed — единственный хук, который срабатывает при любом способе
      // закрытия (крестик, Escape, клик снаружи, «Понятно» на последнем шаге).
      onDestroyed: () => store.tour.markSeen(TOUR_ID),
    });
    tour.drive();

    return () => tour.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
