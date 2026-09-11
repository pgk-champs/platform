import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «CSS»: модель коробки, приоритет правил и единицы измерения. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webCssSchemes: Schemes = {
  'wc-box-model': (aria) => (
    <Panel id="fig-wc-box" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА ЗАПИСЬ width:200px, ДВЕ РАЗНЫЕ ШИРИНЫ</text>

      <text x={30} y={68} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>box-sizing: content-box (по умолчанию)</text>
      <rect x={30} y={80} width={250} height={54} rx={6} fill="rgba(255,140,140,0.10)" stroke={RED} strokeWidth={2} />
      <rect x={35} y={85} width={240} height={44} rx={4} fill="rgba(255,140,140,0.14)" stroke={RED} strokeWidth={1} strokeDasharray="3 3" />
      <rect x={55} y={95} width={200} height={24} rx={3} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />
      <text x={155} y={111} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={ACCENT}>200px текст</text>
      <text x={292} y={112} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>видимая ширина 250px</text>
      <text x={292} y={130} fontSize={10.5} fill={FADE}>200 + отступы 20×2 + рамка 5×2</text>

      <text x={30} y={168} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>box-sizing: border-box</text>
      <rect x={30} y={180} width={200} height={54} rx={6} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <rect x={35} y={185} width={190} height={44} rx={4} fill="rgba(0,0,0,0.2)" stroke={ACCENT} strokeWidth={1} strokeDasharray="3 3" />
      <rect x={55} y={195} width={150} height={24} rx={3} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={1.6} />
      <text x={130} y={211} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill="#fff">150px текст</text>
      <text x={292} y={212} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>видимая ширина 200px</text>
      <text x={292} y={230} fontSize={10.5} fill={FADE}>отступы и рамка съели место у текста</text>

      <text x={30} y={270} fontSize={12.5} fill="#fff">по умолчанию 200 означает «текст 200, а всего сколько получится» — отсюда съехавшие колонки</text>
      <text x={30} y={294} fontSize={12.5} fill={ACCENT}>поэтому первой строкой оформления почти всегда пишут второй способ счёта для всего сразу</text>
    </Panel>
  ),

  'wc-specificity': (aria) => (
    <Panel id="fig-wc-spec" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КТО ПОБЕЖДАЕТ, КОГДА ПРАВИЛ НЕСКОЛЬКО</text>

      {[
        { y: 66, s: 'p { … }', v: 'rgb(1,1,1)', w: 90, d: 'один признак: тег' },
        { y: 110, s: 'p.c { … }', v: 'rgb(3,3,3)', w: 190, d: 'два признака — перевесил .c с одним' },
        { y: 154, s: '#i { … }', v: 'rgb(4,4,4)', w: 300, d: 'идентификатор весомее любых классов' },
        { y: 198, s: '… !important', v: 'rgb(9,9,9)', w: 420, d: 'сильнее даже записи прямо в теге' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 20} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.s}</text>
          <rect x={180} y={r.y + 4} width={r.w} height={22} rx={5} fill={SOFT} stroke={ACCENT} strokeWidth={1.5} />
          <text x={190 + r.w} y={r.y + 20} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.v}</text>
          <text x={30} y={r.y + 38} fontSize={10.5} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={256} fontSize={12.5} fill="#fff">при равном весе побеждает то правило, что записано ниже: порядок решает только ничью</text>
      <text x={30} y={280} fontSize={12.5} fill={RED_TEXT}>!important и идентификаторы ломают эту логику — потом их нечем перебить, кроме такого же</text>
    </Panel>
  ),

  'wc-units': (aria) => (
    <Panel id="fig-wc-unit" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТ ЧЕГО СЧИТАЮТСЯ ЕДИНИЦЫ</text>

      <text x={30} y={66} fontSize={11.5} fill={FADE}>родитель: размер шрифта 20px, ширина 400px · корень документа: 16px</text>

      {[
        { y: 84, n: '1.5rem', r: '24px', f: '1.5 × 16 — от корня документа', ok: true },
        { y: 130, n: '1.5em', r: '30px', f: '1.5 × 20 — от родителя, а он может быть любым', ok: false },
        { y: 176, n: '25%', r: '100px', f: '0.25 × 400 — от ширины родителя', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={120} height={34} rx={8} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 22} fontSize={12} fontFamily={MONO} fill="#fff">{r.n}</text>
          <Arrow x1={162} y1={r.y + 17} x2={210} y2={r.y + 17} color={ACCENT} w={1.8} />
          <rect x={222} y={r.y} width={94} height={34} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={269} y={r.y + 22} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>{r.r}</text>
          <text x={338} y={r.y + 22} fontSize={11} fill={r.ok ? FADE : RED_TEXT}>{r.f}</text>
        </g>
      ))}

      <text x={30} y={244} fontSize={12.5} fill="#fff">размеры шрифта берут в rem: он считается от одного места и не накапливается по вложенности</text>
      <text x={30} y={268} fontSize={12.5} fill={RED_TEXT}>em внутри em умножается: три уровня по 1.5 дают не 1.5, а 3.375 от исходного</text>
    </Panel>
  ),
};
