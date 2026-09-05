import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Material 3»: три файла темы из шаблона проекта, роли цветов
 * вместо конкретных значений, и раздача темы вниз по дереву без параметров. */

export const materialThemeSchemes: Schemes = {
  /* что лежит в ui/theme и как это собирается в одну тему */
  'mt-three-files': (aria) => (
    <Panel id="fig-mt-files" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ФАЙЛА, КОТОРЫЕ ЛЕЖАТ С ПЕРВОГО ДНЯ</text>

      {[
        { x: 30, name: 'Color.kt', what: 'значения цветов', sub: 'val Purple40 = Color(0xFF6650a4)' },
        { x: 288, name: 'Type.kt', what: 'стили текста', sub: 'bodyLarge, titleMedium…' },
        { x: 546, name: 'Shapes.kt', what: 'скругления', sub: 'small, medium, large' },
      ].map((f) => (
        <g key={f.name}>
          <rect x={f.x} y={64} width={244} height={86} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
          <text x={f.x + 18} y={92} fontSize={13} fontFamily={MONO} fill="#fff">{f.name}</text>
          <text x={f.x + 18} y={114} fontSize={12} fill={FADE}>{f.what}</text>
          <text x={f.x + 18} y={136} fontSize={10.5} fontFamily={MONO} fill={FADE}>{f.sub}</text>
        </g>
      ))}

      <Arrow x1={152} y1={158} x2={330} y2={196} color={FADE} w={3} />
      <Arrow x1={410} y1={158} x2={410} y2={196} color={FADE} w={3} />
      <Arrow x1={668} y1={158} x2={490} y2={196} color={FADE} w={3} />

      <rect x={230} y={202} width={360} height={54} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={226} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill={ACCENT}>Theme.kt</text>
      <text x={410} y={246} textAnchor="middle" fontSize={11.5} fill="#fff">собирает три части в MaterialTheme</text>

      <text x={30} y={292} fontSize={12.5} fill="#fff">Android Studio создала их в первый день — и до этой главы они стояли без дела</text>
    </Panel>
  ),

  /* роль против конкретного значения при смене темы */
  'mt-roles': (aria) => (
    <Panel id="fig-mt-roles" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ ЭКРАН В ДВУХ ТЕМАХ</text>

      <text x={30} y={72} fontSize={12.5} fill="#fff">жёстко заданный цвет</text>
      <rect x={30} y={84} width={170} height={70} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
      <text x={115} y={124} textAnchor="middle" fontSize={12} fill="#1B1B1B">текст виден</text>
      <rect x={216} y={84} width={170} height={70} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
      <text x={301} y={124} textAnchor="middle" fontSize={12} fill="#1B1B1B">тот же белый</text>
      <text x={30} y={172} fontSize={11.5} fill={FADE}>в тёмной теме останется белым — и выбьется из экрана</text>

      <text x={440} y={72} fontSize={12.5} fill={ACCENT}>роль: surface / onSurface</text>
      <rect x={440} y={84} width={170} height={70} rx={10} fill="#FFFFFF" stroke={ACCENT} strokeWidth={2.5} />
      <text x={525} y={124} textAnchor="middle" fontSize={12} fill="#1B1B1B">светлая</text>
      <rect x={626} y={84} width={164} height={70} rx={10} fill="#141218" stroke={ACCENT} strokeWidth={2.5} />
      <text x={708} y={124} textAnchor="middle" fontSize={12} fill="#E6E0E9">тёмная</text>
      <text x={440} y={172} fontSize={11.5} fill={ACCENT}>значение подставит тема, разметка не меняется</text>

      <rect x={30} y={196} width={760} height={62} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={222} fontSize={12.5} fill="#fff">пара «цвет и то, что на нём»: primary → onPrimary, surface → onSurface</text>
      <text x={50} y={244} fontSize={12} fill={FADE}>контраст гарантирован обоими значениями сразу — их подбирали вместе</text>

      <text x={30} y={294} fontSize={12.5} fill="#fff">поэтому цвет в Material называется ролью, а не именем: не «фиолетовый», а «главный»</text>
      <text x={30} y={318} fontSize={12.5} fill={FADE}>тёмная тема после этого получается почти бесплатно</text>
    </Panel>
  ),

  /* тема раздаётся вниз по дереву без передачи параметром */
  'mt-provide': (aria) => (
    <Panel id="fig-mt-provide" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТЕМУ НЕ ПЕРЕДАЮТ ПАРАМЕТРОМ</text>

      <rect x={30} y={64} width={760} height={168} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={92} fontSize={13.5} fontFamily={MONO} fill={ACCENT}>AppTheme &#123;</text>
      <text x={640} y={92} fontSize={11.5} fill={ACCENT}>объявили один раз</text>

      <rect x={72} y={106} width={696} height={44} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={92} y={133} fontSize={12.5} fontFamily={MONO} fill="#fff">Screen()</text>
      <Arrow x1={190} y1={128} x2={240} y2={128} color={FADE} w={3} />
      <text x={252} y={133} fontSize={12} fill={FADE}>ничего про тему не знает и не принимает</text>

      <rect x={112} y={162} width={656} height={44} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={132} y={189} fontSize={12.5} fontFamily={MONO} fill="#fff">ProductCard()</text>
      <Arrow x1={264} y1={184} x2={314} y2={184} color={ACCENT} w={3} />
      <text x={326} y={189} fontSize={12} fontFamily={MONO} fill={ACCENT}>MaterialTheme.colorScheme.surface</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">значение достаётся из окружения в момент отрисовки — как переменная среды</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>вложенная тема переопределяет её только внутри своего блока</text>
    </Panel>
  ),
};
