import React from 'react';
import Link from '@docusaurus/Link';
import knowledgeMap from '../data/knowledge-map.json';
import tracks from '../data/tracks.json';
import { ACHIEVEMENTS } from '../lib/achievements';
import { plural } from '../lib/plural';
import ComposeLayers from './ComposeLayers';
import './trainers.css';

// Числа считаются из данных, а не вписываются руками: «22 главы с разбором»
// дожили на первом экране до 137 настоящих и никого не смутили.
type MapEntry = { track: string; totals?: { trainers?: number } };
const CHAPTERS = (knowledgeMap as MapEntry[]).length;
const TRAINERS = (knowledgeMap as MapEntry[]).reduce((sum, e) => sum + (e.totals?.trainers ?? 0), 0);

// Сколько глав в каждом треке — отсюда вес карточки на главной. Руками эти
// числа не пишут: мобилка выросла с 12 до 46 за две недели.
const BY_TRACK: Record<string, number> = {};
for (const e of knowledgeMap as MapEntry[]) BY_TRACK[e.track] = (BY_TRACK[e.track] ?? 0) + 1;

const STATS = [
  { num: String(CHAPTERS), label: `${plural(CHAPTERS, 'глава', 'главы', 'глав')} с разбором` },
  { num: String(TRAINERS), label: plural(TRAINERS, 'тренажёр', 'тренажёра', 'тренажёров') },
  { num: String(ACHIEVEMENTS.length), label: plural(ACHIEVEMENTS.length, 'достижение', 'достижения', 'достижений') },
];

// Треки — из того же единственного списка, что меню и подвал. Порядок здесь
// по объёму, а не по position: карточки разного веса, и ставить узкий трек из
// девяти глав перед семидесятью двумя было бы враньём про размер.
const TRACKS = [...(tracks as { dir: string; label: string; position: number; blurb: string }[])]
  .map((t) => ({ ...t, n: BY_TRACK[t.dir] ?? 0 }))
  .sort((a, b) => b.n - a.n || a.position - b.position)
  .map((t) => ({
    to: `/docs/${t.dir}`,
    dir: t.dir,
    title: t.label,
    desc: t.blurb,
    n: t.n,
    big: t.n >= 20,
  }));

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
            <p className="hh-kicker pgk-reveal" style={{ ['--i' as string]: 0 }}>
              Учебная платформа ПГК · подготовка к чемпионату
            </p>
            <h1 className="hh-title pgk-reveal" style={{ ['--i' as string]: 1 }}>
              От нуля до чемпиона
            </h1>
            <p className="hh-subtitle pgk-reveal" style={{ ['--i' as string]: 2 }}>
              Мобилка и блокчейн: интерактивные главы, тренажёры и симулятор чемпионата.
            </p>
            <div className="hh-actions pgk-reveal" style={{ ['--i' as string]: 3 }}>
              <Link className="button button--primary" to="/route">
                Начать маршрут
              </Link>
              <Link className="button button--secondary" to="/playground">
                Попробовать сразу
              </Link>
            </div>
            <p className="hh-note pgk-reveal" style={{ ['--i' as string]: 4 }}>
              Первый тренажёр открывается сразу, регистрация не нужна.
            </p>
            <dl className="hh-nums pgk-reveal" style={{ ['--i' as string]: 5 }}>
              {STATS.map((s) => (
                <div key={s.label} className="hh-num">
                  <dt>
                    <b>{s.num}</b>
                  </dt>
                  <dd className="hh-num-label">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hh-art pgk-reveal" style={{ ['--i' as string]: 3 }}>
            <HeroScene />
          </div>
        </div>
      </section>
      {/* Разбор экрана Compose — отдельной секцией, а НЕ вместо сцены первого
          экрана, как предлагал план переоформления. Причина продуктовая:
          сцена в первом экране показывает всю платформу (клавиатура, коммиты,
          телефон, блоки), а разбор Compose — только мобилку. В блокчейне 72
          главы против 46 в мобилке, и первый экран, говорящий только про
          Compose, отсекает больший трек. Здесь разбору есть место и он никого
          не отсекает. Вернуть в первый экран — перенести <ComposeLayers /> в
          .hh-art вместо <HeroScene />. */}
      <section className="hh-explain" aria-label="Как устроен экран Compose">
        <div className="hh-explain-copy">
          <h2 className="hh-explain-title">Экран — это не картинка</h2>
          <p className="hh-explain-text">
            В Compose экран собирается из вложенных функций. Разложите стопку взглядом: снизу
            собранный результат, выше — каркасы, и чем глубже узел в дереве, тем ближе его
            плоскость. Шапка и список лежат на одной глубине — они братья, а не один внутри
            другого.
          </p>
        </div>
        <ComposeLayers />
      </section>
      <section className="hh-tracks" aria-label="Треки обучения">
        <h2 className="hh-tracks-title">Выберите свой трек обучения</h2>
        <div className="hh-tracks-grid">
          {TRACKS.map((t) => (
            <Link
              key={t.to}
              className={`hh-track trk-${t.dir}${t.big ? ' hh-track--big' : ''}`}
              to={t.to}
            >
              <span className="hh-track-head">
                <span className="hh-track-title">{t.title}</span>
                <span className="hh-track-n">
                  {t.n} {plural(t.n, 'глава', 'главы', 'глав')}
                </span>
              </span>
              <span className="hh-track-desc">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
