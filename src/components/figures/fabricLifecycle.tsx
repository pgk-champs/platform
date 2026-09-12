import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Жизненный цикл чейнкода»: пять шагов установки,
 * что такое идентификатор пакета и чем версия отличается от номера правки. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const fabricLifecycleSchemes: Schemes = {
  'fl-five-steps': (aria) => (
    <Panel id="fig-fl-steps" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПЯТЬ ШАГОВ: ТРИ ЛОКАЛЬНЫХ, ДВА ОБЩИХ</text>

      {[
        { y: 62, n: '1', c: 'package', w: 'у себя', d: 'собрать .tar.gz из исходников', org: false },
        { y: 110, n: '2', c: 'install', w: 'на каждом пире', d: 'положить пакет на узел', org: false },
        { y: 158, n: '3', c: 'approveformyorg', w: 'от каждой организации', d: 'записать согласие в канал', org: true },
        { y: 206, n: '4', c: 'checkcommitreadiness', w: 'проверка', d: 'кто уже согласился', org: true },
        { y: 254, n: '5', c: 'commit', w: 'один раз на канал', d: 'определение вступает в силу', org: true },
      ].map((r) => (
        <g key={r.y}>
          <circle cx={48} cy={r.y + 18} r={15} fill={r.org ? SOFT : 'rgba(0,0,0,0.3)'} stroke={r.org ? ACCENT : INK} strokeWidth={2} />
          <text x={48} y={r.y + 23} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{r.n}</text>
          <text x={80} y={r.y + 15} fontSize={12} fontFamily={MONO} fill={r.org ? ACCENT : '#fff'}>{r.c}</text>
          <text x={80} y={r.y + 32} fontSize={10.5} fill={FADE}>{r.w}</text>
          <text x={400} y={r.y + 24} fontSize={12} fill={r.org ? '#fff' : FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={310} fontSize={12.5} fill="#fff">шаги 1–2 никто кроме вас не видит; шаги 3–5 — это транзакции, они попадают в цепочку</text>
    </Panel>
  ),

  'fl-package-id': (aria) => (
    <Panel id="fig-fl-pid" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИДЕНТИФИКАТОР ПАКЕТА — ЭТО ОТПЕЧАТОК КОДА</text>

      <rect x={30} y={64} width={230} height={56} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={48} y={88} fontSize={11} fontFamily={MONO} fill="#fff">zachetka.tar.gz</text>
      <text x={48} y={108} fontSize={10.5} fill={FADE}>исходники + метка</text>

      <Arrow x1={272} y1={92} x2={330} y2={92} color={ACCENT} w={2.5} />

      <rect x={344} y={64} width={446} height={56} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={362} y={88} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>zachetka_1.0:8853d6701bcad0b97bbb6ef7…</text>
      <text x={362} y={108} fontSize={10.5} fill={FADE}>метка : хеш содержимого пакета</text>

      <text x={30} y={158} fontSize={12.5} fill="#fff">одинаковый пакет даёт одинаковый идентификатор на обоих пирах — это и есть проверка,</text>
      <text x={30} y={178} fontSize={12.5} fill={FADE}>что организации одобряют один и тот же код, а не два похожих</text>

      <rect x={30} y={200} width={760} height={62} rx={10} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.8} />
      <text x={50} y={226} fontSize={11.5} fill={RED_TEXT}>пересобрали проект и упаковали заново — идентификатор сменился</text>
      <text x={50} y={248} fontSize={11.5} fill={FADE}>одобрение со старым идентификатором станет недействительным, придётся одобрять снова</text>
    </Panel>
  ),

  'fl-sequence': (aria) => (
    <Panel id="fig-fl-seq" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВЕРСИЯ — ДЛЯ ЛЮДЕЙ, НОМЕР ПРАВКИ — ДЛЯ СЕТИ</text>

      <rect x={30} y={64} width={370} height={124} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">--version 1.0</text>
      <text x={50} y={116} fontSize={11} fill={FADE}>любая строка: 1.0, 2.3-beta, «после аудита»</text>
      <text x={50} y={142} fontSize={11} fill={FADE}>сеть её не проверяет и ничего по ней не решает</text>
      <text x={50} y={168} fontSize={11} fill={FADE}>нужна, чтобы люди понимали, что установлено</text>

      <rect x={420} y={64} width={370} height={124} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">--sequence 1</text>
      <text x={440} y={116} fontSize={11} fill={ACCENT}>целое число, растёт строго на единицу</text>
      <text x={440} y={142} fontSize={11} fill={FADE}>сеть по нему отличает одно определение от другого</text>
      <text x={440} y={168} fontSize={11} fill={FADE}>повторить прежний номер нельзя</text>

      <text x={30} y={224} fontSize={12.5} fill="#fff">обновление кода — это те же пять шагов с номером на единицу больше</text>
      <text x={30} y={248} fontSize={12.5} fill={FADE}>старый контейнер гасится сам, новый поднимается при первом вызове</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>состояние при обновлении не трогается: ключи остаются, меняется только код над ними</text>
    </Panel>
  ),
};
