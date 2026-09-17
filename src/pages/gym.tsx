import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import GymCatalog from '../components/GymCatalog';
import GymBuilder from '../components/GymBuilder';
import { buildPool } from '../components/WordsTrainer';
import { plural } from '../lib/plural';
import '../components/trainers.css';

// Верхний ярус — самостоятельные площадки, а не механики глав. Ниже каталог
// всех механик, ещё ниже конструктор: баннер «Вам передали набор» из ссылки
// #preset=… должен быть виден сразу, поэтому конструктор остаётся на странице,
// а не уезжает отдельным адресом.

function WordsBlurb() {
  // Тот же buildPool, что показывает /words: две разные цифры про одно и то же
  // хуже, чем ни одной. Он уже экспортирован из WordsTrainer, копия не нужна.
  const n = buildPool().length;
  return (
    <>
      {n > 0
        ? `${n} ${plural(n, 'слово', 'слова', 'слов')} к повторению`
        : 'Словарь наберётся, когда пройдёшь первую главу'}
    </>
  );
}

export default function Gym(): React.ReactElement {
  return (
    <Layout title="Зал" description="Все тренажёры платформы в одном месте">
      <main className="container margin-vert--lg">
        <h1>Зал</h1>

        <div className="gc-venues">
          <Link className="gc-venue" to="/playground">
            <span className="gc-venue-name">Песочница</span>
            <span className="gc-venue-blurb">Пиши и запускай Kotlin прямо в браузере</span>
          </Link>
          <Link className="gc-venue" to="/words">
            <span className="gc-venue-name">Слова</span>
            <span className="gc-venue-blurb">
              <BrowserOnly fallback={<>Английский по карточкам</>}>
                {() => <WordsBlurb />}
              </BrowserOnly>
            </span>
          </Link>
          <a className="gc-venue" href="#builder">
            <span className="gc-venue-name">Конструктор</span>
            <span className="gc-venue-blurb">Собери свой набор и поделись ссылкой</span>
          </a>
        </div>

        <GymCatalog />

        <h2 id="builder">Конструктор тренажёров</h2>
        <GymBuilder />
      </main>
    </Layout>
  );
}
