import React from 'react';
import Link from '@docusaurus/Link';
import './trainers.css';

const TRACKS = [
  {
    to: '/docs/foundation',
    title: 'Фундамент',
    desc: 'Базовые знания для любого разработчика',
  },
  {
    to: '/docs/mobile',
    title: 'Мобилка',
    desc: 'Разработка мобильных приложений на Kotlin и Android',
  },
  {
    to: '/docs/blockchain',
    title: 'Блокчейн',
    desc: 'Создание децентрализованных приложений и смарт-контрактов',
  },
];

const ACCENT = 'var(--ifm-color-primary-lightest)';
const DARK = 'var(--ifm-color-primary-darkest)';
const INK = 'rgba(255,255,255,0.9)';
const SOFT = 'rgba(255,255,255,0.14)';
const FADE = 'rgba(255,255,255,0.45)';
const MONO = 'var(--ifm-font-family-monospace)';

/* Собирательная сцена в стиле обложек ChapterCover:
 * цепь блоков + ветка коммитов + телефон + клавиатура.
 * Слои hh-art-l1..l3 плавают с разной скоростью (CSS-параллакс). */
function HeroScene() {
  return (
    <svg viewBox="0 0 560 480" role="img" aria-label="Клавиатура, ветка коммитов, экран приложения и цепочка блоков — из чего состоит путь чемпиона">
      <defs>
        <linearGradient id="hh-scene-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--ifm-color-primary-dark)" />
          <stop offset="1" stopColor="var(--ifm-color-primary-darkest)" />
        </linearGradient>
      </defs>
      <rect width="560" height="480" rx="24" fill="url(#hh-scene-g)" />
      <circle cx="430" cy="70" r="190" fill="rgba(255,255,255,0.05)" />
      <rect x="-40" y="420" width="680" height="140" fill="rgba(0,0,0,0.18)" transform="rotate(-6 280 470)" />
      {/* слой 1 (медленный): цепь блоков */}
      <g className="hh-art-l1">
        <g strokeLinecap="round">
          <rect x="40" y="56" width="62" height="52" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
          <rect x="122" y="56" width="62" height="52" rx="10" fill={ACCENT} />
          <rect x="204" y="56" width="62" height="52" rx="10" fill={SOFT} stroke={INK} strokeWidth={3} />
          <path d="M102 82h20M184 82h20" stroke={INK} strokeWidth={6} />
          <text x="153" y="92" textAnchor="middle" fontSize="26" fontWeight={800} fill={DARK} fontFamily={MONO}>#</text>
        </g>
      </g>
      {/* слой 2 (средний): телефон с экраном Compose */}
      <g className="hh-art-l2">
        <rect x="330" y="120" width="150" height="262" rx="24" fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={3} />
        <rect x="350" y="150" width="110" height="36" rx="8" fill={ACCENT} />
        <rect x="350" y="196" width="110" height="58" rx="8" fill={SOFT} />
        <rect x="350" y="264" width="110" height="16" rx="8" fill="rgba(255,255,255,0.3)" />
        <rect x="350" y="290" width="76" height="16" rx="8" fill="rgba(255,255,255,0.3)" />
        <circle cx="442" cy="350" r="15" fill={ACCENT} />
      </g>
      {/* слой 1: клавиатура внизу слева */}
      <g className="hh-art-l1">
        <g transform="rotate(-4 150 390)" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round">
          <rect x="28" y="336" width="248" height="106" rx="16" fill={SOFT} />
          <path d="M50 364h204" strokeWidth={14} strokeDasharray="14 9" stroke={FADE} />
          <path d="M50 391h204" strokeWidth={14} strokeDasharray="14 9" stroke={FADE} />
          <rect x="92" y="410" width="104" height="15" rx="6" fill={FADE} stroke="none" />
          <rect x="212" y="410" width="26" height="15" rx="6" fill={ACCENT} stroke="none" />
        </g>
      </g>
      {/* слой 3 (быстрый): ветка коммитов поверх */}
      <g className="hh-art-l3">
        <g fill="none" strokeLinecap="round">
          <path d="M46 250h150" stroke={FADE} strokeWidth={5} />
          <path d="M126 250c34 0 24-58 56-58h64" stroke={ACCENT} strokeWidth={5} />
          <circle cx="70" cy="250" r="10" stroke={INK} strokeWidth={5} />
          <circle cx="126" cy="250" r="10" stroke={INK} strokeWidth={5} />
          <circle cx="196" cy="192" r="10" stroke={ACCENT} strokeWidth={5} />
          <circle cx="250" cy="192" r="11" fill={ACCENT} />
        </g>
        <circle cx="304" cy="86" r="6" fill={ACCENT} opacity={0.7} />
        <circle cx="508" cy="100" r="8" fill={ACCENT} opacity={0.5} />
        <circle cx="514" cy="300" r="6" fill={ACCENT} opacity={0.6} />
      </g>
    </svg>
  );
}

export default function HomeHero() {
  return (
    <div className="hh">
      <section className="hh-hero hh-hero--v2">
        <div className="hh-hero-inner">
          <div className="hh-hero-copy">
            <h1 className="hh-title">От нуля до чемпиона</h1>
            <p className="hh-subtitle">
              Мобилка и блокчейн: интерактивные главы, тренажёры и симулятор чемпионата.
            </p>
            <div className="hh-actions">
              <Link className="button button--primary" to="/route">
                Маршрут
              </Link>
              <Link className="button button--secondary" to="/playground">
                Песочница
              </Link>
              <Link className="button button--secondary" to="/simulator">
                Симулятор
              </Link>
            </div>
            <p className="hh-stats">17 глав · 40+ тренажёров · 40 достижений</p>
          </div>
          <div className="hh-art">
            <HeroScene />
          </div>
        </div>
      </section>
      <section className="hh-tracks" aria-label="Треки обучения">
        <h2 className="hh-tracks-title">Выберите свой трек обучения</h2>
        <div className="hh-tracks-grid">
          {TRACKS.map((t) => (
            <Link key={t.to} className="hh-track" to={t.to}>
              <span className="hh-track-title">{t.title}</span>
              <span className="hh-track-desc">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
