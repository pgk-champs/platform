import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Null-безопасность»: два разных типа вместо одного, четыре
 * оператора и что каждый возвращает, пять оставшихся источников NPE и
 * граница с Java, где проверка типов перестаёт работать. */

export const kotlinNullSchemes: Schemes = {
  /* String и String? — разные типы, а не «одно и то же, но может быть пустым» */
  'kn-two-types': (aria) => (
    <Panel id="fig-kn-types" w={820} h={340} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА РАЗНЫХ ТИПА, А НЕ ОДИН</text>

      <rect x={30} y={62} width={360} height={196} rx={14} fill={ACCENT} />
      <text x={210} y={94} textAnchor="middle" fontSize={17} fontFamily={MONO} fontWeight={700} fill="#10243a">String</text>
      <text x={210} y={122} textAnchor="middle" fontSize={12.5} fill="#10243a">внутри всегда есть текст</text>
      <rect x={52} y={138} width={316} height={30} rx={8} fill="rgba(255,255,255,0.75)" />
      <text x={210} y={158} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#10243a">&quot;olegg&quot;  &quot;&quot;  &quot;   &quot;</text>
      <rect x={52} y={176} width={316} height={30} rx={8} fill="rgba(0,0,0,0.18)" />
      <text x={210} y={196} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#10243a">null — не помещается</text>
      <text x={210} y={230} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#10243a">nick.length — можно сразу</text>

      <rect x={430} y={62} width={360} height={196} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={610} y={94} textAnchor="middle" fontSize={17} fontFamily={MONO} fontWeight={700} fill="#fff">String?</text>
      <text x={610} y={122} textAnchor="middle" fontSize={12.5} fill={FADE}>внутри текст ИЛИ пустота</text>
      <rect x={452} y={138} width={316} height={30} rx={8} fill="rgba(0,0,0,0.3)" />
      <text x={610} y={158} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">&quot;olegg&quot;  &quot;&quot;  &quot;   &quot;</text>
      <rect x={452} y={176} width={316} height={30} rx={8} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2} />
      <text x={610} y={196} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>null — помещается тоже</text>
      <text x={610} y={230} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">nick.length — компилятор не даст</text>

      <Arrow x1={392} y1={160} x2={426} y2={160} color={ACCENT} w={3} />
      <text x={30} y={292} fontSize={12.5} fill="#fff">знак ? в типе — это не «необязательно», а «здесь может лежать пустота»</text>
      <text x={30} y={316} fontSize={12.5} fill={FADE}>String можно передать туда, где ждут String?, а обратно — только через проверку</text>
    </Panel>
  ),

  /* четыре оператора и что каждый возвращает, когда слева пусто */
  'kn-operators': (aria) => (
    <Panel id="fig-kn-ops" w={820} h={340} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ СПОСОБА РАБОТАТЬ С ПУСТОТОЙ</text>

      {[
        { y: 62, name: '?.', what: 'вызывает, только если слева не null', res: 'вернёт null', accent: true },
        { y: 128, name: '?:', what: 'подставляет запасное значение', res: 'вернёт то, что справа', accent: false },
        { y: 194, name: '?.let', what: 'выполняет блок с непустым it', res: 'блок не выполнится', accent: false },
        { y: 260, name: '!!', what: 'клянётся, что null тут не будет', res: 'бросит NPE', accent: false },
      ].map((c) => (
        <g key={c.name}>
          <rect x={30} y={c.y} width={150} height={52} rx={12} fill={c.accent ? ACCENT : SOFT} stroke={c.accent ? 'none' : INK} strokeWidth={2.5} />
          <text x={105} y={c.y + 34} textAnchor="middle" fontSize={17} fontFamily={MONO} fontWeight={700} fill={c.accent ? '#10243a' : '#fff'}>{c.name}</text>
          <text x={204} y={c.y + 22} fontSize={12.5} fill="#fff">{c.what}</text>
          <text x={204} y={c.y + 44} fontSize={11.5} fill={FADE}>если слева null:</text>
          <rect x={556} y={c.y + 10} width={234} height={32} rx={9} fill="rgba(0,0,0,0.3)" stroke={c.name === '!!' ? ACCENT : INK} strokeWidth={2} />
          <text x={673} y={c.y + 31} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={c.name === '!!' ? ACCENT : FADE}>{c.res}</text>
        </g>
      ))}
    </Panel>
  ),

  /* NPE в Kotlin не исчез — он остался ровно в пяти местах */
  'kn-npe-sources': (aria) => (
    <Panel id="fig-kn-npe" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТКУДА NPE БЕРЁТСЯ ДАЖЕ В KOTLIN</text>

      {[
        { x: 30, n: '1', src: 'оператор !!', hint: 'NullPointerException' },
        { x: 214, n: '2', src: 'lateinit до присваивания', hint: 'UninitializedProperty…' },
        { x: 398, n: '3', src: 'this в конструкторе', hint: 'NullPointerException' },
        { x: 582, n: '4', src: 'значение из Java', hint: 'NullPointerException' },
      ].map((c) => (
        <g key={c.n}>
          <rect x={c.x} y={70} width={168} height={122} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <circle cx={c.x + 30} cy={100} r={17} fill={ACCENT} />
          <text x={c.x + 30} y={106} textAnchor="middle" fontSize={16} fontWeight={700} fill="#10243a">{c.n}</text>
          <text x={c.x + 16} y={144} fontSize={12} fill="#fff">{c.src}</text>
          <text x={c.x + 16} y={172} fontSize={10.5} fontFamily={MONO} fill={FADE}>{c.hint}</text>
        </g>
      ))}

      <rect x={30} y={206} width={352} height={54} rx={14} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <circle cx={60} cy={233} r={17} fill={ACCENT} />
      <text x={60} y={239} textAnchor="middle" fontSize={16} fontWeight={700} fill="#10243a">5</text>
      <text x={90} y={239} fontSize={12.5} fill="#fff">throw NullPointerException — написали руками</text>

      <text x={410} y={224} fontSize={12.5} fill="#fff">все пять проверены живьём на Kotlin 2.4.10</text>
      <text x={410} y={250} fontSize={11.5} fill={FADE}>ни одного случайного — каждый пишется явно</text>

      <text x={30} y={296} fontSize={12.5} fill={FADE}>компилятор убирает не сам NPE, а возможность получить его нечаянно</text>
    </Panel>
  ),

  /* граница с Java: тип, о котором компилятор ничего не знает */
  'kn-platform': (aria) => (
    <Panel id="fig-kn-platform" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГРАНИЦА С JAVA: ТИП БЕЗ ГАРАНТИЙ</text>

      <rect x={30} y={70} width={218} height={132} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={139} y={102} textAnchor="middle" fontSize={15} fontFamily={MONO} fontWeight={700} fill="#fff">Java</text>
      <text x={139} y={132} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={FADE}>String getProperty()</text>
      <text x={139} y={160} textAnchor="middle" fontSize={11.5} fill={FADE}>может вернуть null</text>
      <text x={139} y={182} textAnchor="middle" fontSize={11.5} fill={FADE}>и нигде это не написано</text>

      <Arrow x1={252} y1={136} x2={296} y2={136} color={ACCENT} w={3} />

      <rect x={300} y={70} width={218} height={132} rx={14} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="7 6" />
      <text x={409} y={102} textAnchor="middle" fontSize={17} fontFamily={MONO} fontWeight={700} fill={ACCENT}>String!</text>
      <text x={409} y={132} textAnchor="middle" fontSize={12} fill="#fff">платформенный тип</text>
      <text x={409} y={160} textAnchor="middle" fontSize={11.5} fill={FADE}>компилятор молчит</text>
      <text x={409} y={182} textAnchor="middle" fontSize={11.5} fill={FADE}>проверку не требует</text>

      <Arrow x1={522} y1={136} x2={566} y2={136} color={INK} w={3} />

      <rect x={570} y={70} width={220} height={132} rx={14} fill={ACCENT} />
      <text x={680} y={102} textAnchor="middle" fontSize={15} fontFamily={MONO} fontWeight={700} fill="#10243a">твой код</text>
      <text x={680} y={132} textAnchor="middle" fontSize={12} fill="#10243a">пишешь String — падает</text>
      <text x={680} y={160} textAnchor="middle" fontSize={12} fill="#10243a">пишешь String? — безопасно</text>
      <text x={680} y={182} textAnchor="middle" fontSize={11.5} fill="#10243a">выбор за тобой, не за ним</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">на этой границе гарантия исчезает: тип пришёл из мира, где null разрешён везде</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>правило простое — всё, что пришло снаружи, сразу объявляй как nullable</text>
      <text x={30} y={298} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>Cannot invoke &quot;String.length()&quot; because &quot;missing&quot; is null</text>
    </Panel>
  ),
};
