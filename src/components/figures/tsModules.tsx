import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Модули и проект»: две системы модулей, расширение в импорте
 * и циклическая зависимость. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const tsModulesSchemes: Schemes = {
  'tm-two-systems': (aria) => (
    <Panel id="fig-tm-two" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ ФАЙЛ, ТРИ РАЗНЫХ ОПИСАНИЯ ПРОЕКТА</text>

      {[
        { y: 66, t: '"type": "commonjs"', r: 'ПАДАЕТ', e: 'Cannot use import statement outside a module', ok: false },
        { y: 122, t: 'поля type нет', r: 'РАБОТАЕТ', e: 'файл прочитан как современный модуль', ok: true },
        { y: 178, t: '"type": "module"', r: 'РАБОТАЕТ', e: 'то же самое, но объявлено явно', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={230} height={40} rx={9} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 25} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.t}</text>
          <rect x={274} y={r.y} width={130} height={40} rx={9}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.16)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.8} />
          <text x={339} y={r.y + 25} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.r}</text>
          <text x={420} y={r.y + 25} fontSize={11} fill={r.ok ? FADE : RED_TEXT}>{r.e}</text>
        </g>
      ))}

      <text x={30} y={248} fontSize={12.5} fill="#fff">судьбу файла решает не расширение, а поле «тип» в ближайшем описании проекта</text>
      <text x={30} y={272} fontSize={12.5} fill={RED_TEXT}>создание проекта по умолчанию ставит туда старую систему — отсюда и берётся эта ошибка</text>
      <text x={30} y={294} fontSize={12.5} fill={FADE}>расширения .mjs и .cjs решают за себя и поле «тип» не спрашивают</text>
    </Panel>
  ),

  'tm-extension': (aria) => (
    <Panel id="fig-tm-ext" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>«ПРАВИЛЬНОГО» РАСШИРЕНИЯ В ИМПОРТЕ НЕ СУЩЕСТВУЕТ</text>

      <text x={390} y={64} textAnchor="middle" fontSize={11} fill={FADE}>прямой запуск</text>
      <text x={630} y={64} textAnchor="middle" fontSize={11} fill={FADE}>сборка компилятором</text>

      {[
        { y: 74, t: "import './util'", a: 'не нашёл модуль', b: 'TS2835: нужно расширение', ok: [false, false] },
        { y: 134, t: "import './util.ts'", a: 'печатает LLTV = 80', b: 'TS5097: так нельзя', ok: [true, false] },
        { y: 194, t: "import './util.js'", a: 'не нашёл модуль', b: 'чисто, ошибок нет', ok: [false, true] },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={230} height={40} rx={9} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 25} fontSize={11} fontFamily={MONO} fill="#fff">{r.t}</text>
          {[r.a, r.b].map((v, i) => (
            <g key={i}>
              <rect x={280 + i * 240} y={r.y} width={220} height={40} rx={9}
                fill={r.ok[i] ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok[i] ? ACCENT : RED} strokeWidth={1.8} />
              <text x={390 + i * 240} y={r.y + 25} textAnchor="middle" fontSize={10.5} fontFamily={MONO}
                fill={r.ok[i] ? ACCENT : RED_TEXT}>{v}</text>
            </g>
          ))}
        </g>
      ))}

      <text x={30} y={262} fontSize={12.5} fill="#fff">выбор зависит от того, как запускают: напрямую — одно расширение, через сборку — другое</text>
      <text x={30} y={284} fontSize={12.5} fill={FADE}>в собранном файле остаётся именно то, что вы написали: компилятор путь не переписывает</text>
    </Panel>
  ),

  'tm-cycle': (aria) => (
    <Panel id="fig-tm-cycle" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА ФАЙЛА ССЫЛАЮТСЯ ДРУГ НА ДРУГА</text>

      <rect x={110} y={70} width={130} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={175} y={95} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">market</text>
      <rect x={110} y={150} width={130} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={175} y={175} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">vault</text>
      <Arrow x1={148} y1={114} x2={148} y2={146} color={RED} w={2.5} />
      <Arrow x1={202} y1={146} x2={202} y2={114} color={RED} w={2.5} />

      <rect x={280} y={66} width={250} height={128} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={298} y={92} fontSize={11.5} fill="#fff">старая система модулей</text>
      <text x={298} y={118} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>market.RATE = undefined</text>
      <text x={298} y={142} fontSize={11} fontFamily={MONO} fill={FADE}>код возврата: 0</text>
      <text x={298} y={168} fontSize={11} fill={RED_TEXT}>авария уехала в расчёты незамеченной</text>

      <rect x={548} y={66} width={242} height={128} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={566} y={92} fontSize={11.5} fill="#fff">современная система</text>
      <text x={566} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>Cannot access 'RATE'</text>
      <text x={566} y={138} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>before initialization</text>
      <text x={566} y={164} fontSize={11} fontFamily={MONO} fill={FADE}>код возврата: 1</text>
      <text x={566} y={186} fontSize={11} fill={ACCENT}>падает сразу и громко</text>

      <text x={30} y={236} fontSize={12.5} fill="#fff">на константах цикл падает, на функциях — работает: значение берётся в момент вызова, а не загрузки</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>лечение одно и то же: общее выносят в третий файл, от которого зависят оба</text>
      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>тихая авария опаснее громкой: в первом случае расчёт пойдёт по пустому значению</text>
    </Panel>
  ),
};
