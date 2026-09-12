import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Иконочный шрифт»: путь от svg до символа, область частного
 * использования и иконка против украшения. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const kitIconFontSchemes: Schemes = {
  'kif-pipeline': (aria) => (
    <Panel id="fig-kif-pl" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ SVG → ОДИН ФАЙЛ ШРИФТА → ЧЕТЫРЕ СИМВОЛА</text>

      {[
        { x: 30, t: 'svg/', s: 'cart.svg, search.svg…', d: 'по файлу на иконку' },
        { x: 230, t: 'сборщик', s: 'fantasticon', d: 'имя файла станет именем глифа' },
        { x: 430, t: 'kit_icons.ttf', s: '1932 байта', d: 'все четыре в одном файле' },
        { x: 630, t: 'символ', s: "'\\uF104'", d: 'иконка как обычный текст' },
      ].map((c, i) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={160} height={100} rx={11}
            fill={i === 3 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 3 ? ACCENT : INK} strokeWidth={2} />
          <text x={c.x + 16} y={92} fontSize={12} fontWeight={700} fill="#fff">{c.t}</text>
          <text x={c.x + 16} y={118} fontSize={10} fontFamily={MONO} fill={ACCENT}>{c.s}</text>
          <text x={c.x + 16} y={144} fontSize={10.5} fill={FADE}>{c.d}</text>
          {i < 3 && <Arrow x1={c.x + 168} y1={116} x2={c.x + 222} y2={116} color={ACCENT} w={2.2} />}
        </g>
      ))}

      <text x={30} y={214} fontSize={12.5} fill="#fff">шрифт красится цветом текста и масштабируется как текст — отдельных размеров не нужно</text>
      <text x={30} y={240} fontSize={12.5} fill={FADE}>зато он одноцветный: многоцветную иллюстрацию так не положишь</text>
      <text x={30} y={266} fontSize={12.5} fill={ACCENT}>четыре иконки уместились в 1932 байта — меньше одной картинки</text>
    </Panel>
  ),

  'kif-private-area': (aria) => (
    <Panel id="fig-kif-pa" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЧЕМУ КОДЫ НАЧИНАЮТСЯ С F1</text>

      {[
        { y: 66, c: 'U+0041', n: 'A', d: 'занято латиницей', bad: true },
        { y: 110, c: 'U+0410', n: 'А', d: 'занято кириллицей', bad: true },
        { y: 154, c: 'U+F101', n: 'user', d: 'область для частного использования — свободна', bad: false },
        { y: 198, c: 'U+F104', n: 'cart', d: 'никакой шрифт мира сюда не претендует', bad: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={130} height={32} rx={8}
            fill={r.bad ? 'rgba(255,140,140,0.12)' : SOFT} stroke={r.bad ? RED : ACCENT} strokeWidth={1.7} />
          <text x={95} y={r.y + 21} textAnchor="middle" fontSize={11.5} fontFamily={MONO}
            fill={r.bad ? RED_TEXT : ACCENT}>{r.c}</text>
          <text x={180} y={r.y + 21} fontSize={12} fontFamily={MONO} fill="#fff">{r.n}</text>
          <text x={300} y={r.y + 21} fontSize={11.5} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={254} fontSize={12.5} fill="#fff">возьми обычную букву — и текст «Cart» превратился бы в иконки на любом устройстве</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>диапазон U+E000…U+F8FF зарезервирован именно под такие случаи</text>
    </Panel>
  ),

  'kif-decoration': (aria) => (
    <Panel id="fig-kif-dec" w={820} h={270} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИКОНКА СО СМЫСЛОМ И ИКОНКА-УКРАШЕНИЕ</text>

      <rect x={30} y={64} width={370} height={130} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Несёт смысл</text>
      <text x={50} y={118} fontSize={11} fill={FADE}>кнопка с одной корзиной и без подписи</text>
      <text x={50} y={146} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>description = "Корзина"</text>
      <text x={50} y={174} fontSize={11} fill={FADE}>диктор прочитает — иначе кнопка немая</text>

      <rect x={420} y={64} width={370} height={130} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Украшение</text>
      <text x={440} y={118} fontSize={11} fill={FADE}>та же корзина рядом со словом «Корзина»</text>
      <text x={440} y={146} fontSize={10.5} fontFamily={MONO} fill={FADE}>description = null</text>
      <text x={440} y={174} fontSize={11} fill={FADE}>диктор пропустит: смысл уже в тексте</text>

      <text x={30} y={230} fontSize={12.5} fill="#fff">пустое описание хуже обоих вариантов: диктор прочитает символ из частной области как мусор</text>
      <text x={30} y={256} fontSize={12.5} fill={ACCENT}>решает не иконка, а то, есть ли рядом текст с тем же смыслом</text>
    </Panel>
  ),
};
