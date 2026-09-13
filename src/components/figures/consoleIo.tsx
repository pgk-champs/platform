import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Консоль»: что на самом деле возвращает чтение строки,
 * разбор числа с его ловушками, консоль как отдельный слой. */

export const consoleIoSchemes: Schemes = {
  'ci-what-comes': (aria) => (
    <Panel id="fig-ci-what" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ПРИХОДИТ С КЛАВИАТУРЫ</text>

      {[
        { y: 66, k: 'нажали Enter, ничего не введя', v: '«»', n: 'пустая строка, НЕ null · длина 0', ok: true },
        { y: 118, k: 'ввели «   Олег   »', v: '«   Олег   »', n: 'пробелы сохраняются · длина 10', ok: true },
        { y: 170, k: 'ввели 42', v: '«42»', n: 'это СТРОКА, а не число', ok: true },
        { y: 222, k: 'ввод кончился (файл, Ctrl+D)', v: 'null', n: 'только здесь бывает null', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={286} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
          <text x={48} y={r.y + 25} fontSize={11.5} fill="#fff">{r.k}</text>
          <Arrow x1={326} y1={r.y + 20} x2={354} y2={r.y + 20} color={FADE} w={2.5} />
          <rect x={364} y={r.y} width={140} height={40} rx={9} fill={r.ok ? SOFT : 'rgba(0,0,0,0.3)'} stroke={r.ok ? ACCENT : INK} strokeWidth={2} />
          <text x={434} y={r.y + 25} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={r.ok ? ACCENT : '#fff'}>{r.v}</text>
          <text x={520} y={r.y + 25} fontSize={11.5} fill={FADE}>{r.n}</text>
        </g>
      ))}

      <text x={30} y={290} fontSize={12.5} fill={ACCENT}>«пусто» и «ввода больше нет» — разные вещи: первое это строка длиной ноль</text>
    </Panel>
  ),

  'ci-parse': (aria) => (
    <Panel id="fig-ci-parse" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА И ТА ЖЕ СТРОКА, ДВА РАЗБОРА</text>

      <text x={190} y={66} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={FADE}>toIntOrNull()</text>
      <text x={420} y={66} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={FADE}>toDoubleOrNull()</text>

      {[
        { y: 78, s: '«42»', i: '42', d: '42.0', note: '' },
        { y: 118, s: '«3.5»', i: 'null', d: '3.5', note: 'точка — годится' },
        { y: 158, s: '«3,5»', i: 'null', d: 'null', note: 'запятая — нет' },
        { y: 198, s: '« 42 »', i: 'null', d: '42.0', note: 'Int пробелов не прощает' },
        { y: 238, s: '«99999999999»', i: 'null', d: '9.99…E10', note: 'не влезает в Int' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={130} height={32} rx={8} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
          <text x={95} y={r.y + 21} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">{r.s}</text>
          <rect x={172} y={r.y} width={112} height={32} rx={8}
            fill={r.i === 'null' ? 'rgba(0,0,0,0.3)' : SOFT} stroke={r.i === 'null' ? INK : ACCENT} strokeWidth={2} />
          <text x={228} y={r.y + 21} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={r.i === 'null' ? FADE : ACCENT}>{r.i}</text>
          <rect x={296} y={r.y} width={126} height={32} rx={8}
            fill={r.d === 'null' ? 'rgba(0,0,0,0.3)' : SOFT} stroke={r.d === 'null' ? INK : ACCENT} strokeWidth={2} />
          <text x={359} y={r.y + 21} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={r.d === 'null' ? FADE : ACCENT}>{r.d}</text>
          <text x={438} y={r.y + 21} fontSize={11.5} fill={FADE}>{r.note}</text>
        </g>
      ))}

      <text x={30} y={296} fontSize={12.5} fill={ACCENT}>trim() перед разбором — не аккуратность, а условие работы: без него « 42 » не число</text>
    </Panel>
  ),

  'ci-layers': (aria) => (
    <Panel id="fig-ci-lay" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КТО ЧИТАЕТ, КТО СЧИТАЕТ, КТО ПЕЧАТАЕТ</text>

      <rect x={30} y={68} width={350} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={96} fontSize={12.5} fill={ACCENT}>main — разговор с человеком</text>
      <text x={50} y={124} fontSize={11.5} fontFamily={MONO} fill="#fff">readlnOrNull()</text>
      <text x={50} y={148} fontSize={11.5} fontFamily={MONO} fill="#fff">trim() · toIntOrNull()</text>
      <text x={50} y={172} fontSize={11.5} fontFamily={MONO} fill="#fff">println(…)</text>
      <text x={50} y={196} fontSize={11} fill={FADE}>вся печать и всё чтение — только тут</text>

      <Arrow x1={392} y1={138} x2={432} y2={138} color={ACCENT} w={3} />
      <text x={412} y={126} textAnchor="middle" fontSize={10.5} fill={FADE}>число</text>

      <rect x={444} y={68} width={346} height={140} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={464} y={96} fontSize={12.5} fill="#fff">Cart — только логика</text>
      <text x={464} y={124} fontSize={11.5} fontFamily={MONO} fill={FADE}>add(title, count): Result</text>
      <text x={464} y={148} fontSize={11.5} fontFamily={MONO} fill={FADE}>total(): Int</text>
      <text x={464} y={176} fontSize={11.5} fill={ACCENT}>ни одного println</text>
      <text x={464} y={198} fontSize={11} fill={FADE}>про клавиатуру не знает вовсе</text>

      <text x={30} y={244} fontSize={12.5} fill="#fff">такой класс переносится в приложение без единой правки: экран заменит собой main</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>класс, который печатает сам, придётся переписывать — печатать на экране Android нечем</text>
    </Panel>
  ),
};
