import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «История Java, Android и Kotlin»: три эпохи на одной ленте,
 * путь исходника до процессора телефона, два языка в одном проекте и то,
 * куда Kotlin умеет компилироваться сегодня. */

export const kotlinHistorySchemes: Schemes = {
  /* тридцать лет платформы на одной ленте */
  'kh-timeline': (aria) => (
    <Panel id="fig-kh-time" w={820} h={340} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИДЦАТЬ ЛЕТ ОДНОЙ ПЛАТФОРМЫ</text>

      <path d="M40 210H790" stroke={INK} strokeWidth={2.5} />

      {[
        { x: 106, year: '1995', label: 'Java 1.0', note: 'Sun, «пиши раз — запускай везде»', up: true },
        { x: 228, year: '2008', label: 'Android 1.0', note: 'HTC Dream, язык — Java', up: false },
        { x: 350, year: '2011', label: 'Kotlin показан', note: 'JetBrains, проект с 2010-го', up: true },
        { x: 472, year: '2016', label: 'Kotlin 1.0', note: 'февраль, обещание совместимости', up: false },
        { x: 594, year: '2017', label: 'Google I/O', note: 'официальный язык Android', up: true },
        { x: 714, year: '2024', label: 'Kotlin 2.0', note: 'компилятор K2', up: false },
      ].map((e) => (
        <g key={e.year}>
          <circle cx={e.x} cy={210} r={8} fill={e.year === '2017' ? ACCENT : INK} />
          <path d={`M${e.x} ${e.up ? 202 : 218}v${e.up ? -28 : 28}`} stroke={e.year === '2017' ? ACCENT : INK} strokeWidth={2.5} />
          <text x={e.x} y={e.up ? 160 : 268} textAnchor="middle" fontSize={14} fontFamily={MONO} fontWeight={700} fill={e.year === '2017' ? ACCENT : '#fff'}>{e.year}</text>
          <text x={e.x} y={e.up ? 140 : 288} textAnchor="middle" fontSize={12.5} fill="#fff">{e.label}</text>
          <text x={e.x} y={e.up ? 120 : 308} textAnchor="middle" fontSize={10.5} fill={FADE}>{e.note}</text>
        </g>
      ))}

      <rect x={520} y={186} width={270} height={2} fill={ACCENT} />
      <text x={520} y={178} fontSize={11} fill={ACCENT}>2019: Kotlin-first, новые проекты только на нём</text>
    </Panel>
  ),

  /* путь исходника от файла до процессора телефона */
  'kh-jvm-stack': (aria) => (
    <Panel id="fig-kh-stack" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЧЕМУ KOTLIN ВООБЩЕ РАБОТАЕТ НА ANDROID</text>

      {[
        { x: 30, w: 150, t1: 'App.kt', t2: 'исходник', accent: true },
        { x: 30, w: 150, t1: 'App.java', t2: 'исходник', accent: false, y2: true },
      ].map((b) => (
        <g key={b.t1}>
          <rect x={b.x} y={b.y2 ? 154 : 78} width={b.w} height={56} rx={12} fill={b.accent ? SOFT : 'rgba(0,0,0,0.28)'} stroke={b.accent ? ACCENT : INK} strokeWidth={2.5} />
          <text x={b.x + b.w / 2} y={(b.y2 ? 154 : 78) + 26} textAnchor="middle" fontSize={14} fontFamily={MONO} fill={b.accent ? ACCENT : '#fff'}>{b.t1}</text>
          <text x={b.x + b.w / 2} y={(b.y2 ? 154 : 78) + 46} textAnchor="middle" fontSize={11} fill={FADE}>{b.t2}</text>
        </g>
      ))}

      <Arrow x1={182} y1={106} x2={228} y2={130} color={ACCENT} w={3} />
      <Arrow x1={182} y1={182} x2={228} y2={158} color={INK} w={3} />

      <rect x={232} y={114} width={172} height={60} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={318} y={140} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill="#fff">байт-код JVM</text>
      <text x={318} y={161} textAnchor="middle" fontSize={11} fill={FADE}>общий для обоих языков</text>

      <Arrow x1={406} y1={144} x2={452} y2={144} color={ACCENT} w={3} />

      <rect x={456} y={114} width={150} height={60} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={531} y={140} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill="#fff">D8 / R8</text>
      <text x={531} y={161} textAnchor="middle" fontSize={11} fill={FADE}>перевод в DEX</text>

      <Arrow x1={608} y1={144} x2={654} y2={144} color={ACCENT} w={3} />

      <rect x={658} y={114} width={132} height={60} rx={12} fill={ACCENT} />
      <text x={724} y={140} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#10243a">ART</text>
      <text x={724} y={161} textAnchor="middle" fontSize={11} fontWeight={600} fill="#10243a">на телефоне</text>

      <text x={30} y={244} fontSize={12.5} fill="#fff">оба языка сходятся в одной точке — в байт-коде</text>
      <text x={30} y={268} fontSize={12.5} fill={FADE}>поэтому Kotlin-класс виден из Java, а Java-библиотека — из Kotlin</text>
      <text x={30} y={300} fontSize={12.5} fill={ACCENT}>Dalvik работал до 2014 года, потом его заменил ART</text>
    </Panel>
  ),

  /* два языка в одном проекте, миграция по одному файлу */
  'kh-two-languages': (aria) => (
    <Panel id="fig-kh-mix" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ПРОЕКТ, ДВА ЯЗЫКА, НИКАКОГО ПЕРЕПИСЫВАНИЯ</text>

      <rect x={30} y={66} width={760} height={150} rx={14} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={92} fontSize={12} fill={FADE}>модуль приложения</text>

      {[
        { x: 66, name: 'MainActivity.kt', kt: true },
        { x: 246, name: 'Legacy.java', kt: false },
        { x: 426, name: 'Wallet.kt', kt: true },
        { x: 606, name: 'Utils.java', kt: false },
      ].map((f) => (
        <g key={f.name}>
          <rect x={f.x} y={108} width={162} height={54} rx={10} fill={f.kt ? SOFT : 'rgba(0,0,0,0.3)'} stroke={f.kt ? ACCENT : INK} strokeWidth={2.5} />
          <text x={f.x + 81} y={140} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={f.kt ? ACCENT : '#fff'}>{f.name}</text>
        </g>
      ))}

      <path d="M228 178h34" stroke={ACCENT} strokeWidth={3} />
      <path d="M408 178h34" stroke={ACCENT} strokeWidth={3} />
      <path d="M588 178h34" stroke={ACCENT} strokeWidth={3} />
      <text x={66} y={200} fontSize={11.5} fill={FADE}>вызывают друг друга напрямую, без обёрток и мостов</text>

      <text x={30} y={250} fontSize={12.5} fill="#fff">перевод проекта идёт по одному файлу за раз</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>в Android Studio есть встроенный конвертер Java → Kotlin</text>
    </Panel>
  ),

  /* куда Kotlin компилируется сегодня */
  'kh-kotlin-today': (aria) => (
    <Panel id="fig-kh-today" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ЯЗЫК — ЧЕТЫРЕ ЦЕЛИ КОМПИЛЯЦИИ</text>

      <rect x={330} y={66} width={160} height={50} rx={12} fill={ACCENT} />
      <text x={410} y={97} textAnchor="middle" fontSize={15} fontFamily={MONO} fontWeight={700} fill="#10243a">общий код</text>

      {[
        { x: 30, title: 'JVM', note: 'Android и серверы' },
        { x: 216, title: 'Native', note: 'iOS без виртуальной машины' },
        { x: 402, title: 'JS', note: 'браузер и Node' },
        { x: 588, title: 'Wasm', note: 'быстрый веб' },
      ].map((t) => (
        <g key={t.title}>
          <path d={`M410 116v28H${t.x + 101}v26`} stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={t.x} y={170} width={202} height={58} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
          <text x={t.x + 101} y={196} textAnchor="middle" fontSize={15} fontFamily={MONO} fill="#fff">{t.title}</text>
          <text x={t.x + 101} y={216} textAnchor="middle" fontSize={11} fill={FADE}>{t.note}</text>
        </g>
      ))}

      <text x={30} y={262} fontSize={12.5} fill="#fff">бизнес-логику пишут один раз, экраны — на каждой платформе свои</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>для мобилки главное — первая колонка: с неё начинается любой Android-проект</text>
    </Panel>
  ),
};
