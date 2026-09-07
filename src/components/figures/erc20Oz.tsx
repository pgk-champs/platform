import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Готовый ERC20»: рукописный токен против библиотечного,
 * _update как единая точка и три способа заплатить чужим токеном. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const erc20OzSchemes: Schemes = {
  'eo-hand-vs-lib': (aria) => (
    <Panel id="fig-eo-cmp" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГОТОВЫЙ ТОКЕН ОКАЗАЛСЯ МЕНЬШЕ РУКОПИСНОГО</text>

      {[
        { y: 62, t: 'написан руками, строковые сообщения', b: '3 976 байт', w: 400, c: RED },
        { y: 106, t: 'тот же код, но свои ошибки вместо строк', b: '3 733 байта', w: 376, c: INK },
        { y: 150, t: 'наследник библиотечного ERC20', b: '3 670 байт', w: 369, c: ACCENT },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 17} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={370} y={r.y + 2} width={r.w} height={20} rx={5}
            fill={r.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.c} strokeWidth={1.8} />
          <text x={r.w + 382} y={r.y + 17} fontSize={11} fontFamily={MONO} fill={r.c === INK ? FADE : r.c}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={202} fontSize={12.5} fill="#fff">243 байта из 306 съедали тексты сообщений: свои ошибки короче строк</text>
      <text x={30} y={226} fontSize={12.5} fill={FADE}>развёртывание: 1 019 899 газа против 966 009; перевод дешевле на 229</text>

      <rect x={30} y={244} width={760} height={44} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={271} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>ERC20InsufficientBalance(«0x7099…79C8», 200, 500) — вместо текста три числа</text>
    </Panel>
  ),

  'eo-update-door': (aria) => (
    <Panel id="fig-eo-update" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА ДВЕРЬ ДЛЯ ЛЮБОГО ДВИЖЕНИЯ БАЛАНСА</text>

      {['transfer', 'transferFrom', '_mint', '_burn'].map((t, i) => (
        <g key={t}>
          <rect x={30} y={64 + i * 42} width={180} height={32} rx={8} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} />
          <text x={120} y={85 + i * 42} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">{t}</text>
          <Arrow x1={218} y1={80 + i * 42} x2={288} y2={140} color={FADE} w={2} />
        </g>
      ))}

      <rect x={296} y={116} width={190} height={48} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={391} y={146} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>_update</text>

      <text x={520} y={80} fontSize={11.5} fill="#fff">переопределили _update</text>
      {['transfer: комиссия 10', 'transferFrom: комиссия 10', 'на паузе: все четыре стоят'].map((t, i) => (
        <text key={t} x={520} y={104 + i * 22} fontSize={11} fontFamily={MONO} fill={ACCENT}>· {t}</text>
      ))}

      <text x={520} y={190} fontSize={11.5} fill="#fff">переопределили только transfer</text>
      {['transfer: комиссия 10', 'transferFrom: комиссия 0', 'на паузе: transferFrom прошло'].map((t, i) => (
        <text key={t} x={520} y={214 + i * 22} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>· {t}</text>
      ))}

      <text x={30} y={266} fontSize={12.5} fill="#fff">выпуск отличается нулевым адресом отправителя, сжигание — нулевым получателем</text>
      <text x={30} y={292} fontSize={12.5} fill={RED_TEXT}>защита, повешенная на один transfer, выглядит рабочей — и обходится вторым способом перевода</text>
    </Panel>
  ),

  'eo-safe-transfer': (aria) => (
    <Panel id="fig-eo-safe" w={820} h={310} aria={aria}>
      <text x={30} y={34} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ СПОСОБА ЗАПЛАТИТЬ ЧУЖИМ ТОКЕНОМ</text>

      <text x={330} y={62} textAnchor="middle" fontSize={11} fill={FADE}>без проверки</text>
      <text x={520} y={62} textAnchor="middle" fontSize={11} fill={FADE}>с проверкой</text>
      <text x={706} y={62} textAnchor="middle" fontSize={11} fill={ACCENT}>safeTransfer</text>

      {[
        { y: 74, t: 'токен без возврата признака', a: 'откат', b: 'откат', c: 'ок · 39 328', ok: [false, false, true] },
        { y: 138, t: 'токен возвращает false', a: 'ок, доехало 0', b: 'откат', c: 'откат', ok: [false, true, true] },
        { y: 202, t: 'обычный токен', a: 'ок · 39 648', b: 'ок · 39 616', c: 'ок · 39 173', ok: [true, true, true] },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 30} fontSize={11.5} fill="#fff">{r.t}</text>
          {[r.a, r.b, r.c].map((v, i) => (
            <g key={i}>
              <rect x={250 + i * 186} y={r.y + 12} width={166} height={28} rx={7}
                fill={r.ok[i] ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok[i] ? ACCENT : RED} strokeWidth={1.8} />
              <text x={333 + i * 186} y={r.y + 31} textAnchor="middle" fontSize={10.5} fontFamily={MONO}
                fill={r.ok[i] ? ACCENT : RED_TEXT}>{v}</text>
            </g>
          ))}
        </g>
      ))}

      <text x={30} y={266} fontSize={12.5} fill="#fff">строка «ок, доехало 0» — токен соврал, а вызывающий записал себе успешную выплату</text>
      <text x={30} y={292} fontSize={12.5} fill={ACCENT}>на обычном токене безопасный перевод не просто надёжнее — он ещё и дешевле ручной проверки</text>
    </Panel>
  ),
};
