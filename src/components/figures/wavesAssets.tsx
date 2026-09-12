import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Свои токены»: поля выпуска, знаки после запятой
 * и права эмитента. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const wavesAssetsSchemes: Schemes = {
  'was-issue-fields': (aria) => (
    <Panel id="fig-was-iss" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ЗАДАЮТ ПРИ ВЫПУСКЕ И ЧТО ПОТОМ УЖЕ НЕ ПОМЕНЯТЬ</text>

      {[
        { y: 66, k: 'name', v: 'PGKPoint', d: 'имя, 4–16 знаков', lock: true },
        { y: 102, k: 'decimals', v: '2', d: 'знаков после запятой, 0–8', lock: true },
        { y: 138, k: 'quantity', v: '100000', d: 'сколько выпущено, в «копейках»', lock: false },
        { y: 174, k: 'reissuable', v: 'true', d: 'можно ли допечатать позже', lock: false },
        { y: 210, k: 'description', v: 'Ball za praktiku', d: 'описание, до 1000 знаков', lock: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 16} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.k}</text>
          <text x={170} y={r.y + 16} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.v}</text>
          <text x={330} y={r.y + 16} fontSize={11.5} fill={FADE}>{r.d}</text>
          <text x={640} y={r.y + 16} fontSize={11} fill={r.lock ? RED_TEXT : ACCENT}>
            {r.lock ? 'навсегда' : 'меняется потом'}
          </text>
        </g>
      ))}

      <text x={30} y={258} fontSize={12.5} fill="#fff">выпуск стоит 1 WAVES — в тысячу раз дороже перевода: так сеть защищается от мусорных токенов</text>
      <text x={30} y={284} fontSize={12.5} fill={FADE}>идентификатор актива — это идентификатор той самой транзакции выпуска</text>
    </Panel>
  ),

  'was-decimals': (aria) => (
    <Panel id="fig-was-dec" w={820} h={270} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНО И ТО ЖЕ ЧИСЛО, РАЗНЫЙ СМЫСЛ</text>

      {[
        { y: 66, a: 'WAVES', d: '8 знаков', n: '100000', v: '0,001 WAVES' },
        { y: 122, a: 'PGKPoint', d: '2 знака', n: '100000', v: '1000,00 балла' },
        { y: 178, a: 'токен-счётчик', d: '0 знаков', n: '100000', v: '100000 штук' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={210} height={40} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 25} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.a}</text>
          <text x={258} y={r.y + 25} fontSize={11.5} fill={FADE}>{r.d}</text>
          <text x={392} y={r.y + 25} fontSize={12} fontFamily={MONO} fill="#fff">{r.n}</text>
          <Arrow x1={470} y1={r.y + 20} x2={520} y2={r.y + 20} color={ACCENT} w={2.2} />
          <rect x={534} y={r.y} width={256} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={662} y={r.y + 25} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>{r.v}</text>
        </g>
      ))}

      <text x={30} y={248} fontSize={12.5} fill="#fff">число знаков задают один раз при выпуске и не меняют никогда — ошиблись, выпускайте заново</text>
    </Panel>
  ),

  'was-rights': (aria) => (
    <Panel id="fig-was-rt" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КТО ЧТО МОЖЕТ ДЕЛАТЬ С ТОКЕНОМ</text>

      <rect x={30} y={64} width={370} height={150} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Выпустивший</text>
      <text x={50} y={120} fontSize={11.5} fill={ACCENT}>допечатать (пока reissuable)</text>
      <text x={50} y={146} fontSize={11.5} fill={ACCENT}>закрыть допечатку навсегда</text>
      <text x={50} y={172} fontSize={11.5} fill={ACCENT}>сжечь свои</text>
      <text x={50} y={198} fontSize={11.5} fill={FADE}>изменить описание</text>

      <rect x={420} y={64} width={370} height={150} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Любой держатель</text>
      <text x={440} y={120} fontSize={11.5} fill={ACCENT}>перевести свои</text>
      <text x={440} y={146} fontSize={11.5} fill={ACCENT}>сжечь свои — и уменьшить общее число</text>
      <text x={440} y={176} fontSize={11.5} fill={RED_TEXT}>допечатать — нельзя</text>
      <text x={440} y={200} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>Asset was issued by other address</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">сжечь может каждый — но только со своего счёта: отобрать чужие токены нельзя</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>общее количество после сжигания уменьшается: 100 000 стало 90 000</text>
    </Panel>
  ),
};
