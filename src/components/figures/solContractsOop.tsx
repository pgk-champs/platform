import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Контракт как объект»: два развёртывания одного кода,
 * enum как число и таблица доступа при правильном и перевёрнутом условии. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solContractsOopSchemes: Schemes = {
  'sco-two-instances': (aria) => (
    <Panel id="fig-sco-two" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН КОД, ДВА РАЗВЁРТЫВАНИЯ — ДВА РАЗНЫХ ОБЪЕКТА</text>

      <rect x={310} y={64} width={200} height={46} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={410} y={92} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">Counter.sol</text>

      <Arrow x1={330} y1={116} x2={200} y2={150} color={ACCENT} w={2.5} />
      <Arrow x1={490} y1={116} x2={620} y2={150} color={ACCENT} w={2.5} />

      {[
        { x: 30, who: 'развернула Алиса', addr: '0x5FbD…0aa3', owner: 'owner = Алиса', cnt: 'count = 3' },
        { x: 450, who: 'развернул Боб', addr: '0x8464…18BC', owner: 'owner = Боб', cnt: 'count = 0' },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={154} width={340} height={100} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
          <text x={c.x + 20} y={180} fontSize={12} fill="#fff">{c.who}</text>
          <text x={c.x + 20} y={204} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{c.addr}</text>
          <text x={c.x + 20} y={226} fontSize={11.5} fontFamily={MONO} fill={FADE}>{c.owner}</text>
          <text x={c.x + 20} y={246} fontSize={11.5} fontFamily={MONO} fill={FADE}>{c.cnt}</text>
        </g>
      ))}

      <text x={30} y={282} fontSize={12.5} fill="#fff">газ развёртывания одинаков — 257 464: байткод один. Различаются адрес и память</text>
      <text x={30} y={304} fontSize={12.5} fill={RED_TEXT}>при new Counter() из другого контракта owner дочернего — адрес контракта-создателя, а не человека</text>
    </Panel>
  ),

  'sco-enum-numbers': (aria) => (
    <Panel id="fig-sco-enum" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ENUM — ЭТО ИМЕНА ПОВЕРХ ЧИСЕЛ 0…3</text>

      {[
        { x: 30, n: '0', t: 'User', def: true },
        { x: 220, n: '1', t: 'publicProvider', def: false },
        { x: 410, n: '2', t: 'privateProvider', def: false },
        { x: 600, n: '3', t: 'Owner', def: false },
      ].map((e) => (
        <g key={e.n}>
          <rect x={e.x} y={66} width={170} height={64} rx={11}
            fill={e.def ? SOFT : 'rgba(0,0,0,0.28)'} stroke={e.def ? ACCENT : INK} strokeWidth={2.5} />
          <text x={e.x + 85} y={94} textAnchor="middle" fontSize={11.5} fill="#fff">{e.t}</text>
          <text x={e.x + 85} y={118} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={e.def ? ACCENT : FADE}>= {e.n}</text>
        </g>
      ))}
      <text x={115} y={150} textAnchor="middle" fontSize={11} fill={ACCENT}>значение по умолчанию</text>

      <rect x={30} y={172} width={370} height={72} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={198} fontSize={11.5} fontFamily={MONO} fill="#fff">Role(4) внутри контракта</text>
      <text x={50} y={222} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>panic code 0x21 — значение вне диапазона</text>

      <rect x={420} y={172} width={370} height={72} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={440} y={198} fontSize={11.5} fontFamily={MONO} fill="#fff">setRole(4) снаружи</text>
      <text x={440} y={222} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>откат вообще без данных: ни строки, ни паники</text>

      <text x={30} y={272} fontSize={12.5} fill="#fff">снаружи параметр-enum виден как uint8: проверка диапазона срабатывает при разборе аргументов</text>
      <text x={30} y={294} fontSize={12.5} fill={FADE}>отсюда правило: нулевой вариант должен быть самым безопасным — гость, а не владелец</text>
    </Panel>
  ),

  'sco-access-table': (aria) => (
    <Panel id="fig-sco-access" w={820} h={330} aria={aria}>
      <text x={30} y={34} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН СИМВОЛ В МОДИФИКАТОРЕ — ЗЕРКАЛЬНАЯ ТАБЛИЦА ДОСТУПА</text>

      <text x={210} y={62} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>role == _role</text>
      <text x={610} y={62} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={RED_TEXT}>role != _role (эталон КЗ)</text>

      {[
        { y: 76, who: 'owner', ok: [true, false, false], bad: [false, true, true] },
        { y: 132, who: 'pubProv', ok: [false, true, false], bad: [true, false, true] },
        { y: 188, who: 'privProv', ok: [false, false, true], bad: [true, true, false] },
        { y: 244, who: 'stranger', ok: [false, false, false], bad: [true, true, true] },
      ].map((r) => (
        <g key={r.who}>
          <text x={30} y={r.y + 30} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.who}</text>
          {r.ok.map((v, i) => (
            <rect key={`ok${i}`} x={120 + i * 58} y={r.y + 12} width={50} height={26} rx={6}
              fill={v ? SOFT : 'rgba(0,0,0,0.28)'} stroke={v ? ACCENT : INK} strokeWidth={1.8} />
          ))}
          {r.bad.map((v, i) => (
            <rect key={`bad${i}`} x={520 + i * 58} y={r.y + 12} width={50} height={26} rx={6}
              fill={v ? 'rgba(255,140,140,0.22)' : 'rgba(0,0,0,0.28)'} stroke={v ? RED : INK} strokeWidth={1.8} />
          ))}
        </g>
      ))}

      <text x={296} y={300} textAnchor="middle" fontSize={11.5} fill={ACCENT}>диагональ: каждый — в свою функцию</text>
      <text x={640} y={300} textAnchor="middle" fontSize={11.5} fill={RED_TEXT}>инверсия: прошли 3 из 4</text>

      <text x={30} y={322} fontSize={12.5} fill="#fff">в перевёрнутом варианте единственный отказ получает сам владелец, а посторонний проходит везде</text>
    </Panel>
  ),
};
