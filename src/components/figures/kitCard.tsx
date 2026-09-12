import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Карточка и адаптивность»: две раскладки одной карточки,
 * что значит «адаптивный компонент» и три места, где ломается длинный текст. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const kitCardSchemes: Schemes = {
  'kc-two-layouts': (aria) => (
    <Panel id="fig-kc-two" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА КАРТОЧКА, ДВЕ РАСКЛАДКИ — РЕШАЕТ ОНА САМА</text>

      <rect x={30} y={64} width={180} height={200} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <rect x={44} y={78} width={152} height={70} rx={7} fill="rgba(255,255,255,0.08)" />
      <rect x={44} y={158} width={120} height={9} rx={3} fill="rgba(255,255,255,0.3)" />
      <rect x={44} y={174} width={80} height={7} rx={3} fill="rgba(255,255,255,0.18)" />
      <text x={44} y={204} fontSize={11} fontFamily={MONO} fill={ACCENT}>1 990 ₽</text>
      <rect x={44} y={216} width={152} height={24} rx={6} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={120} y={232} textAnchor="middle" fontSize={9} fontFamily={MONO} fill={ACCENT}>В корзину</text>
      <text x={30} y={286} fontSize={11.5} fill={FADE}>узко: столбиком</text>

      <rect x={250} y={100} width={540} height={110} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <rect x={264} y={114} width={82} height={82} rx={7} fill="rgba(255,255,255,0.08)" />
      <rect x={360} y={130} width={210} height={9} rx={3} fill="rgba(255,255,255,0.3)" />
      <rect x={360} y={148} width={140} height={7} rx={3} fill="rgba(255,255,255,0.18)" />
      <text x={360} y={182} fontSize={11} fontFamily={MONO} fill={ACCENT}>1 990 ₽</text>
      <rect x={650} y={140} width={124} height={28} rx={6} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={712} y={158} textAnchor="middle" fontSize={9} fontFamily={MONO} fill={ACCENT}>В корзину</text>
      <text x={250} y={240} fontSize={11.5} fill={FADE}>широко: строкой</text>

      <text x={30} y={296} fontSize={12.5} fill={ACCENT}>вызывающий не выбирает вариант: карточка смотрит на доступную ей ширину</text>
    </Panel>
  ),

  'kc-what-is-adaptive': (aria) => (
    <Panel id="fig-kc-ad" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>«КОМПОНЕНТ АДАПТИВЕН» — ЭТО ЧЕТЫРЕ ПРОВЕРКИ</text>

      {[
        { y: 64, k: 'нет жёсткой ширины', b: 'width(320.dp)', g: 'fillMaxWidth() или widthIn(max = …)' },
        { y: 116, k: 'текст обрезается', b: 'Text(title)', g: 'maxLines + TextOverflow.Ellipsis' },
        { y: 168, k: 'раскладка от ширины', b: 'вызывающий выбирает вид', g: 'BoxWithConstraints внутри' },
        { y: 220, k: 'высота от содержимого', b: 'height(180.dp)', g: 'heightIn(min = …)' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 16} fontSize={12} fontWeight={700} fill="#fff">{r.k}</text>
          <rect x={250} y={r.y} width={230} height={32} rx={8} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.6} />
          <text x={266} y={r.y + 21} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>{r.b}</text>
          <Arrow x1={492} y1={r.y + 16} x2={524} y2={r.y + 16} color={ACCENT} w={2} />
          <rect x={538} y={r.y} width={252} height={32} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />
          <text x={554} y={r.y + 21} fontSize={10} fontFamily={MONO} fill={ACCENT}>{r.g}</text>
        </g>
      ))}

      <text x={30} y={278} fontSize={12.5} fill="#fff">ни одну из четырёх компилятор не поймает: всё это законный код</text>
    </Panel>
  ),

  'kc-long-text': (aria) => (
    <Panel id="fig-kc-lt" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ МЕСТА, ГДЕ ЛОМАЕТСЯ ДЛИННОЕ НАЗВАНИЕ</text>

      <rect x={30} y={62} width={760} height={58} rx={10} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={86} fontSize={11.5} fill={RED_TEXT}>без maxLines — карточка растёт вниз, и в сетке соседние встают вразнобой</text>
      <text x={50} y={108} fontSize={11} fill={FADE}>на макете все карточки одной высоты, у вас — лесенка</text>

      <rect x={30} y={132} width={760} height={58} rx={10} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={156} fontSize={11.5} fill={RED_TEXT}>maxLines без overflow — текст обрывается на полуслове без многоточия</text>
      <text x={50} y={178} fontSize={11} fill={FADE}>выглядит как обрезанная вёрстка, а не как сокращение</text>

      <rect x={30} y={202} width={760} height={58} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={226} fontSize={11.5} fill={ACCENT}>maxLines = 2, overflow = TextOverflow.Ellipsis</text>
      <text x={50} y={248} fontSize={11} fill={FADE}>две строки и многоточие: высота предсказуема, обрыв выглядит намеренным</text>

      <text x={30} y={276} fontSize={12.5} fill="#fff">проверяют это одним товаром с названием на сто знаков — он всегда найдётся в каталоге</text>
    </Panel>
  ),
};
