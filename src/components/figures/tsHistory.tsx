import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «История JavaScript и TypeScript»: лента тридцати лет,
 * переломные версии стандарта, четыре среды запуска и путь кода через tsc. */

export const tsHistorySchemes: Schemes = {
  /* тридцать лет одной лентой */
  'th-timeline': (aria) => (
    <Panel id="fig-th-time" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИДЦАТЬ ЛЕТ ОДНОГО ЯЗЫКА</text>

      <path d="M40 180h740" stroke={INK} strokeWidth={3} strokeLinecap="round" />

      {[
        { x: 60, year: '1995', label: 'язык за 10 дней', up: true },
        { x: 200, year: '2008', label: 'движок V8', up: false },
        { x: 330, year: '2009', label: 'Node.js', up: true },
        { x: 460, year: '2012', label: 'TypeScript', up: false },
        { x: 590, year: '2015', label: 'ES6 — перелом', up: true },
        { x: 720, year: '2026', label: 'ежегодно', up: false },
      ].map((p) => (
        <g key={p.year}>
          <circle cx={p.x} cy={180} r={9} fill={p.year === '2015' || p.year === '2012' ? ACCENT : INK} />
          <path d={`M${p.x} ${p.up ? 171 : 189}v${p.up ? -34 : 34}`} stroke={FADE} strokeWidth={2.5} />
          <text x={p.x} y={p.up ? 128 : 240} textAnchor="middle" fontSize={15} fontFamily={MONO} fontWeight={700} fill={ACCENT}>{p.year}</text>
          <text x={p.x} y={p.up ? 108 : 260} textAnchor="middle" fontSize={12} fill="#fff">{p.label}</text>
        </g>
      ))}

      <text x={30} y={302} fontSize={12.5} fill="#fff">между 1999 и 2009 стандарт не менялся почти десять лет</text>
      <text x={30} y={324} fontSize={12.5} fill={FADE}>всё, что появилось до 2015, приходится тащить дальше ради совместимости</text>
    </Panel>
  ),

  /* переломные версии стандарта */
  'th-es-versions': (aria) => (
    <Panel id="fig-th-es" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВЕРСИИ СТАНДАРТА: ГДЕ ПРОХОДИТ ГРАНИЦА</text>

      {[
        { x: 30, name: 'ES3', year: '1999', got: 'основа языка', hot: false },
        { x: 226, name: 'ES4', year: 'не вышел', got: 'спор убил версию', hot: false },
        { x: 422, name: 'ES5', year: '2009', got: 'strict mode, JSON', hot: false },
        { x: 618, name: 'ES6', year: '2015', got: 'let, class, стрелки', hot: true },
      ].map((v) => (
        <g key={v.name}>
          <rect
            x={v.x}
            y={70}
            width={172}
            height={140}
            rx={14}
            fill={v.hot ? ACCENT : SOFT}
            stroke={v.hot ? 'none' : INK}
            strokeWidth={2.5}
          />
          <text x={v.x + 20} y={106} fontSize={20} fontFamily={MONO} fontWeight={700} fill={v.hot ? '#10243a' : '#fff'}>{v.name}</text>
          <text x={v.x + 20} y={132} fontSize={12.5} fill={v.hot ? '#10243a' : FADE}>{v.year}</text>
          <text x={v.x + 20} y={172} fontSize={12.5} fill={v.hot ? '#10243a' : '#fff'}>{v.got}</text>
        </g>
      ))}

      <path d="M598 70v140" stroke={ACCENT} strokeWidth={3} strokeDasharray="7 6" />
      <text x={608} y={236} fontSize={12} fontWeight={700} fill={ACCENT}>граница «старого» и «нового» кода</text>

      <text x={30} y={268} fontSize={12.5} fill="#fff">после 2015 версии выходят раз в год и называются по году: ES2016, ES2017, …</text>
      <text x={30} y={294} fontSize={12.5} fill={FADE}>учить «по версиям» не нужно — нужно знать, что до ES6 писали иначе</text>
      <text x={30} y={318} fontSize={12.5} fill={FADE}>именно поэтому в старых примерах из интернета сплошной var</text>
    </Panel>
  ),

  /* четыре среды запуска и общее ядро */
  'th-runtimes': (aria) => (
    <Panel id="fig-th-run" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ЯЗЫК — РАЗНЫЕ СРЕДЫ ЗАПУСКА</text>

      <rect x={250} y={62} width={320} height={56} rx={12} fill={ACCENT} />
      <text x={410} y={96} textAnchor="middle" fontSize={14} fontWeight={700} fill="#10243a">сам язык: синтаксис, типы, классы</text>

      {[
        { x: 30, name: 'браузер', api: 'document, fetch', year: '1995' },
        { x: 226, name: 'Node.js', api: 'fs, http, process', year: '2009' },
        { x: 422, name: 'Deno', api: 'права на файлы', year: '2020' },
        { x: 618, name: 'Bun', api: 'скорость, всё в одном', year: '2022' },
      ].map((r, i) => (
        <g key={r.name}>
          <path d={`M410 118v26H${r.x + 86}v22`} stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect
            x={r.x}
            y={166}
            width={172}
            height={112}
            rx={14}
            fill={i === 1 ? SOFT : 'rgba(0,0,0,0.28)'}
            stroke={i === 1 ? ACCENT : INK}
            strokeWidth={2.5}
          />
          <text x={r.x + 20} y={200} fontSize={15} fontWeight={700} fill={i === 1 ? ACCENT : '#fff'}>{r.name}</text>
          <text x={r.x + 20} y={224} fontSize={12} fill={FADE}>{r.year}</text>
          <text x={r.x + 20} y={252} fontSize={12} fill="#fff">{r.api}</text>
        </g>
      ))}

      <text x={30} y={312} fontSize={12.5} fill="#fff">разница не в языке, а в том, что среда даёт сверх него: файлы, сеть, окно браузера</text>
    </Panel>
  ),

  /* путь кода: ts → js → движок */
  'th-ts-pipeline': (aria) => (
    <Panel id="fig-th-pipe" w={820} h={320} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЧЕМУ TYPESCRIPT НИЧЕГО НЕ ПРОВЕРЯЕТ ВО ВРЕМЯ РАБОТЫ</text>

      {[
        { x: 30, top: 'app.ts', bottom: 'типы на месте', accent: true },
        { x: 236, top: 'tsc', bottom: 'проверил и стёр', accent: false },
        { x: 442, top: 'app.js', bottom: 'типов больше нет', accent: false },
        { x: 648, top: 'движок', bottom: 'выполняет', accent: false },
      ].map((s, i) => (
        <g key={s.top}>
          <rect
            x={s.x}
            y={92}
            width={142}
            height={110}
            rx={14}
            fill={s.accent ? ACCENT : SOFT}
            stroke={s.accent ? 'none' : INK}
            strokeWidth={2.5}
          />
          <text x={s.x + 71} y={136} textAnchor="middle" fontSize={16} fontFamily={MONO} fontWeight={700} fill={s.accent ? '#10243a' : '#fff'}>{s.top}</text>
          <text x={s.x + 71} y={166} textAnchor="middle" fontSize={12} fill={s.accent ? '#10243a' : FADE}>{s.bottom}</text>
          {i < 3 && <Arrow x1={s.x + 142} y1={147} x2={s.x + 200} y2={147} color={INK} w={3} />}
        </g>
      ))}

      <path d="M442 202v34h348v-34" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="6 6" fill="none" />
      <text x={616} y={258} textAnchor="middle" fontSize={12} fill={ACCENT}>сюда типы уже не доходят</text>

      <text x={30} y={294} fontSize={12.5} fill="#fff">ошибка типа ловится на шаге tsc или не ловится вообще — проверять чужие данные всё равно приходится руками</text>
    </Panel>
  ),
};
