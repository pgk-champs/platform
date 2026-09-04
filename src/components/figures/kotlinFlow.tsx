import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Условия и циклы на Kotlin»: if как выражение, when без
 * проваливания, четыре способа собрать диапазон и цепочка безопасных вызовов. */

export const kotlinFlowSchemes: Schemes = {
  /* в Java if — команда, в Kotlin — выражение с результатом */
  'kf-if-expression': (aria) => (
    <Panel id="fig-kf-if" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГЛАВНОЕ ОТЛИЧИЕ ОТ JAVA: У IF ЕСТЬ РЕЗУЛЬТАТ</text>

      <text x={30} y={82} fontSize={12} fill={FADE}>Java: сначала пустая переменная, потом две записи в неё</text>
      <rect x={30} y={96} width={340} height={92} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={124} fontSize={13} fontFamily={MONO} fill="#fff">String name;</text>
      <text x={48} y={148} fontSize={13} fontFamily={MONO} fill="#fff">if (lvl &gt; 5) name = "старший";</text>
      <text x={48} y={172} fontSize={13} fontFamily={MONO} fill="#fff">else name = "младший";</text>
      <text x={30} y={210} fontSize={12} fill={FADE}>переменная какое-то время живёт пустой</text>

      <text x={438} y={82} fontSize={12} fill={ACCENT}>Kotlin: одно присваивание, val остаётся val</text>
      <rect x={438} y={96} width={352} height={92} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={456} y={130} fontSize={13} fontFamily={MONO} fill="#fff">val name = if (lvl &gt; 5) "старший"</text>
      <text x={456} y={160} fontSize={13} fontFamily={MONO} fill="#fff">          else "младший"</text>
      <text x={438} y={210} fontSize={12} fill={ACCENT}>ветка отдаёт значение — его сразу забирает val</text>

      <path d="M300 236L370 268L300 300L230 268Z" fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={300} y={273} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">lvl &gt; 5</text>
      <Arrow x1={370} y1={268} x2={470} y2={268} color={ACCENT} w={3} />
      <rect x={470} y={246} width={130} height={44} rx={10} fill={ACCENT} />
      <text x={535} y={274} textAnchor="middle" fontSize={13} fontWeight={700} fill="#10243a">значение</text>
      <Arrow x1={600} y1={268} x2={676} y2={268} color={INK} w={3} />
      <rect x={676} y={246} width={114} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={733} y={274} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">val name</text>

      <text x={30} y={324} fontSize={12.5} fill="#fff">нет else — нет и результата: компилятор потребует вторую ветку</text>
    </Panel>
  ),

  /* when выбирает ровно одну ветку и требует else, когда даёт значение */
  'kf-when-branches': (aria) => (
    <Panel id="fig-kf-when" w={820} h={360} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>WHEN ВЫБИРАЕТ ОДНУ ВЕТКУ И ОСТАНАВЛИВАЕТСЯ</text>

      <rect x={30} y={66} width={190} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={125} y={94} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill={ACCENT}>when (level)</text>
      <text x={30} y={132} fontSize={12.5} fill={FADE}>level = 5</text>

      {[
        { y: 160, label: 'in 1..3 ->', note: 'не совпало, идём дальше', hit: false },
        { y: 212, label: 'in 4..6 ->', note: 'совпало: только эта ветка', hit: true },
        { y: 264, label: 'in 7..9 ->', note: 'уже не проверяется', hit: false },
        { y: 316, label: 'else ->', note: 'запасной выход', hit: false },
      ].map((r) => (
        <g key={r.label}>
          <rect
            x={270}
            y={r.y - 22}
            width={210}
            height={40}
            rx={9}
            fill={r.hit ? ACCENT : SOFT}
            stroke={r.hit ? 'none' : INK}
            strokeWidth={2}
          />
          <text x={288} y={r.y + 4} fontSize={13} fontFamily={MONO} fontWeight={r.hit ? 700 : 400} fill={r.hit ? '#10243a' : '#fff'}>{r.label}</text>
          <text x={500} y={r.y + 4} fontSize={12.5} fill={r.hit ? '#fff' : FADE}>{r.note}</text>
        </g>
      ))}

      <Arrow x1={220} y1={88} x2={258} y2={204} color={ACCENT} w={3} />
      <path d="M482 212h58v-96" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={560} y={66} width={230} height={64} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={580} y={92} fontSize={12} fill={FADE}>результат when:</text>
      <text x={580} y={116} fontSize={13} fontFamily={MONO} fill="#fff">"средний"</text>

      <text x={560} y={166} fontSize={12.5} fill="#fff">никакого break нет</text>
      <text x={560} y={190} fontSize={12.5} fill={FADE}>и проваливания вниз тоже</text>
    </Panel>
  ),

  /* четыре способа собрать набор чисел и что в него попадает */
  'kf-ranges': (aria) => (
    <Panel id="fig-kf-ranges" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ ЗАПИСИ — ЧЕТЫРЕ НАБОРА ЧИСЕЛ</text>

      {[
        { y: 78, code: '1..5', got: '1 2 3 4 5', note: 'обе границы включены' },
        { y: 138, code: '1..<5', got: '1 2 3 4', note: 'правая граница НЕ включена' },
        { y: 198, code: '5 downTo 1', got: '5 4 3 2 1', note: 'обратный ход' },
        { y: 258, code: '1..9 step 4', got: '1 5 9', note: 'через шаг' },
      ].map((r, i) => (
        <g key={r.code}>
          <rect x={30} y={r.y - 24} width={190} height={44} rx={10} fill={i === 1 ? ACCENT : SOFT} stroke={i === 1 ? 'none' : INK} strokeWidth={2.5} />
          <text x={48} y={r.y + 4} fontSize={14} fontFamily={MONO} fontWeight={i === 1 ? 700 : 400} fill={i === 1 ? '#10243a' : '#fff'}>{r.code}</text>
          <Arrow x1={222} y1={r.y - 2} x2={272} y2={r.y - 2} color={i === 1 ? ACCENT : INK} w={3} />
          <text x={286} y={r.y + 4} fontSize={15} fontFamily={MONO} fill={i === 1 ? ACCENT : '#fff'}>{r.got}</text>
          <text x={520} y={r.y + 4} fontSize={12.5} fill={FADE}>{r.note}</text>
        </g>
      ))}

      <text x={30} y={310} fontSize={12.5} fill="#fff">until — старое имя для ..&lt;; в новом коде пишут ..&lt;</text>
    </Panel>
  ),

  /* три реакции на null: пропустить, подставить, упасть */
  'kf-null-chain': (aria) => (
    <Panel id="fig-kf-null" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>NULL ПРИШЁЛ — ТРИ РАЗНЫХ ОТВЕТА</text>

      <rect x={30} y={70} width={150} height={50} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={105} y={101} textAnchor="middle" fontSize={14} fontFamily={MONO} fill={FADE}>null</text>

      {[
        { y: 82, sign: '?.', out: 'null', note: 'вызов пропускается, дальше идёт null', accent: false },
        { y: 162, sign: '?:', out: '0', note: 'подставляется запасное значение', accent: true },
        { y: 242, sign: '!!', out: 'NPE', note: 'падение прямо здесь и сейчас', accent: false },
      ].map((r) => (
        <g key={r.sign}>
          <path d={`M180 95h44v${r.y - 95 + 24}h30`} stroke={r.accent ? ACCENT : INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={254} y={r.y} width={92} height={48} rx={10} fill={r.accent ? ACCENT : SOFT} stroke={r.accent ? 'none' : INK} strokeWidth={2.5} />
          <text x={300} y={r.y + 31} textAnchor="middle" fontSize={17} fontFamily={MONO} fontWeight={700} fill={r.accent ? '#10243a' : '#fff'}>{r.sign}</text>
          <Arrow x1={348} y1={r.y + 24} x2={400} y2={r.y + 24} color={r.accent ? ACCENT : INK} w={3} />
          <rect x={400} y={r.y} width={110} height={48} rx={10} fill="rgba(0,0,0,0.3)" stroke={r.sign === '!!' ? ACCENT : INK} strokeWidth={2.5} />
          <text x={455} y={r.y + 31} textAnchor="middle" fontSize={14} fontFamily={MONO} fill={r.sign === '!!' ? ACCENT : '#fff'}>{r.out}</text>
          <text x={530} y={r.y + 30} fontSize={12.5} fill={FADE}>{r.note}</text>
        </g>
      ))}

      <text x={30} y={310} fontSize={12.5} fill="#fff">!! — просьба уронить программу; в учебном коде ей места нет</text>
    </Panel>
  ),
};
