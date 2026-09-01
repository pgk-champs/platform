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

export default function HomeHero() {
  return (
    <div className="hh">
      <section className="hh-hero">
        <h1 className="hh-title">От нуля до чемпиона</h1>
        <p className="hh-subtitle">
          Мобильная разработка и блокчейн: интерактивные главы, тренажёры
          и симулятор чемпионата — от первой команды в терминале до пьедестала.
        </p>
        <div className="hh-actions">
          <Link className="button button--primary button--lg" to="/route">
            Маршрут
          </Link>
          <Link className="button button--secondary button--lg" to="/playground">
            Песочница
          </Link>
          <Link className="button button--secondary button--lg" to="/simulator">
            Симулятор
          </Link>
        </div>
        <p className="hh-stats">17 глав · 40+ тренажёров · 40 достижений</p>
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
