import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Карточка по макету»: четыре шага сборки, вынос чисел
 * в константы и почему const val не берёт Dp. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const layoutCardSchemes: Schemes = {
  'lc-four-steps': (aria) => (
    <Panel id="fig-lc-steps" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КАРТОЧКУ СОБИРАЮТ СНАРУЖИ ВНУТРЬ</text>

      {[
        { x: 30, n: '1', t: 'Рамка', c: 'Column', d: 'внешний контейнер, отступы и фон' },
        { x: 230, n: '2', t: 'Слои', c: 'Box', d: 'картинка и бейдж друг на друге' },
        { x: 430, n: '3', t: 'Текст', c: 'Text', d: 'заголовок и описание столбиком' },
        { x: 630, n: '4', t: 'Ряд', c: 'Row', d: 'цена и кнопка по краям' },
      ].map((c, i) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={160} height={130} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <circle cx={c.x + 28} cy={94} r={15} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={c.x + 28} y={99} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{c.n}</text>
          <text x={c.x + 54} y={99} fontSize={12.5} fontWeight={700} fill="#fff">{c.t}</text>
          <text x={c.x + 16} y={128} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{c.c}</text>
          <text x={c.x + 16} y={156} fontSize={10.5} fill={FADE}>{c.d.split(' ').slice(0, 3).join(' ')}</text>
          <text x={c.x + 16} y={174} fontSize={10.5} fill={FADE}>{c.d.split(' ').slice(3).join(' ')}</text>
          {i < 3 && <Arrow x1={c.x + 168} y1={130} x2={c.x + 222} y2={130} color={ACCENT} w={2.2} />}
        </g>
      ))}

      <text x={30} y={244} fontSize={12.5} fill="#fff">каждый шаг проверяют отдельно: так ошибка находится сразу, а не в собранной карточке целиком</text>
      <text x={30} y={270} fontSize={12.5} fill={FADE}>порядок тот же, в каком макет читают глазами: сначала рамка, потом что внутри</text>
      <text x={30} y={292} fontSize={12.5} fill={ACCENT}>Box появляется ровно там, где на макете одно лежит поверх другого</text>
    </Panel>
  ),

  'lc-magic-numbers': (aria) => (
    <Panel id="fig-lc-magic" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНО И ТО ЖЕ ЧИСЛО В ЧЕТЫРЁХ МЕСТАХ</text>

      <rect x={30} y={64} width={370} height={150} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Голые числа</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>.padding(12.dp)</text>
      <text x={50} y={142} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>.padding(top = 12.dp)</text>
      <text x={50} y={164} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>.padding(horizontal = 12.dp)</text>
      <text x={50} y={192} fontSize={11} fill={FADE}>макет поменялся — искать все четыре</text>

      <Arrow x1={414} y1={140} x2={466} y2={140} color={ACCENT} w={2.4} />

      <rect x={480} y={64} width={310} height={150} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={500} y={92} fontSize={12} fontWeight={700} fill="#fff">Именованные константы</text>
      <text x={500} y={120} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>object Dimens {'{'}</text>
      <text x={500} y={142} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>  val CardPadding = 12.dp</text>
      <text x={500} y={164} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{'}'}</text>
      <text x={500} y={192} fontSize={11} fill={FADE}>правка в одном месте</text>

      <text x={30} y={256} fontSize={12.5} fill="#fff">имя объясняет смысл: CardPadding понятнее, чем 12 в пятый раз</text>
      <text x={30} y={282} fontSize={12.5} fill={FADE}>и сразу видно, где 12 — отступ карточки, а где случайное совпадение</text>
    </Panel>
  ),

  'lc-const-val': (aria) => (
    <Panel id="fig-lc-const" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЧЕМУ CONST VAL НЕ БЕРЁТ DP</text>

      <rect x={30} y={64} width={370} height={120} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>const val Size = 12</text>
      <text x={50} y={120} fontSize={11.5} fill="#fff">Int известен компилятору</text>
      <text x={50} y={146} fontSize={11} fill={FADE}>значение готово ещё до запуска</text>
      <text x={50} y={168} fontSize={11} fill={FADE}>его можно подставить прямо в код</text>

      <rect x={420} y={64} width={370} height={120} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={440} y={92} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>const val Size = 12.dp</text>
      <text x={440} y={120} fontSize={11.5} fill="#fff">.dp — вызов, а не число</text>
      <text x={440} y={146} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>Const 'val' has type 'Dp'.</text>
      <text x={440} y={166} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>Only primitive types and 'String'</text>

      <text x={30} y={222} fontSize={12.5} fill="#fff">свойство-расширение .dp вычисляется во время работы программы, а не при сборке</text>
      <text x={30} y={248} fontSize={12.5} fill={FADE}>лечение простое: обычный val — он вычисляется при создании объекта и Dp принимает</text>
      <text x={30} y={274} fontSize={12.5} fill={ACCENT}>то же правило действует для любых Sp, Color и прочих не-примитивов</text>
    </Panel>
  ),
};
