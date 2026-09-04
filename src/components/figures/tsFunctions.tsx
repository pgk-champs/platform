import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Функции»: вызов и возврат, три формы записи, замыкание
 * и чтение сигнатуры по двоеточиям. */

export const tsFunctionsSchemes: Schemes = {
  /* аргументы внутрь, одно значение обратно */
  'tfn-call-return': (aria) => (
    <Panel id="fig-tfn-call" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВЫЗОВ И ВОЗВРАТ</text>

      <rect x={30} y={70} width={280} height={210} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={100} fontSize={13.5} fontWeight={700} fill="#fff">место вызова</text>
      <text x={52} y={132} fontSize={13} fontFamily={MONO} fill="#fff">const fee =</text>
      <text x={52} y={156} fontSize={13} fontFamily={MONO} fill={ACCENT}>  calcFee(1000, 3)</text>
      <text x={52} y={196} fontSize={12.5} fill={FADE}>пока функция работает,</text>
      <text x={52} y={216} fontSize={12.5} fill={FADE}>эта строка ждёт</text>
      <text x={52} y={252} fontSize={13} fontFamily={MONO} fill="#fff">console.log(fee)</text>

      <rect x={470} y={70} width={320} height={210} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={492} y={100} fontSize={13.5} fontWeight={700} fill={ACCENT}>тело функции</text>
      <text x={492} y={134} fontSize={13} fontFamily={MONO} fill="#fff">function calcFee(sum, pct)</text>
      <text x={492} y={162} fontSize={13} fontFamily={MONO} fill={FADE}>  sum → 1000</text>
      <text x={492} y={184} fontSize={13} fontFamily={MONO} fill={FADE}>  pct → 3</text>
      <text x={492} y={220} fontSize={13} fontFamily={MONO} fill={ACCENT}>  return sum * pct / 100</text>
      <text x={492} y={254} fontSize={12.5} fill="#fff">return завершает функцию сразу</text>

      <Arrow x1={310} y1={128} x2={466} y2={128} color={ACCENT} w={3.5} />
      <text x={330} y={116} fontSize={12.5} fontWeight={700} fill={ACCENT}>аргументы 1000 и 3</text>

      <Arrow x1={466} y1={224} x2={312} y2={224} color={INK} w={3.5} />
      <text x={332} y={212} fontSize={12.5} fontWeight={700} fill="#fff">одно значение: 30</text>

      <text x={410} y={314} textAnchor="middle" fontSize={12.5} fill={FADE}>имя без скобок — это сама функция; со скобками — её результат</text>
    </Panel>
  ),

  /* три формы записи и их различия */
  'tfn-three-forms': (aria) => (
    <Panel id="fig-tfn-forms" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ФОРМЫ ЗАПИСИ</text>

      {[
        {
          x: 30,
          name: 'объявление',
          code: 'function f() {}',
          hoist: 'поднимается наверх',
          call: 'вызов до строки — работает',
          self: 'свой this есть',
          accent: true,
        },
        {
          x: 296,
          name: 'выражение',
          code: 'const f = function () {}',
          hoist: 'появляется на своей строке',
          call: 'вызов до строки — ошибка',
          self: 'свой this есть',
          accent: false,
        },
        {
          x: 562,
          name: 'стрелка',
          code: 'const f = () => {}',
          hoist: 'появляется на своей строке',
          call: 'вызов до строки — ошибка',
          self: 'своего this НЕТ',
          accent: false,
        },
      ].map((c) => (
        <g key={c.name}>
          <rect
            x={c.x}
            y={64}
            width={228}
            height={214}
            rx={14}
            fill={c.accent ? SOFT : 'rgba(0,0,0,0.25)'}
            stroke={c.accent ? ACCENT : INK}
            strokeWidth={2.5}
          />
          <text x={c.x + 20} y={94} fontSize={14} fontWeight={700} fill={c.accent ? ACCENT : '#fff'}>{c.name}</text>
          <text x={c.x + 20} y={126} fontSize={12} fontFamily={MONO} fill="#fff">{c.code}</text>
          <path d={`M${c.x + 20} 144h188`} stroke={SOFT} strokeWidth={2} />
          <text x={c.x + 20} y={172} fontSize={12} fill={FADE}>{c.hoist}</text>
          <text x={c.x + 20} y={206} fontSize={12} fill="#fff">{c.call}</text>
          <text x={c.x + 20} y={240} fontSize={12} fill={c.name === 'стрелка' ? ACCENT : FADE}>{c.self}</text>
        </g>
      ))}

      <text x={30} y={306} fontSize={12.5} fill="#fff">стрелка без фигурных скобок возвращает выражение сама</text>
      <text x={30} y={328} fontSize={12.5} fill={FADE}>чтобы вернуть объект, его заворачивают в круглые скобки</text>
    </Panel>
  ),

  /* замыкание: внутренняя функция уносит переменные внешней */
  'tfn-closure': (aria) => (
    <Panel id="fig-tfn-closure" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАМЫКАНИЕ</text>

      <rect x={30} y={66} width={360} height={200} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={52} y={96} fontSize={13.5} fontWeight={700} fill="#fff">внешняя функция</text>
      <text x={52} y={126} fontSize={12.5} fontFamily={MONO} fill="#fff">function makeCounter() {'{'}</text>

      <rect x={62} y={142} width={140} height={40} rx={9} fill={ACCENT} />
      <text x={132} y={167} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#10243a">let n = 0</text>

      <rect x={220} y={142} width={150} height={78} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={295} y={168} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">return () =&gt;</text>
      <text x={295} y={190} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>++n</text>
      <text x={295} y={210} textAnchor="middle" fontSize={11} fill={FADE}>внутренняя</text>

      <Arrow x1={202} y1={162} x2={216} y2={162} color={ACCENT} w={3} />
      <text x={52} y={246} fontSize={12.5} fill={FADE}>внешняя завершилась и исчезла</text>

      <Arrow x1={390} y1={166} x2={444} y2={166} color={ACCENT} w={3.5} />
      <text x={392} y={148} fontSize={12} fontWeight={700} fill={ACCENT}>уносит с собой</text>

      <rect x={448} y={66} width={342} height={200} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={470} y={96} fontSize={13.5} fontWeight={700} fill={ACCENT}>что осталось жить</text>
      <text x={470} y={128} fontSize={12.5} fontFamily={MONO} fill="#fff">const next = makeCounter()</text>
      {['next() → 1', 'next() → 2', 'next() → 3'].map((t, i) => (
        <text key={t} x={470} y={162 + i * 26} fontSize={13} fontFamily={MONO} fill={ACCENT}>{t}</text>
      ))}
      <text x={470} y={246} fontSize={12.5} fill="#fff">n продолжает жить, пока жива next</text>

      <text x={30} y={302} fontSize={12.5} fill="#fff">снаружи к n не добраться: имени нет ни в одной видимой области</text>
      <text x={30} y={324} fontSize={12.5} fill={FADE}>второй вызов makeCounter() создаст отдельный, свой n</text>
    </Panel>
  ),

  /* сигнатура читается по двоеточиям */
  'tfn-signature': (aria) => (
    <Panel id="fig-tfn-sign" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СИГНАТУРА ЧИТАЕТСЯ ПО ДВОЕТОЧИЯМ</text>

      <text x={36} y={100} fontSize={17} fontFamily={MONO} fill="#fff">function calcFee(sum: number, pct: number): number</text>

      <path d="M198 116h132" stroke={ACCENT} strokeWidth={3} strokeLinecap="round" />
      <text x={198} y={140} fontSize={12} fontWeight={700} fill={ACCENT}>типы параметров — внутри скобок</text>

      <path d="M540 116h72" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <text x={470} y={168} fontSize={12} fontWeight={700} fill="#fff">тип результата — после скобок</text>
      <path d="M576 122v34" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />

      <rect x={30} y={190} width={370} height={104} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={220} fontSize={13.5} fontWeight={700} fill={ACCENT}>во время проверки</text>
      <text x={52} y={248} fontSize={12.5} fill="#fff">calcFee('1000', 3) — ошибка сразу</text>
      <text x={52} y={274} fontSize={12.5} fill="#fff">calcFee(1000) — ошибка сразу</text>

      <rect x={420} y={190} width={370} height={104} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={442} y={220} fontSize={13.5} fontWeight={700} fill="#fff">после сборки</text>
      <text x={442} y={248} fontSize={12.5} fontFamily={MONO} fill={FADE}>function calcFee(sum, pct)</text>
      <text x={442} y={274} fontSize={12.5} fill={FADE}>типы исчезли, тело осталось</text>

      <Arrow x1={400} y1={242} x2={416} y2={242} color={INK} w={3} />
    </Panel>
  ),
};
