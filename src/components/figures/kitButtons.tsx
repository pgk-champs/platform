import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Компонент библиотеки»: устройство публичной функции,
 * три варианта кнопки и слот против флага. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const kitButtonsSchemes: Schemes = {
  'kb-api-shape': (aria) => (
    <Panel id="fig-kb-api" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОРЯДОК ПАРАМЕТРОВ У КОМПОНЕНТА — НЕ ВКУСОВЩИНА</text>

      {[
        { y: 64, c: 'text: String,', k: 'обязательные — первыми', n: 'без умолчаний: без них компонент бессмыслен', a: true },
        { y: 108, c: 'onClick: () -> Unit,', k: 'что делать', n: 'действие тоже обязательно', a: true },
        { y: 152, c: 'modifier: Modifier = Modifier,', k: 'первый необязательный', n: 'соглашение всего Compose: вызывающий всегда знает, где он', a: true },
        { y: 196, c: 'enabled: Boolean = true,', k: 'состояния', n: 'с разумным умолчанием' },
        { y: 240, c: 'leading: (@Composable () -> Unit)? = null,', k: 'слоты — последними', n: 'чтобы вызов заканчивался лямбдой' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={330} height={36} rx={8}
            fill={r.a ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.a ? ACCENT : INK} strokeWidth={1.7} />
          <text x={46} y={r.y + 23} fontSize={10.5} fontFamily={MONO} fill={r.a ? ACCENT : '#fff'}>{r.c}</text>
          <text x={378} y={r.y + 15} fontSize={11.5} fontWeight={700} fill="#fff">{r.k}</text>
          <text x={378} y={r.y + 31} fontSize={10.5} fill={FADE}>{r.n}</text>
        </g>
      ))}

      <text x={30} y={298} fontSize={12.5} fill="#fff">чужой компонент читают по сигнатуре, а не по коду: порядок и есть его документация</text>
    </Panel>
  ),

  'kb-three-variants': (aria) => (
    <Panel id="fig-kb-var" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ВАРИАНТА — ЭТО ИЕРАРХИЯ, А НЕ ПАЛИТРА</text>

      <rect x={40} y={70} width={190} height={46} rx={10} fill={ACCENT} />
      <text x={135} y={99} textAnchor="middle" fontSize={13} fontWeight={700} fill="#10202a">Оформить заказ</text>
      <text x={40} y={140} fontSize={11.5} fontWeight={700} fill="#fff">Primary</text>
      <text x={40} y={160} fontSize={11} fill={FADE}>главное действие экрана</text>
      <text x={40} y={178} fontSize={11} fill={FADE}>одно, и только одно</text>

      <rect x={300} y={70} width={190} height={46} rx={10} fill="none" stroke={ACCENT} strokeWidth={2.5} />
      <text x={395} y={99} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>В избранное</text>
      <text x={300} y={140} fontSize={11.5} fontWeight={700} fill="#fff">Secondary</text>
      <text x={300} y={160} fontSize={11} fill={FADE}>рядом с главным</text>
      <text x={300} y={178} fontSize={11} fill={FADE}>равноправная альтернатива</text>

      <text x={655} y={99} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>Отмена</text>
      <text x={560} y={140} fontSize={11.5} fontWeight={700} fill="#fff">Ghost</text>
      <text x={560} y={160} fontSize={11} fill={FADE}>уводит со сценария</text>
      <text x={560} y={178} fontSize={11} fill={FADE}>не должна притягивать взгляд</text>

      <text x={30} y={228} fontSize={12.5} fill="#fff">вариант выбирают по важности действия, а не по тому, какой цвет лучше смотрится</text>
      <text x={30} y={254} fontSize={12.5} fill={FADE}>две главные кнопки на экране означают, что важность не выбрана</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>на макете это видно сразу: залитая, обведённая и просто текст</text>
    </Panel>
  ),

  'kb-slot-vs-flag': (aria) => (
    <Panel id="fig-kb-slot" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КАЖДОЕ НОВОЕ ТРЕБОВАНИЕ — ЕЩЁ ОДИН ФЛАГ ИЛИ НИ ОДНОГО</text>

      <rect x={30} y={64} width={370} height={150} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Флаги</text>
      <text x={50} y={118} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>showIcon: Boolean = false,</text>
      <text x={50} y={138} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>iconRes: Int? = null,</text>
      <text x={50} y={158} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>iconTint: Color? = null,</text>
      <text x={50} y={178} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>showBadge: Boolean = false,</text>
      <text x={50} y={202} fontSize={11} fill={FADE}>и так на каждое пожелание дизайнера</text>

      <Arrow x1={414} y1={139} x2={466} y2={139} color={ACCENT} w={2.4} />

      <rect x={480} y={64} width={310} height={150} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={500} y={92} fontSize={12} fontWeight={700} fill="#fff">Слот</text>
      <text x={500} y={124} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>leading: (@Composable</text>
      <text x={500} y={144} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>  () -&gt; Unit)? = null,</text>
      <text x={500} y={176} fontSize={11} fill={FADE}>что положить — решает вызывающий,</text>
      <text x={500} y={194} fontSize={11} fill={FADE}>компонент про это ничего не знает</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">слот закрывает и иконку, и бейдж, и то, чего ещё не придумали</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>цена — скобки при вызове; плата за флаги — переписывать компонент каждый раз</text>
    </Panel>
  ),
};
