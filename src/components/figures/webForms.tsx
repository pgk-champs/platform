import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Формы»: что даёт поле типа «число», превращение строки
 * в вей и контрольная сумма адреса. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webFormsSchemes: Schemes = {
  'wfo-number-input': (aria) => (
    <Panel id="fig-wfo-num" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЛЕ type=&quot;number&quot;: ЧТО В НЁМ ОКАЗЫВАЕТСЯ</text>

      <text x={30} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>ввели</text>
      <text x={180} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>value (строка)</text>
      <text x={360} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>valueAsNumber</text>
      <text x={540} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>что дальше сделает parseEther</text>

      {[
        { y: 92, i: '2.5', v: '"2.5"', n: '2.5', p: 'ок: 2500000000000000000 wei', ok: true },
        { y: 126, i: '2,5', v: '""', n: 'NaN', p: 'поле уже пустое', ok: false },
        { y: 160, i: '1e5', v: '"1e5"', n: '100000', p: 'ОТКАЗ: invalid FixedNumber string', ok: false },
        { y: 194, i: 'abc', v: '""', n: 'NaN', p: 'поле уже пустое', ok: false },
        { y: 228, i: '-3', v: '"-3"', n: '-3', p: 'ок: отрицательная сумма!', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.i}</text>
          <text x={180} y={r.y} fontSize={11} fontFamily={MONO} fill={r.v === '""' ? RED_TEXT : ACCENT}>{r.v}</text>
          <text x={360} y={r.y} fontSize={11} fontFamily={MONO} fill={r.n === 'NaN' ? RED_TEXT : ACCENT}>{r.n}</text>
          <text x={540} y={r.y} fontSize={10.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.p}</text>
        </g>
      ))}

      <text x={30} y={268} fontSize={12.5} fill="#fff">запятая и буквы не попадают в значение вовсе: пользователь печатает, а поле остаётся пустым</text>
      <text x={30} y={292} fontSize={12.5} fill={FADE}>показательная строка — 1e5: браузер её принял, а библиотека сумм отвергла</text>
    </Panel>
  ),

  'wfo-parse-amount': (aria) => (
    <Panel id="fig-wfo-parse" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СТРОКА ИЗ ПОЛЯ → ЦЕЛОЕ ЧИСЛО ВЕЙ</text>

      {[
        { y: 66, s: '"2.5"', r: '2500000000000000000 wei', ok: true },
        { y: 102, s: '"0.000000000000000001"', r: '1 wei — минимальная доля', ok: true },
        { y: 138, s: '"0.0000000000000000001"', r: 'ОТКАЗ: too many decimals for format', ok: false },
        { y: 174, s: '"-1"', r: '-1000000000000000000 wei — отказа НЕ будет', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={250} height={28} rx={7} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={46} y={r.y + 19} fontSize={10.5} fontFamily={MONO} fill="#fff">{r.s}</text>
          <Arrow x1={292} y1={r.y + 14} x2={330} y2={r.y + 14} color={r.ok ? ACCENT : RED} w={1.8} />
          <text x={344} y={r.y + 19} fontSize={11} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.r}</text>
        </g>
      ))}

      <text x={30} y={234} fontSize={12.5} fill="#fff">суммы не хранят дробными числами: между строкой поля и транзакцией стоит перевод в целые вей</text>
      <text x={30} y={258} fontSize={12.5} fill={RED_TEXT}>отрицательную сумму библиотека пропустит — проверять знак придётся самим</text>
    </Panel>
  ),

  'wfo-checksum': (aria) => (
    <Panel id="fig-wfo-sum" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>РЕГИСТР БУКВ В АДРЕСЕ — ЭТО КОНТРОЛЬНАЯ СУММА</text>

      {[
        { y: 66, a: '0xf39Fd6e51a…cffFb92266', d: 'смешанный регистр, всё верно', ok: true },
        { y: 106, a: '0xf39fd6e51a…cfffb92266', d: 'всё строчными — проверять нечем, принят', ok: true },
        { y: 146, a: '0xf39Fd6e51a…cffFb92267', d: 'одна цифра изменена', ok: false, e: 'bad address checksum' },
        { y: 186, a: '0xf39Fd6e51a…ffFb9226', d: 'на символ короче', ok: false, e: 'invalid address' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={250} height={30} rx={7}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.6} />
          <text x={44} y={r.y + 20} fontSize={10} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.a}</text>
          <text x={296} y={r.y + 20} fontSize={11} fill={FADE}>{r.d}</text>
          {r.e && <text x={572} y={r.y + 20} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>{r.e}</text>}
        </g>
      ))}

      <text x={30} y={244} fontSize={12.5} fill="#fff">адрес в смешанном регистре сам себя проверяет: опечатка в одном символе поймана до отправки</text>
      <text x={30} y={268} fontSize={12.5} fill={FADE}>адрес целиком строчными проходит всегда — контрольной суммы в нём просто нет</text>
      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>поэтому адрес, введённый руками, прогоняют через проверку, а не просто смотрят на длину</text>
    </Panel>
  ),
};
