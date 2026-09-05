import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Слои»: направление зависимостей между слоями, репозиторий
 * как заменяемый шов и три модели одного товара по дороге от сервера к экрану. */

export const appLayersSchemes: Schemes = {
  'al-direction': (aria) => (
    <Panel id="fig-al-dir" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАВИСИМОСТИ СМОТРЯТ В ОДНУ СТОРОНУ</text>

      {[
        { x: 30, name: 'ui', what: 'экраны, ViewModel', sub: 'знает про domain' },
        { x: 288, name: 'domain', what: 'модели и правила', sub: 'не знает ни про кого' },
        { x: 546, name: 'data', what: 'сеть, база, кэш', sub: 'знает про domain' },
      ].map((l, i) => (
        <g key={l.name}>
          <rect x={l.x} y={70} width={244} height={96} rx={12}
            fill={i === 1 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 1 ? ACCENT : INK} strokeWidth={2.5} />
          <text x={l.x + 20} y={100} fontSize={13.5} fontFamily={MONO} fill={i === 1 ? ACCENT : '#fff'}>{l.name}</text>
          <text x={l.x + 20} y={124} fontSize={12} fill="#fff">{l.what}</text>
          <text x={l.x + 20} y={148} fontSize={11.5} fill={FADE}>{l.sub}</text>
        </g>
      ))}

      <Arrow x1={270} y1={118} x2={284} y2={118} color={ACCENT} w={3} />
      <Arrow x1={542} y1={118} x2={534} y2={118} color={ACCENT} w={3} />

      <text x={30} y={210} fontSize={12.5} fill="#fff">domain в середине и ни от кого не зависит: его можно читать, не открывая ни сеть, ни экраны</text>
      <text x={30} y={238} fontSize={12.5} fill={FADE}>если Composable импортировал Retrofit — стрелка пошла в обратную сторону, слои сломаны</text>
      <text x={30} y={274} fontSize={12.5} fill={ACCENT}>«Минимальное разделение на DOMAIN, PRESENTATION, DATA» — формулировка из задания</text>
    </Panel>
  ),

  'al-repository': (aria) => (
    <Panel id="fig-al-repo" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ЭКРАН, ДВА СПРИНТА</text>

      <rect x={30} y={64} width={220} height={64} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={140} y={92} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">ViewModel</text>
      <text x={140} y={114} textAnchor="middle" fontSize={11} fill={FADE}>не меняется</text>

      <Arrow x1={254} y1={96} x2={310} y2={96} color={ACCENT} w={3} />

      <rect x={316} y={64} width={240} height={64} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={436} y={92} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>ProductRepository</text>
      <text x={436} y={114} textAnchor="middle" fontSize={11} fill="#fff">интерфейс — шов</text>

      <Arrow x1={436} y1={134} x2={436} y2={172} color={FADE} w={3} />

      <rect x={200} y={180} width={220} height={58} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} strokeDasharray="6 4" />
      <text x={310} y={206} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">FakeRepository</text>
      <text x={310} y={226} textAnchor="middle" fontSize={11} fill={FADE}>спринт 1: зашитый список</text>

      <rect x={450} y={180} width={220} height={58} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={560} y={206} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>NetworkRepository</text>
      <text x={560} y={226} textAnchor="middle" fontSize={11} fill="#fff">спринт 2: настоящий сервер</text>

      <text x={30} y={276} fontSize={12.5} fill="#fff">«Экран Главная» и «Экран Главная (Network)» — это замена одной реализации</text>
      <text x={30} y={300} fontSize={12.5} fill={FADE}>если репозитория нет, второй спринт превращается в переписывание экрана</text>
    </Panel>
  ),

  'al-models': (aria) => (
    <Panel id="fig-al-models" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ МОДЕЛИ ОДНОГО ТОВАРА</text>

      {[
        { x: 30, t: 'ProductDto', s: 'product_name: String?', d: 'как прислал сервер', c: INK },
        { x: 288, t: 'Product', s: 'title: String', d: 'как думает приложение', c: ACCENT },
        { x: 546, t: 'ProductUi', s: 'price: "89.90 ₽"', d: 'как видит человек', c: INK },
      ].map((m) => (
        <g key={m.t}>
          <rect x={m.x} y={68} width={244} height={92} rx={12} fill={m.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={m.c} strokeWidth={2.5} />
          <text x={m.x + 20} y={98} fontSize={13} fontFamily={MONO} fill={m.c === ACCENT ? ACCENT : '#fff'}>{m.t}</text>
          <text x={m.x + 20} y={122} fontSize={11} fontFamily={MONO} fill={FADE}>{m.s}</text>
          <text x={m.x + 20} y={144} fontSize={11.5} fill="#fff">{m.d}</text>
        </g>
      ))}

      <Arrow x1={278} y1={112} x2={284} y2={112} color={ACCENT} w={3} />
      <Arrow x1={536} y1={112} x2={542} y2={112} color={ACCENT} w={3} />
      <text x={214} y={182} fontSize={11} fill={FADE}>toDomain()</text>
      <text x={472} y={182} fontSize={11} fill={FADE}>toUi()</text>

      <rect x={30} y={196} width={760} height={54} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={220} fontSize={12.5} fill="#fff">пустота с сервера разбирается в мапперe: null превращается в 0 и пустую строку</text>
      <text x={50} y={242} fontSize={12} fill={FADE}>дальше по коду поля уже не могут быть пустыми — проверять их больше негде и незачем</text>

      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>переименовали поле на сервере — правится один маппер, а не весь проект</text>
    </Panel>
  ),
};
