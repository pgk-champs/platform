import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Уязвимости»: ход повторного входа, правильный порядок
 * операций и то, что private не скрывает данные. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const auditVulnsSchemes: Schemes = {
  'av-reentrancy': (aria) => (
    <Panel id="fig-av-reent" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВНЕС 1 ETH, ЗАБРАЛ 5</text>

      {[
        { y: 62, n: '1', t: 'нападающий вносит 1 ETH', s: 'запись банка: 1.0', ok: null },
        { y: 102, n: '2', t: 'зовёт withdraw', s: 'банк читает запись: 1.0', ok: null },
        { y: 142, n: '3', t: 'банк отправляет 1 ETH', s: 'управление ушло к нападающему', ok: false },
        { y: 182, n: '4', t: 'тот сразу зовёт withdraw снова', s: 'запись всё ещё 1.0 — не обнулена', ok: false },
        { y: 222, n: '…', t: 'и так четыре круга', s: 'в банке было 11, стало 6', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 22} fontSize={12} fontFamily={MONO} fill={FADE}>{r.n}</text>
          <rect x={54} y={r.y} width={330} height={32} rx={8}
            fill={r.ok === false ? 'rgba(255,140,140,0.14)' : 'rgba(0,0,0,0.26)'}
            stroke={r.ok === false ? RED : INK} strokeWidth={1.6} />
          <text x={70} y={r.y + 21} fontSize={11} fill={r.ok === false ? RED_TEXT : '#fff'}>{r.t}</text>
          <text x={404} y={r.y + 21} fontSize={11} fontFamily={MONO} fill={FADE}>{r.s}</text>
        </g>
      ))}

      <text x={30} y={276} fontSize={12.5} fill="#fff">на счету нападающего оказалось 5 ETH при взносе 1: четыре эфира — чужие вклады</text>
      <text x={30} y={296} fontSize={12.5} fill={FADE}>исправленная версия того же банка сорвала нападение на первом же повторном входе</text>
    </Panel>
  ),

  'av-cei': (aria) => (
    <Panel id="fig-av-cei" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ КОД, РАЗНЫЙ ПОРЯДОК ДВУХ СТРОК</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fill="#fff">уязвимо</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>amount = balances[msg.sender];</text>
      <text x={50} y={142} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>msg.sender.call{'{'}value: amount{'}'}("");</text>
      <text x={50} y={164} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>balances[msg.sender] = 0;</text>
      <text x={50} y={194} fontSize={11} fill={RED_TEXT}>чужой код выполняется до записи</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fill="#fff">безопасно</text>
      <text x={440} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>amount = balances[msg.sender];</text>
      <text x={440} y={142} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>balances[msg.sender] = 0;</text>
      <text x={440} y={164} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>msg.sender.call{'{'}value: amount{'}'}("");</text>
      <text x={440} y={194} fontSize={11} fill={ACCENT}>к моменту чужого кода запись уже ноль</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">порядок один и тот же всегда: сначала проверки, потом запись в хранилище, и только потом вызовы наружу</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>любой перевод эфира — это вызов чужого кода: у получателя может быть своя функция приёма</text>
    </Panel>
  ),

  'av-storage': (aria) => (
    <Panel id="fig-av-stor" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>PRIVATE НЕ ЗНАЧИТ «СЕКРЕТНО»</text>

      <text x={30} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>uint256 private pin;  bytes32 private passHash;</text>

      {[
        { y: 84, n: 'слот 0', v: '0x…f39fd6e51aad88f6f4ce6ab8827279cfffb92266', d: 'owner' },
        { y: 128, n: 'слот 1', v: '0x…000758ec = 481516', d: 'тот самый private pin' },
        { y: 172, n: 'слот 2', v: '0x9e72890ae3467cac7f1db82584af2c95…', d: 'private passHash, совпал побайтно' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={94} height={32} rx={8} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={46} y={r.y + 21} fontSize={11} fontFamily={MONO} fill="#fff">{r.n}</text>
          <text x={142} y={r.y + 21} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{r.v}</text>
          <text x={142} y={r.y + 38} fontSize={10.5} fill={RED_TEXT}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={240} fontSize={12.5} fill="#fff">хранилище контракта читает кто угодно одним запросом к узлу: слово private прячет данные только от других контрактов</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>секрета в сети быть не может; хранят только хеш, а само значение раскрывают, когда оно уже не тайна</text>
    </Panel>
  ),
};
