import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Вёрстка»: поток против flex, распределение вдоль оси
 * и сетка, которая перестраивается без медиазапросов. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webLayoutSchemes: Schemes = {
  'wl-flow-vs-flex': (aria) => (
    <Panel id="fig-wl-flow" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНИ И ТЕ ЖЕ ТРИ БЛОКА, ОДНО СВОЙСТВО РАЗНИЦЫ</text>

      <text x={30} y={68} fontSize={11.5} fill={RED_TEXT}>обычный поток — контейнер 600</text>
      {[80, 116, 152].map((y, i) => (
        <g key={y}>
          <rect x={30} y={y} width={360} height={28} rx={5} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.6} />
          <text x={44} y={y + 19} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>{['Сумма', 'Адрес', 'Отправить'][i]} · ширина 598</text>
        </g>
      ))}
      <text x={404} y={128} fontSize={11} fill={FADE}>каждый занял всю ширину</text>
      <text x={404} y={148} fontSize={11} fill={FADE}>высота строки 112px</text>

      <text x={30} y={210} fontSize={11.5} fill={ACCENT}>display: flex — тот же контейнер</text>
      {[{ x: 30, w: 63, t: 'Сумма' }, { x: 97, w: 59, t: 'Адрес' }, { x: 160, w: 90, t: 'Отправить' }].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={222} width={b.w} height={28} rx={5} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />
          <text x={b.x + 8} y={241} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>{b.t}</text>
        </g>
      ))}
      <text x={268} y={241} fontSize={11} fill={FADE}>каждый по содержимому · высота строки 39px</text>

      <text x={30} y={286} fontSize={12.5} fill="#fff">блочные элементы по своей природе занимают всю ширину; flex-контейнер отменяет это для своих потомков</text>
    </Panel>
  ),

  'wl-justify': (aria) => (
    <Panel id="fig-wl-just" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ БЛОКА ПО 100 В КОНТЕЙНЕРЕ 600</text>

      {[
        { y: 60, n: 'flex-start', p: [1, 101, 201] },
        { y: 100, n: 'center', p: [150, 250, 350] },
        { y: 140, n: 'flex-end', p: [299, 399, 499] },
        { y: 180, n: 'space-between', p: [1, 250, 499] },
        { y: 220, n: 'space-evenly', p: [76, 250, 425] },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 18} fontSize={11} fontFamily={MONO} fill="#fff">{r.n}</text>
          <rect x={160} y={r.y} width={600} height={26} rx={4} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={1.2} />
          {r.p.map((x, i) => (
            <g key={i}>
              <rect x={160 + x} y={r.y + 2} width={98} height={22} rx={3} fill={SOFT} stroke={ACCENT} strokeWidth={1.4} />
              <text x={160 + x + 49} y={r.y + 17} textAnchor="middle" fontSize={9.5} fontFamily={MONO} fill={ACCENT}>{x}</text>
            </g>
          ))}
        </g>
      ))}

      <text x={30} y={272} fontSize={12.5} fill="#fff">числа — настоящие отступы слева, снятые с живой страницы</text>
      <text x={30} y={296} fontSize={12.5} fill={FADE}>«между» прижимает крайние к краям, «поровну» даёт одинаковые промежутки, включая внешние</text>
    </Panel>
  ),

  'wl-autofit': (aria) => (
    <Panel id="fig-wl-auto" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА СТРОКА ВМЕСТО ТРЁХ МЕДИАЗАПРОСОВ</text>

      <text x={30} y={64} fontSize={11} fontFamily={MONO} fill={ACCENT}>grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))</text>

      {[
        { y: 84, w: 900, cols: 4, sw: 216, label: 'окно 900 → 4 колонки, карточка 216px' },
        { y: 150, w: 640, cols: 3, sw: 205, label: 'окно 640 → 3 колонки, карточка 205px' },
        { y: 216, w: 375, cols: 1, sw: 375, label: 'окно 375 → 1 колонка, карточка 375px' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={r.w * 0.42} height={30} rx={5} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={1.2} />
          {Array.from({ length: r.cols }, (_, i) => (
            <rect key={i} x={34 + i * (r.w * 0.42 - 8) / r.cols} y={r.y + 3} width={(r.w * 0.42 - 8) / r.cols - 5} height={24} rx={3}
              fill={SOFT} stroke={ACCENT} strokeWidth={1.4} />
          ))}
          <text x={30} y={r.y + 48} fontSize={11} fill={FADE}>{r.label}</text>
        </g>
      ))}

      <text x={30} y={286} fontSize={12.5} fill="#fff">сетка сама решает, сколько колонок поместится: ни одного медиазапроса при этом не написано</text>
    </Panel>
  ),
};
