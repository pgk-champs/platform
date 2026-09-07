import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Наследование»: виртуальный вызов из конструктора базы,
 * порядок линеаризации при ромбе и восемь ошибок наследования. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solInheritanceSchemes: Schemes = {
  'si-virtual-call': (aria) => (
    <Panel id="fig-si-virtual" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА СТРОКА В БАЗЕ — ДВА РАЗНЫХ РЕЗУЛЬТАТА</text>

      <rect x={250} y={62} width={320} height={52} rx={11} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={410} y={84} textAnchor="middle" fontSize={11.5} fill="#fff">конструктор базового контракта</text>
      <text x={410} y={104} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>_mint(msg.sender, supply * 10 ** decimals())</text>

      <Arrow x1={310} y1={120} x2={200} y2={156} color={ACCENT} w={2.5} />
      <Arrow x1={510} y1={120} x2={620} y2={156} color={ACCENT} w={2.5} />

      <rect x={30} y={160} width={340} height={86} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={186} fontSize={12} fill="#fff">наследник с decimals() = 18</text>
      <text x={50} y={210} fontSize={11} fontFamily={MONO} fill={ACCENT}>1 токен = 10¹⁸ единиц</text>
      <text x={50} y={232} fontSize={11} fontFamily={MONO} fill={FADE}>totalSupply = 10²⁵</text>

      <rect x={450} y={160} width={340} height={86} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={470} y={186} fontSize={12} fill="#fff">наследник с decimals() = 12</text>
      <text x={470} y={210} fontSize={11} fontFamily={MONO} fill={ACCENT}>1 токен = 10¹² единиц</text>
      <text x={470} y={232} fontSize={11} fontFamily={MONO} fill={FADE}>totalSupply = 10¹⁹</text>

      <text x={30} y={274} fontSize={12.5} fill="#fff">код _mint один и тот же — число разное: decimals() подменил наследник, даже вызванный из конструктора базы</text>
      <text x={30} y={296} fontSize={12.5} fill={RED_TEXT}>«1 токен», посчитанный по привычке как 10¹⁸, доставит в 12-значном токене миллион вместо одного</text>
    </Panel>
  ),

  'si-linearization': (aria) => (
    <Panel id="fig-si-lin" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОРЯДОК В СПИСКЕ IS ЗАДАЁТ ЦЕПОЧКУ SUPER</text>

      <rect x={330} y={62} width={160} height={34} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={410} y={85} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">A</text>
      <Arrow x1={360} y1={100} x2={280} y2={128} color={FADE} w={2} />
      <Arrow x1={460} y1={100} x2={540} y2={128} color={FADE} w={2} />
      <rect x={190} y={132} width={160} height={34} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={270} y={155} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">B</text>
      <rect x={470} y={132} width={160} height={34} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={550} y={155} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">C</text>
      <Arrow x1={280} y1={170} x2={370} y2={198} color={FADE} w={2} />
      <Arrow x1={540} y1={170} x2={450} y2={198} color={FADE} w={2} />
      <rect x={330} y={202} width={160} height={34} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={225} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>D</text>

      <rect x={30} y={252} width={370} height={30} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={48} y={272} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>D is B, C → who(): D → C → B → A</text>
      <rect x={420} y={252} width={370} height={30} rx={8} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} />
      <text x={438} y={272} fontSize={11.5} fontFamily={MONO} fill={FADE}>D is C, B → who(): D → B → C → A</text>

      <text x={30} y={306} fontSize={12.5} fill="#fff">super — «следующий в очереди», а не «мой родитель»: в C он уходит в B, хотя в коде C написано только is A</text>
      <text x={30} y={326} fontSize={12.5} fill={FADE}>конструкторы всегда идут от базовых к наследнику, и общий предок выполняется ровно один раз</text>
    </Panel>
  ),

  'si-errors': (aria) => (
    <Panel id="fig-si-errors" w={820} h={330} aria={aria}>
      <text x={30} y={34} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВОСЕМЬ ОШИБОК НАСЛЕДОВАНИЯ — ДОСЛОВНО ОТ КОМПИЛЯТОРА</text>

      {[
        { y: 52, t: 'в базе нет virtual', e: 'Trying to override non-virtual function' },
        { y: 86, t: 'в наследнике нет override', e: 'Overriding function is missing "override" specifier' },
        { y: 120, t: 'наследник читает private базы', e: 'DeclarationError: Undeclared identifier' },
        { y: 154, t: 'производный раньше базового в is', e: 'Linearization of inheritance graph impossible' },
        { y: 188, t: 'функция без тела, abstract не написан', e: 'Contract "Shape" should be marked as abstract' },
        { y: 222, t: 'базовому конструктору не дали аргументы', e: 'No arguments passed to the base constructor' },
        { y: 256, t: 'функция есть в двух родителях', e: 'Function needs to specify overridden contracts "B" and "C"' },
        { y: 290, t: 'are вместо is (опечатка из эталона КЗ)', e: "ParserError: Expected '{' but got identifier" },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={300} height={26} rx={6} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.6} />
          <text x={44} y={r.y + 18} fontSize={10.5} fill="#fff">{r.t}</text>
          <rect x={344} y={r.y} width={446} height={26} rx={6} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.6} />
          <text x={358} y={r.y + 18} fontSize={10} fontFamily={MONO} fill={RED_TEXT}>{r.e}</text>
        </g>
      ))}
    </Panel>
  ),
};
