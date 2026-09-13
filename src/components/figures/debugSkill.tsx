import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Поиск ошибок»: как читать след вызовов, где настоящая
 * причина при обёртке, и порядок сужения. */

export const debugSkillSchemes: Schemes = {
  'dbg-trace': (aria) => (
    <Panel id="fig-dbg-tr" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СЛЕД ЧИТАЕТСЯ СВЕРХУ, НО СМОТРЕТЬ НАДО НА СВОЁ</text>

      <rect x={30} y={64} width={530} height={188} rx={12} fill="rgba(0,0,0,0.34)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={90} fontSize={11.5} fontFamily={MONO} fill="#fff">java.lang.IndexOutOfBoundsException: Index: 5, Size: 1</text>
      <text x={48} y={116} fontSize={11} fontFamily={MONO} fill={FADE}>at java.util.Collections$SingletonList.get(…)</text>
      <rect x={40} y={128} width={510} height={26} rx={7} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={48} y={146} fontSize={11} fontFamily={MONO} fill={ACCENT}>at console.Catalog.byIndex(Main.kt:6)</text>
      <text x={48} y={174} fontSize={11} fontFamily={MONO} fill={FADE}>at console.Screen.show(Main.kt:12)</text>
      <text x={48} y={198} fontSize={11} fontFamily={MONO} fill={FADE}>at console.MainKt.main(Main.kt:24)</text>
      <text x={48} y={230} fontSize={11} fill={FADE}>ниже — кто кого позвал, вплоть до запуска программы</text>

      <text x={580} y={94} fontSize={11.5} fill="#fff">чужой код</text>
      <text x={580} y={116} fontSize={11} fill={FADE}>сюда не лезем</text>
      <Arrow x1={572} y1={141} x2={548} y2={141} color={ACCENT} w={3} />
      <text x={580} y={146} fontSize={11.5} fill={ACCENT}>первая СВОЯ строка</text>
      <text x={580} y={168} fontSize={11} fill="#fff">здесь и открывают файл</text>
      <text x={580} y={200} fontSize={11} fill={FADE}>остальное — путь,</text>
      <text x={580} y={220} fontSize={11} fill={FADE}>по которому пришли</text>

      <text x={30} y={286} fontSize={12.5} fill="#fff">верхняя строка почти всегда чужая: падает библиотека, а виноват тот, кто её так позвал</text>
      <text x={30} y={310} fontSize={12.5} fill={ACCENT}>искать нужно первую строку со своим пакетом и номером строки своего файла</text>
    </Panel>
  ),

  'dbg-caused-by': (aria) => (
    <Panel id="fig-dbg-cb" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПРИ ОБЁРТКЕ ПРИЧИНА ЛЕЖИТ ВНИЗУ</text>

      <rect x={30} y={64} width={760} height={78} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={90} fontSize={11.5} fontFamily={MONO} fill="#fff">java.lang.IllegalStateException: не удалось обновить экран</text>
      <text x={48} y={114} fontSize={11} fontFamily={MONO} fill={FADE}>at console.ViewModel.refresh(Main.kt:12)</text>
      <text x={620} y={90} fontSize={11} fill={FADE}>это симптом</text>

      <Arrow x1={410} y1={148} x2={410} y2={172} color={ACCENT} w={3} />

      <rect x={30} y={178} width={760} height={78} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={48} y={204} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>Caused by: java.lang.NumberFormatException: For input string: &quot;сорок два&quot;</text>
      <text x={48} y={228} fontSize={11} fontFamily={MONO} fill="#fff">at console.Repository.load(Main.kt:4)</text>
      <text x={620} y={204} fontSize={11} fill={ACCENT}>это причина</text>

      <text x={30} y={286} fontSize={12.5} fill="#fff">читать надо до самого нижнего «Caused by» — там настоящая ошибка, «… 4 more» лишь прячет повтор</text>
    </Panel>
  ),

  'dbg-narrow': (aria) => (
    <Panel id="fig-dbg-nr" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОРЯДОК, КОТОРЫЙ ЭКОНОМИТ ЧАСЫ</text>

      {[
        { x: 30, n: '1', t: 'воспроизвести', d: 'ошибка по команде, а не «иногда»' },
        { x: 226, n: '2', t: 'сузить', d: 'делим данные и код пополам' },
        { x: 422, n: '3', t: 'объяснить', d: 'почему именно так — до правки' },
        { x: 618, n: '4', t: 'починить', d: 'и проверить тем же шагом 1' },
      ].map((s) => (
        <g key={s.x}>
          <rect x={s.x} y={70} width={172} height={92} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
          <circle cx={s.x + 24} cy={96} r={13} fill={ACCENT} />
          <text x={s.x + 24} y={101} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ifm-color-primary-darkest)">{s.n}</text>
          <text x={s.x + 46} y={101} fontSize={12.5} fill="#fff">{s.t}</text>
          <text x={s.x + 16} y={132} fontSize={10.5} fill={FADE}>{s.d}</text>
        </g>
      ))}
      <Arrow x1={206} y1={116} x2={222} y2={116} color={INK} w={3} />
      <Arrow x1={402} y1={116} x2={418} y2={116} color={INK} w={3} />
      <Arrow x1={598} y1={116} x2={614} y2={116} color={INK} w={3} />

      <rect x={30} y={186} width={760} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={214} fontSize={12} fill={ACCENT}>шаг 3 пропускают чаще всего — и чинят симптом, оставив причину на месте</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">правка «наугад, вдруг поможет» опасна вдвойне: иногда помогает, и тогда причина остаётся неизвестной</text>
      <text x={30} y={290} fontSize={12.5} fill={FADE}>невоспроизводимую ошибку нельзя ни починить, ни проверить — поэтому шаг 1 первый</text>
    </Panel>
  ),
};
