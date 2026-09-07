import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Пусто»: две пустоты и восемь ложных, расхождение || и ??,
 * цена восклицательного знака. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const tsNullSchemes: Schemes = {
  'tn-two-empties': (aria) => (
    <Panel id="fig-tn-two" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВЕ ПУСТОТЫ — И ВОСЕМЬ ЗНАЧЕНИЙ, КОТОРЫЕ ТОЛЬКО ПРИКИДЫВАЮТСЯ</text>

      <rect x={30} y={66} width={370} height={124} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">undefined — «сюда не клали»</text>
      {['переменная объявлена без значения', 'у объекта нет такого поля', 'функция ничего не вернула', 'элемента массива не существует'].map((t, i) => (
        <text key={t} x={50} y={116 + i * 20} fontSize={11} fill={ACCENT}>· {t}</text>
      ))}

      <rect x={420} y={66} width={370} height={124} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fontFamily={MONO} fill="#fff">null — «положили пусто»</text>
      <text x={440} y={116} fontSize={11} fill={FADE}>· пишет человек или присылает сервис</text>
      <text x={440} y={136} fontSize={11} fill={FADE}>· само не появляется никогда</text>
      <text x={440} y={162} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>typeof null === "object"</text>
      <text x={440} y={182} fontSize={11} fill={RED_TEXT}>ошибка языка, которой тридцать лет</text>

      <rect x={30} y={206} width={760} height={40} rx={9} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={231} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>в условии «ложными» оказываются восемь: false, 0, −0, 0n, '', null, undefined, NaN</text>

      <text x={30} y={274} fontSize={12.5} fill="#fff">поэтому проверка «если значение есть» отвергает настоящий нулевой баланс и пустую строку</text>
    </Panel>
  ),

  'tn-nullish-vs-or': (aria) => (
    <Panel id="fig-tn-nullish" w={820} h={310} aria={aria}>
      <text x={30} y={34} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГДЕ ?? И || ДАЮТ РАЗНОЕ</text>

      <text x={430} y={62} textAnchor="end" fontSize={11} fontFamily={MONO} fill={ACCENT}>x ?? «по умолч.»</text>
      <text x={660} y={62} textAnchor="end" fontSize={11} fontFamily={MONO} fill={FADE}>x || «по умолч.»</text>

      {[
        { y: 72, v: '0', a: '0', b: '«по умолч.»', diff: true },
        { y: 110, v: "''", a: "''", b: '«по умолч.»', diff: true },
        { y: 148, v: 'false', a: 'false', b: '«по умолч.»', diff: true },
        { y: 186, v: 'null', a: '«по умолч.»', b: '«по умолч.»', diff: false },
        { y: 224, v: '42', a: '42', b: '42', diff: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={760} height={30} rx={7}
            fill={r.diff ? 'rgba(255,140,140,0.12)' : 'rgba(0,0,0,0.24)'} stroke={r.diff ? RED : INK} strokeWidth={1.6} />
          <text x={48} y={r.y + 20} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.v}</text>
          <text x={430} y={r.y + 20} textAnchor="end" fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.a}</text>
          <text x={660} y={r.y + 20} textAnchor="end" fontSize={11} fontFamily={MONO} fill={r.diff ? RED_TEXT : FADE}>{r.b}</text>
          <text x={772} y={r.y + 20} textAnchor="end" fontSize={10.5} fill={r.diff ? RED_TEXT : FADE}>{r.diff ? 'разошлись' : 'совпали'}</text>
        </g>
      ))}

      <text x={30} y={284} fontSize={12.5} fill="#fff">на четырнадцати значениях они разошлись на шести: 0, −0, 0n, пустая строка, NaN и false</text>
      <text x={30} y={306} fontSize={12.5} fill={ACCENT}>?? подставляет запасное только вместо настоящей пустоты — для сумм и ставок нужен именно он</text>
    </Panel>
  ),

  'tn-bang-cost': (aria) => (
    <Panel id="fig-tn-bang" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ СПОСОБА ОБРАТИТЬСЯ К ТОМУ, ЧЕГО МОЖЕТ НЕ БЫТЬ</text>

      <text x={470} y={66} textAnchor="middle" fontSize={11} fill={FADE}>пользователь есть</text>
      <text x={670} y={66} textAnchor="middle" fontSize={11} fill={FADE}>пользователя нет</text>

      {[
        { y: 78, t: 'с проверкой if', a: 'вернул данные', b: 'вернул «нет такого»', ok: true },
        { y: 132, t: 'через ?.', a: 'вернул адрес', b: 'вернул «неизвестен»', ok: true },
        { y: 186, t: 'через ! — «я знаю, что не пусто»', a: 'вернул данные', b: 'УПАЛО', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 26} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={380} y={r.y + 6} width={180} height={30} rx={7} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={470} y={r.y + 26} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.a}</text>
          <rect x={580} y={r.y + 6} width={210} height={30} rx={7}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.16)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.8} />
          <text x={685} y={r.y + 26} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.b}</text>
        </g>
      ))}

      <rect x={30} y={230} width={760} height={38} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={254} textAnchor="middle" fontSize={11.5} fill={FADE}>весь файл прошёл строгую проверку без единой ошибки: про восклицательный знак компилятор молчит</text>

      <text x={30} y={290} fontSize={12.5} fill={RED_TEXT}>в готовом коде от него не остаётся ничего — это обещание компилятору, а не проверка</text>
    </Panel>
  ),
};
