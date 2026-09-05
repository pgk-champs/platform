import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Типы данных»: переполнение и unchecked, порядок операций
 * при целочисленном делении, суффиксы как множители. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solidityTypesSchemes: Schemes = {
  'st-overflow': (aria) => (
    <Panel id="fig-st-overflow" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>255 + 1 В uint8: ДВА ПОВЕДЕНИЯ ОДНОГО КОДА</text>

      <rect x={30} y={70} width={360} height={130} rx={12} fill="rgba(0,0,0,0.28)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={98} fontSize={12.5} fill="#fff">обычный код (с 0.8 — проверка)</text>
      <text x={50} y={124} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>ОТКАТ · panic code 0x11</text>
      <text x={50} y={148} fontSize={11.5} fill={FADE}>транзакция отменена целиком,</text>
      <text x={50} y={170} fontSize={11.5} fill={FADE}>состояние не изменилось</text>

      <rect x={430} y={70} width={360} height={130} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={450} y={98} fontSize={12.5} fill="#fff">unchecked {'{ }'} — старое поведение</text>
      <text x={450} y={124} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>255 + 1 = 0 · 250 + 10 = 4</text>
      <text x={450} y={148} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>0 − 1 = 255</text>
      <text x={450} y={170} fontSize={11.5} fill={FADE}>как одометр: перевалило и пошло с нуля</text>

      <rect x={30} y={224} width={760} height={40} rx={9} fill="rgba(0,0,0,0.28)" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={249} textAnchor="middle" fontSize={11.5} fill={ACCENT}>цена проверки измерена: 22 403 против 22 143 газа — 260 газа за операцию</text>

      <text x={30} y={296} fontSize={12.5} fill="#fff">до 0.8 заворачивание было тихим — на нём строились настоящие взломы; сейчас откат по умолчанию</text>
    </Panel>
  ),

  'st-integer-div': (aria) => (
    <Panel id="fig-st-div" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОРЯДОК ОПЕРАЦИЙ РЕШАЕТ ВСЁ</text>

      <rect x={30} y={66} width={360} height={96} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">amount * 30 / 100</text>
      <text x={50} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>7 → 2 · дробь теряется один раз</text>
      <text x={50} y={142} fontSize={11.5} fill={FADE}>умножение первым — так в эталоне КЗ</text>

      <rect x={430} y={66} width={360} height={96} rx={12} fill="rgba(0,0,0,0.28)" stroke={RED} strokeWidth={2.5} />
      <text x={450} y={92} fontSize={12} fontFamily={MONO} fill="#fff">amount * (30 / 100)</text>
      <text x={450} y={118} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>7 → 0 · 30 / 100 уже ноль</text>
      <text x={450} y={142} fontSize={11.5} fill={FADE}>0,5 токена стоит 0 wei — покупка бесплатна</text>

      <text x={30} y={196} fontSize={12.5} fill="#fff">проверка из задания: require(_amount / dec &lt;= 5000)</text>

      {[
        { y: 214, t: '5000 токенов ровно', r: 'true', ok: true },
        { y: 246, t: '5000 токенов + 1 мелкая единица', r: 'true', ok: false },
        { y: 278, t: '5000,999999999999 токена', r: 'true', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={620} height={26} rx={7} fill={r.ok ? SOFT : 'rgba(255,140,140,0.12)'} stroke={r.ok ? INK : RED} strokeWidth={1.8} />
          <text x={48} y={r.y + 18} fontSize={11.5} fill="#fff">{r.t}</text>
          <text x={636} y={r.y + 18} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.r}</text>
        </g>
      ))}
      <text x={666} y={264} fontSize={11.5} fill={RED_TEXT}>лишних почти</text>
      <text x={666} y={284} fontSize={11.5} fill={RED_TEXT}>на целый токен</text>
    </Panel>
  ),

  'st-units': (aria) => (
    <Panel id="fig-st-units" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СУФФИКС — ЭТО МНОЖИТЕЛЬ, А НЕ ТИП</text>

      {[
        { y: 64, a: '1 ether', b: '1 000 000 000 000 000 000 wei', c: '10¹⁸' },
        { y: 106, a: '0.00075 ether', b: '750 000 000 000 000 wei', c: 'цена из эталона КЗ' },
        { y: 148, a: '10 minutes', b: '600', c: 'просто секунды' },
        { y: 190, a: '1 days', b: '86 400', c: 'сравнивают с block.timestamp' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={180} height={32} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={120} y={r.y + 21} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>{r.a}</text>
          <Arrow x1={218} y1={r.y + 16} x2={252} y2={r.y + 16} color={FADE} w={2} />
          <rect x={260} y={r.y} width={330} height={32} rx={8} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <text x={278} y={r.y + 21} fontSize={12} fontFamily={MONO} fill="#fff">{r.b}</text>
          <text x={606} y={r.y + 21} fontSize={11.5} fill={FADE}>{r.c}</text>
        </g>
      ))}

      <text x={30} y={254} fontSize={12.5} fill="#fff">в коде и в памяти лежат только целые числа — «эфиров» и «минут» внутри контракта не существует</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>суффикс всегда во множественном числе: 1 minutes, не 1 minute — иначе компилятор не поймёт</text>
    </Panel>
  ),
};
