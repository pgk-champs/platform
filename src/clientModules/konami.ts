import { makeKonamiDetector } from '../lib/konami';
import { store } from '../lib/store';
import '../components/trainers.css';

// Пасхалка: конами-код (↑↑↓↓←→←→BA) на любой странице — 6-секундный дождь
// символов и достижение «Старая школа» (разблокирует AchievementsWatcher по
// флагу в store). Docusaurus подключает clientModules и в SSR-сборке, поэтому
// весь код под проверкой window/document.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const SYMBOLS = ['⬆️', '⬇️', '⬅️', '➡️', '🅰️', '🅱️', '🕹️', '👾', '🎉', '✨'];
  const RAIN_MS = 6000;
  const DROPS = 90;
  let raining = false;

  const rain = (): void => {
    if (raining || !document.body) return;
    raining = true;
    const box = document.createElement('div');
    box.className = 'konami-rain';
    box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < DROPS; i += 1) {
      const drop = document.createElement('span');
      drop.className = 'konami-drop';
      drop.textContent = SYMBOLS[i % SYMBOLS.length];
      drop.style.left = `${Math.random() * 100}%`;
      // Задержки 0–3с + падение 2–3с ≈ дождь идёт все 6 секунд.
      drop.style.animationDelay = `${Math.random() * 3}s`;
      drop.style.animationDuration = `${2 + Math.random()}s`;
      drop.style.fontSize = `${1 + Math.random() * 0.8}rem`;
      box.appendChild(drop);
    }
    document.body.appendChild(box);
    setTimeout(() => {
      box.remove();
      raining = false;
    }, RAIN_MS + 500);
  };

  const feed = makeKonamiDetector(() => {
    store.easter.markKonami();
    rain();
  });
  document.addEventListener('keydown', (e) => feed(e.key));
}

export {};
