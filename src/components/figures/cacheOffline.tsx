import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Кэш»: две стратегии и цена ожидания, база как источник
 * истины между сетью и экраном, три разных пустых экрана. */

export const cacheOfflineSchemes: Schemes = {
  'co-strategies': (aria) => (
    <Panel id="fig-co-strat" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СКОЛЬКО ПОЛЬЗОВАТЕЛЬ СМОТРИТ НА ПУСТОЙ ЭКРАН</text>

      <text x={30} y={74} fontSize={12.5} fill="#fff">сначала сеть</text>
      <rect x={30} y={86} width={760} height={56} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <rect x={42} y={98} width={600} height={32} rx={8} fill="rgba(255,140,140,0.3)" stroke="rgba(255,140,140,0.85)" strokeWidth={2} />
      <text x={342} y={119} textAnchor="middle" fontSize={12} fill="#fff">крутилка · 906 мс</text>
      <rect x={650} y={98} width={128} height={32} rx={8} fill={INK} />
      <text x={714} y={119} textAnchor="middle" fontSize={11.5} fill="#fff">список</text>

      <text x={30} y={178} fontSize={12.5} fill={ACCENT}>сначала кэш</text>
      <rect x={30} y={190} width={760} height={56} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <rect x={42} y={202} width={20} height={32} rx={6} fill={ACCENT} />
      <rect x={66} y={202} width={576} height={32} rx={8} fill="rgba(255,255,255,0.1)" stroke={ACCENT} strokeWidth={1.5} />
      <text x={354} y={223} textAnchor="middle" fontSize={12} fill={ACCENT}>список уже на экране · данные от 12:40</text>
      <rect x={650} y={202} width={128} height={32} rx={8} fill={ACCENT} />
      <text x={714} y={223} textAnchor="middle" fontSize={11.5} fill="#fff">обновлён</text>

      <text x={30} y={278} fontSize={12.5} fill="#fff">4 мс до первого содержимого вместо 906 — и в авиарежиме экран не пустеет</text>
      <text x={30} y={302} fontSize={12.5} fill={FADE}>но при пустом кэше обе стратегии одинаково беспомощны: показывать нечего</text>
    </Panel>
  ),

  'co-source-of-truth': (aria) => (
    <Panel id="fig-co-truth" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>БАЗА В СЕРЕДИНЕ, А НЕ СБОКУ</text>

      <rect x={30} y={72} width={200} height={72} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={130} y={104} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">Сеть</text>
      <text x={130} y={126} textAnchor="middle" fontSize={11} fill={FADE}>только пишет в базу</text>

      <Arrow x1={236} y1={108} x2={296} y2={108} color={INK} w={3} />
      <text x={266} y={98} textAnchor="middle" fontSize={10.5} fill={FADE}>refresh</text>

      <rect x={306} y={72} width={200} height={72} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={406} y={104} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>База</text>
      <text x={406} y={126} textAnchor="middle" fontSize={11} fill="#fff">источник истины</text>

      <Arrow x1={512} y1={108} x2={572} y2={108} color={ACCENT} w={3} />
      <text x={542} y={98} textAnchor="middle" fontSize={10.5} fill={ACCENT}>Flow</text>

      <rect x={582} y={72} width={208} height={72} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={686} y={104} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">Экран</text>
      <text x={686} y={126} textAnchor="middle" fontSize={11} fill={FADE}>подписан на базу</text>

      <rect x={30} y={172} width={760} height={48} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={202} fontSize={12.5} fill="#fff">refresh() ничего не возвращает — и это правильно: экран узнаёт об обновлении от базы</text>

      <text x={30} y={250} fontSize={12.5} fill={ACCENT}>данные, записанные в любом месте приложения, доходят до экрана сами</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>если экран подписан на ответ сети, второй экран о правках не узнает</text>
    </Panel>
  ),

  'co-three-empties': (aria) => (
    <Panel id="fig-co-empty" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СПИСОК ПУСТ — НО ПРИЧИНЫ РАЗНЫЕ</text>

      {[
        { x: 30, t: 'обновление идёт', s: '[крутилка]', d: 'кэш пуст, запрос в пути', c: INK },
        { x: 288, t: 'сервер вернул «[]»', s: '[пусто]', d: 'ничего не найдено', c: ACCENT },
        { x: 546, t: 'сети не было', s: '[ошибка]', d: 'нет соединения · повторить', c: INK },
      ].map((e) => (
        <g key={e.t}>
          <rect x={e.x} y={70} width={244} height={112} rx={12}
            fill={e.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={e.c} strokeWidth={2.5} />
          <text x={e.x + 122} y={100} textAnchor="middle" fontSize={12} fill="#fff">{e.t}</text>
          <text x={e.x + 122} y={128} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={e.c === ACCENT ? ACCENT : '#fff'}>{e.s}</text>
          <text x={e.x + 122} y={156} textAnchor="middle" fontSize={11} fill={FADE}>{e.d}</text>
        </g>
      ))}

      <rect x={30} y={202} width={760} height={44} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={230} fontSize={12.5} fontFamily={MONO} fill="#fff">rows.isEmpty() во всех трёх случаях: true</text>

      <text x={30} y={278} fontSize={12.5} fill={ACCENT}>по одной пустоте состояние не определить — нужны флаг загрузки и признак ошибки</text>
    </Panel>
  ),
};
