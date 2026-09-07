import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Библиотеки и хеши»: цена internal против external,
 * коллизия упакованной кодировки и взлом пина перебором. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solLibrariesSchemes: Schemes = {
  'sl-lib-cost': (aria) => (
    <Panel id="fig-sl-cost" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ СПОСОБА НАПИСАТЬ ОДНУ ФОРМУЛУ</text>

      {[
        { y: 66, t: 'формула прямо в теле функции', g: '27 282', b: '637 байт', w: 300, c: INK },
        { y: 128, t: 'internal-библиотека', g: '27 345', b: '666 байт', w: 302, c: ACCENT },
        { y: 190, t: 'external-библиотека', g: '31 403', b: '765 + 569 байт', w: 348, c: RED },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 20} fontSize={12} fill="#fff">{r.t}</text>
          <rect x={30} y={r.y + 30} width={r.w} height={22} rx={6}
            fill={r.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.c} strokeWidth={2} />
          <text x={r.w + 44} y={r.y + 47} fontSize={11.5} fontFamily={MONO} fill={r.c === INK ? FADE : r.c}>{r.g} газа</text>
          <text x={640} y={r.y + 20} fontSize={11.5} fontFamily={MONO} fill={FADE}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={264} fontSize={12.5} fill="#fff">internal встраивается в байткод — разница с формулой 63 газа; external живёт отдельным контрактом</text>
      <text x={30} y={286} fontSize={12.5} fill={RED_TEXT}>и стоит +4 121 газа на каждый вызов, потому что это переход в другой контракт</text>
    </Panel>
  ),

  'sl-hash-collision': (aria) => (
    <Panel id="fig-sl-hash" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ХЕШ ДЛЯ РАЗНЫХ АРГУМЕНТОВ</text>

      <rect x={30} y={66} width={370} height={140} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">abi.encodePacked</text>
      <text x={50} y={118} fontSize={11.5} fontFamily={MONO} fill={FADE}>("ab", "c") → 0x616263</text>
      <text x={50} y={140} fontSize={11.5} fontFamily={MONO} fill={FADE}>("a", "bc") → 0x616263</text>
      <text x={50} y={168} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>хеши равны: true</text>
      <text x={50} y={190} fontSize={11.5} fill={RED_TEXT}>байты склеены подряд, границ нет</text>

      <rect x={420} y={66} width={370} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fontFamily={MONO} fill="#fff">abi.encode</text>
      <text x={440} y={118} fontSize={11.5} fontFamily={MONO} fill={FADE}>("ab", "c") → 192 байта</text>
      <text x={440} y={140} fontSize={11.5} fontFamily={MONO} fill={FADE}>("a", "bc") → 192 байта</text>
      <text x={440} y={168} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>хеши равны: false</text>
      <text x={440} y={190} fontSize={11.5} fill={ACCENT}>длины и смещения различают аргументы</text>

      <text x={30} y={240} fontSize={12.5} fill="#fff">упакованная кодировка склеивает динамические аргументы так, что границу между ними уже не восстановить</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>правило: хешируете больше одного аргумента — берите abi.encode</text>
      <text x={30} y={288} fontSize={12.5} fill={FADE}>тот же хеш считается вне сети, на обычном ноутбуке — это чистая математика</text>
    </Panel>
  ),

  'sl-pin-crack': (aria) => (
    <Panel id="fig-sl-pin" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ХЕШ ПИНА В ХРАНИЛИЩЕ — НЕ ЗАЩИТА</text>

      <rect x={30} y={66} width={230} height={80} rx={11} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">контракт</text>
      <text x={50} y={116} fontSize={11} fontFamily={MONO} fill={FADE}>bytes32 private pinHash</text>
      <text x={50} y={136} fontSize={11} fill={FADE}>getter-а нет</text>

      <Arrow x1={266} y1={106} x2={316} y2={106} color={RED} w={2.5} />
      <text x={291} y={96} textAnchor="middle" fontSize={10} fill={RED_TEXT}>слот 0</text>

      <rect x={324} y={66} width={230} height={80} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={344} y={92} fontSize={12} fill="#fff">посторонний читает хранилище</text>
      <text x={344} y={118} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>0x4c681d1f…23be5cf</text>
      <text x={344} y={138} fontSize={11} fill={FADE}>без единой транзакции</text>

      <Arrow x1={560} y1={106} x2={610} y2={106} color={RED} w={2.5} />

      <rect x={618} y={66} width={172} height={80} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={638} y={92} fontSize={12} fill="#fff">перебор 000–999</text>
      <text x={638} y={118} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>пин 742 за 55 мс</text>
      <text x={638} y={138} fontSize={11} fill={FADE}>743 попытки</text>

      <text x={30} y={186} fontSize={12.5} fill="#fff">все 1000 вариантов перебираются за 70 мс; шесть цифр — примерно 70 секунд</text>
      <text x={30} y={212} fontSize={12.5} fill={RED_TEXT}>после этого чужой аккаунт открывает замок: opened = true</text>

      <rect x={30} y={230} width={760} height={44} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={257} textAnchor="middle" fontSize={11.5} fill={ACCENT}>слово private прячет данные от других контрактов, а не от людей: хранилище читается снаружи целиком</text>
    </Panel>
  ),
};
